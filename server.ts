import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { requireAuth, type AuthRequest } from "./src/middleware/auth.ts";
import { getOrCreateUser, getUserProfile, updateUserProfile } from "./src/db/users.ts";
import { db } from "./src/db/index.ts";
import { tips, creatorStats, pesapalOrders } from "./src/db/schema.ts";
import { desc, eq, sql } from "drizzle-orm";
import {
  submitPesapalOrder,
  getPesapalTransactionStatus,
  getNotificationId,
} from "./src/lib/pesapal.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "visor-stream", db: "cloud-sql", pesapal: "v3" });
  });

  // ==========================================
  // PESAPAL V3 PAYMENT GATEWAY ROUTES
  // ==========================================

  // 1. Initiate Pesapal Order Checkout
  app.post("/api/payments/checkout", async (req, res) => {
    try {
      const {
        amount,
        currency = "UGX",
        email = "customer@visorstream.com",
        phone = "",
        creatorId = "me",
        streamId,
        type = "subscription",
        planId,
        description,
        userId,
        firstName = "Visor",
        lastName = "User",
      } = req.body || {};

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ error: "Invalid payment amount" });
      }

      // Unique Merchant Reference
      const merchantReference = `VSR-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Derive app URL for callbacks
      const origin = req.get("origin") || req.get("host") || "";
      const protocol = req.secure || req.get("x-forwarded-proto") === "https" ? "https" : "http";
      const appUrl = (
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.APP_URL ||
        (origin.startsWith("http") ? origin : `${protocol}://${origin}`) ||
        "https://visor-stream.vercel.app"
      ).replace(/\/$/, "");

      const callbackUrl = `${appUrl}/api/payments/callback`;
      const notificationId = await getNotificationId(appUrl);

      // Submit Order to Pesapal v3 REST API
      const pesapalRes = await submitPesapalOrder({
        merchantReference,
        amount: numAmount,
        currency,
        description: description || `Visor Stream ${type === "tip" ? "Live Stream Tip" : "Subscription"}`,
        callbackUrl,
        notificationId,
        email,
        phone,
        firstName,
        lastName,
      });

      // Calculate initial 70/30 revenue allocation
      const creatorEarnings = (numAmount * 0.7).toFixed(2);
      const platformEarnings = (numAmount * 0.3).toFixed(2);

      // Save order in Cloud SQL database as 'PENDING'
      try {
        await db.insert(pesapalOrders).values({
          merchantReference,
          orderTrackingId: pesapalRes.order_tracking_id,
          type,
          planId: planId || null,
          userId: userId || null,
          creatorId: creatorId || null,
          streamId: streamId || null,
          amount: String(numAmount),
          currency,
          status: "PENDING",
          description: description || null,
          email,
          phone,
          creatorEarnings,
          platformEarnings,
        });
      } catch (dbErr) {
        console.warn("Could not record order in database immediately (proceeding with Pesapal redirect):", dbErr);
      }

      res.json({
        success: true,
        redirectUrl: pesapalRes.redirect_url,
        orderTrackingId: pesapalRes.order_tracking_id,
        merchantReference,
      });
    } catch (error: any) {
      console.error("Pesapal Checkout Error:", error);
      res.status(500).json({ error: error.message || "Failed to initiate Pesapal payment" });
    }
  });

  // 2. Pesapal IPN Webhook Listener
  app.post("/api/payments/ipn", async (req, res) => {
    try {
      const {
        OrderTrackingId,
        OrderMerchantReference,
        OrderNotificationType,
        orderTrackingId = OrderTrackingId,
        orderMerchantReference = OrderMerchantReference,
      } = req.body || {};

      const trackingId = orderTrackingId || OrderTrackingId;
      const merchantRef = orderMerchantReference || OrderMerchantReference;

      if (!trackingId) {
        return res.status(400).json({ error: "Missing orderTrackingId in IPN payload" });
      }

      console.log(`[PESAPAL IPN RECEIVED] Tracking ID: ${trackingId}, Ref: ${merchantRef}`);

      // Query live transaction status directly from Pesapal
      const statusData = await getPesapalTransactionStatus(trackingId);
      const isCompleted =
        statusData.payment_status_description?.toLowerCase() === "completed" ||
        statusData.status_code === 1;

      if (isCompleted) {
        const totalAmount = statusData.amount || 0;
        const creatorShare = (totalAmount * 0.7).toFixed(2);
        const platformShare = (totalAmount * 0.3).toFixed(2);

        // Update database order to COMPLETED
        try {
          if (merchantRef) {
            await db
              .update(pesapalOrders)
              .set({
                status: "COMPLETED",
                orderTrackingId: trackingId,
                paymentMethod: statusData.payment_method || null,
                creatorEarnings: creatorShare,
                platformEarnings: platformShare,
                pesapalConfirmationCode: statusData.confirmation_code || null,
                updatedAt: new Date(),
              })
              .where(eq(pesapalOrders.merchantReference, merchantRef));
          }
        } catch (dbErr) {
          console.error("Failed to update completed order in DB:", dbErr);
        }

        console.log(`[PESAPAL IPN COMPLETED] Order: ${merchantRef}, Creator 70% Share: ${creatorShare} ${statusData.currency || "UGX"}`);
      }

      // Standard Pesapal IPN Response contract
      res.status(200).json({
        orderNotificationType: OrderNotificationType || "IPNCHANGE",
        orderTrackingId: trackingId,
        orderMerchantReference: merchantRef,
        status: 200,
      });
    } catch (error: any) {
      console.error("Pesapal IPN Error:", error);
      res.status(500).json({ error: error.message || "Failed to process IPN" });
    }
  });

  // 3. Pesapal Callback Redirect Handler (When user returns from payment page)
  app.get("/api/payments/callback", async (req, res) => {
    try {
      const orderTrackingId = (req.query.OrderTrackingId || req.query.orderTrackingId) as string;
      const orderMerchantReference = (req.query.OrderMerchantReference || req.query.orderMerchantReference) as string;

      if (!orderTrackingId) {
        return res.redirect("/?payment=error&message=No+tracking+id");
      }

      // Verify status with Pesapal
      let isSuccess = false;
      let statusData: any = {};
      try {
        statusData = await getPesapalTransactionStatus(orderTrackingId);
        isSuccess =
          statusData.payment_status_description?.toLowerCase() === "completed" ||
          statusData.status_code === 1;

        if (isSuccess && orderMerchantReference) {
          const totalAmount = statusData.amount || 0;
          const creatorShare = (totalAmount * 0.7).toFixed(2);
          const platformShare = (totalAmount * 0.3).toFixed(2);

          await db
            .update(pesapalOrders)
            .set({
              status: "COMPLETED",
              orderTrackingId,
              paymentMethod: statusData.payment_method || null,
              creatorEarnings: creatorShare,
              platformEarnings: platformShare,
              pesapalConfirmationCode: statusData.confirmation_code || null,
              updatedAt: new Date(),
            })
            .where(eq(pesapalOrders.merchantReference, orderMerchantReference));
        }
      } catch (checkErr) {
        console.warn("Status check during callback warning:", checkErr);
      }

      const redirectPath = isSuccess
        ? `/?payment=success&orderId=${encodeURIComponent(orderMerchantReference || "")}&trackingId=${encodeURIComponent(orderTrackingId)}&amount=${statusData.amount || ""}&currency=${encodeURIComponent(statusData.currency || "UGX")}`
        : `/?payment=pending&orderId=${encodeURIComponent(orderMerchantReference || "")}&trackingId=${encodeURIComponent(orderTrackingId)}`;

      res.redirect(redirectPath);
    } catch (error: any) {
      console.error("Pesapal Callback Error:", error);
      res.redirect("/?payment=error");
    }
  });

  // 4. Query Pesapal Transaction Status
  app.get("/api/payments/status/:orderTrackingId", async (req, res) => {
    try {
      const { orderTrackingId } = req.params;
      const status = await getPesapalTransactionStatus(orderTrackingId);
      res.json({ success: true, status });
    } catch (error: any) {
      console.error("Get Payment Status Error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch transaction status" });
    }
  });

  // User auth sync endpoint
  app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      const email = req.user?.email || "";
      const { displayName, photoUrl } = req.body || {};

      if (!uid) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await getOrCreateUser(uid, email, displayName, photoUrl);
      res.json({ success: true, user });
    } catch (error: any) {
      console.error("Auth sync error:", error);
      res.status(500).json({ error: error.message || "Failed to sync user" });
    }
  });

  // Get user profile
  app.get("/api/profile", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: "Unauthorized" });

      const profile = await getUserProfile(uid);
      res.json({ success: true, profile });
    } catch (error: any) {
      console.error("Get profile error:", error);
      res.status(500).json({ error: error.message || "Failed to get profile" });
    }
  });

  // Update user profile
  app.post("/api/profile", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) return res.status(401).json({ error: "Unauthorized" });

      const { gamerTag, bio, currency, momoPhone, momoProvider, dataSaver } = req.body || {};
      const updated = await updateUserProfile(uid, {
        gamerTag,
        bio,
        currency,
        momoPhone,
        momoProvider,
        dataSaver,
      });

      res.json({ success: true, profile: updated });
    } catch (error: any) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: error.message || "Failed to update profile" });
    }
  });

  // Stream tips endpoint
  app.get("/api/tips/:streamId", async (req, res) => {
    try {
      const { streamId } = req.params;
      const streamTips = await db
        .select()
        .from(tips)
        .where(eq(tips.streamId, streamId))
        .orderBy(desc(tips.createdAt))
        .limit(50);
      res.json({ success: true, tips: streamTips });
    } catch (error: any) {
      console.error("Fetch tips error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch tips" });
    }
  });

  app.post("/api/tips", async (req, res) => {
    try {
      const { streamId, sender, senderUid, amount, currency, message, provider } = req.body || {};
      if (!streamId || !sender || !amount || !currency) {
        return res.status(400).json({ error: "Missing required tip fields" });
      }

      const inserted = await db
        .insert(tips)
        .values({
          streamId,
          sender,
          senderUid: senderUid || null,
          amount: String(amount),
          currency,
          message: message || null,
          provider: provider || null,
        })
        .returning();

      res.json({ success: true, tip: inserted[0] });
    } catch (error: any) {
      console.error("Save tip error:", error);
      res.status(500).json({ error: error.message || "Failed to save tip" });
    }
  });

  // Creator stats endpoint
  app.get("/api/creator/stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const stats = await db
        .select()
        .from(creatorStats)
        .where(eq(creatorStats.userId, userId))
        .limit(1);

      res.json({ success: true, stats: stats[0] || null });
    } catch (error: any) {
      console.error("Fetch creator stats error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch creator stats" });
    }
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VISOR Stream server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

