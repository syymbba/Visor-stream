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

  // 4. Query Pesapal Transaction Status (Supports route param or query param ?id=...)
  app.get("/api/payments/status/:orderTrackingId?", async (req, res) => {
    try {
      const trackingId =
        req.params.orderTrackingId ||
        (req.query.id as string) ||
        (req.query.trackingId as string) ||
        (req.query.OrderTrackingId as string);

      if (!trackingId) {
        return res.status(400).json({ error: "Missing orderTrackingId parameter" });
      }

      // 1. Fetch DB record
      let dbOrder = null;
      try {
        const orderRows = await db
          .select()
          .from(pesapalOrders)
          .where(eq(pesapalOrders.orderTrackingId, trackingId))
          .limit(1);
        dbOrder = orderRows[0] || null;
      } catch (dbErr) {
        console.warn("DB lookup error for status check:", dbErr);
      }

      // 2. Fetch live Pesapal status
      let pesapalStatus: any = null;
      try {
        pesapalStatus = await getPesapalTransactionStatus(trackingId);

        // If Pesapal reports completed but DB is still pending, update DB
        const isCompleted =
          pesapalStatus.payment_status_description?.toLowerCase() === "completed" ||
          pesapalStatus.status_code === 1;

        if (isCompleted && dbOrder && dbOrder.status !== "COMPLETED") {
          const totalAmount = pesapalStatus.amount || parseFloat(dbOrder.amount) || 0;
          const creatorShare = (totalAmount * 0.7).toFixed(2);
          const platformShare = (totalAmount * 0.3).toFixed(2);

          await db
            .update(pesapalOrders)
            .set({
              status: "COMPLETED",
              paymentMethod: pesapalStatus.payment_method || dbOrder.paymentMethod,
              creatorEarnings: creatorShare,
              platformEarnings: platformShare,
              pesapalConfirmationCode: pesapalStatus.confirmation_code || null,
              updatedAt: new Date(),
            })
            .where(eq(pesapalOrders.orderTrackingId, trackingId));
          
          dbOrder.status = "COMPLETED";
        }
      } catch (statusErr) {
        console.warn("Pesapal remote status check note:", statusErr);
      }

      res.json({
        success: true,
        order: dbOrder,
        status: pesapalStatus || (dbOrder ? { payment_status_description: dbOrder.status } : null),
      });
    } catch (error: any) {
      console.error("Get Payment Status Error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch transaction status" });
    }
  });

  // 5. Payment Transaction History API
  app.get("/api/payments/history", async (req, res) => {
    try {
      const { userId, creatorId, type, status, limit = "50" } = req.query;
      const numLimit = Math.min(100, Math.max(1, parseInt(limit as string) || 50));

      let query = db
        .select()
        .from(pesapalOrders)
        .orderBy(desc(pesapalOrders.createdAt))
        .limit(numLimit);

      const orders = await query;

      // Filter in memory if specific filter requested
      const filtered = orders.filter((o) => {
        if (userId && o.userId && o.userId !== userId) return false;
        if (creatorId && o.creatorId && o.creatorId !== creatorId && o.creatorId !== "me") return false;
        if (type && o.type !== type) return false;
        if (status && o.status !== status) return false;
        return true;
      });

      res.json({
        success: true,
        count: filtered.length,
        history: filtered.map((item) => ({
          id: item.merchantReference,
          merchantReference: item.merchantReference,
          orderTrackingId: item.orderTrackingId,
          type: item.type,
          planId: item.planId,
          userId: item.userId,
          creatorId: item.creatorId,
          streamId: item.streamId,
          amount: parseFloat(item.amount) || 0,
          currency: item.currency || "UGX",
          status: item.status,
          paymentMethod: item.paymentMethod || "Pesapal Mobile Money / Card",
          description: item.description,
          email: item.email,
          phone: item.phone,
          creatorEarnings: item.creatorEarnings ? parseFloat(item.creatorEarnings) : null,
          platformEarnings: item.platformEarnings ? parseFloat(item.platformEarnings) : null,
          confirmationCode: item.pesapalConfirmationCode,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
      });
    } catch (error: any) {
      console.error("Fetch Payment History Error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch payment history" });
    }
  });

  // 6. Real-Time Dynamic Wallet Balance API
  app.get("/api/wallet/balance", async (req, res) => {
    try {
      const { userId = "me" } = req.query;

      // Fetch all completed orders from database
      const completedOrders = await db
        .select()
        .from(pesapalOrders)
        .where(eq(pesapalOrders.status, "COMPLETED"));

      // Conversion rates standard for Visor Stream
      // 1 USD = 3,750 UGX | 130 KES | 2,600 TZS
      const toUSD = (amt: number, curr: string): number => {
        const c = (curr || "UGX").toUpperCase();
        if (c === "USD") return amt;
        if (c === "UGX") return amt / 3750;
        if (c === "KES") return amt / 130;
        if (c === "TZS") return amt / 2600;
        return amt / 3750;
      };

      let totalGrossUSD = 0;
      let totalCreatorEarningsUSD = 0;
      let totalPlatformFeesUSD = 0;
      let completedTipsCount = 0;
      let completedSubsCount = 0;

      completedOrders.forEach((order) => {
        const rawAmt = parseFloat(order.amount) || 0;
        const amtUSD = toUSD(rawAmt, order.currency);
        totalGrossUSD += amtUSD;

        if (order.type === "subscription") {
          completedSubsCount += 1;
          // 70% to creator, 30% platform
          totalCreatorEarningsUSD += amtUSD * 0.7;
          totalPlatformFeesUSD += amtUSD * 0.3;
        } else if (order.type === "tip") {
          completedTipsCount += 1;
          // Tips go 100% (or 95%) to creator
          totalCreatorEarningsUSD += amtUSD;
        } else {
          totalCreatorEarningsUSD += amtUSD * 0.7;
          totalPlatformFeesUSD += amtUSD * 0.3;
        }
      });

      const netBalanceUSD = Math.max(0, Math.round(totalCreatorEarningsUSD * 100) / 100);
      const netBalanceUGX = Math.round(netBalanceUSD * 3750);
      const netBalanceKES = Math.round(netBalanceUSD * 130);
      const netBalanceTZS = Math.round(netBalanceUSD * 2600);

      res.json({
        success: true,
        balanceUSD: netBalanceUSD,
        balanceUGX: netBalanceUGX,
        balanceKES: netBalanceKES,
        balanceTZS: netBalanceTZS,
        totalRevenueUSD: Math.round(totalGrossUSD * 100) / 100,
        creatorEarningsUSD: netBalanceUSD,
        platformFeesUSD: Math.round(totalPlatformFeesUSD * 100) / 100,
        totalSubscribers: completedSubsCount,
        totalTipsCount: completedTipsCount,
        completedOrdersCount: completedOrders.length,
        currencyRates: {
          UGX: 3750,
          KES: 130,
          TZS: 2600,
          USD: 1,
        },
      });
    } catch (error: any) {
      console.error("Fetch Wallet Balance Error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch wallet balance" });
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

