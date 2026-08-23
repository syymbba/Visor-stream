import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { requireAuth, type AuthRequest } from "./src/middleware/auth.ts";
import { getOrCreateUser, getUserProfile, updateUserProfile } from "./src/db/users.ts";
import { db } from "./src/db/index.ts";
import { tips, creatorStats, pesapalOrders, payoutRequests } from "./src/db/schema.ts";
import { desc, eq, sql } from "drizzle-orm";
import {
  submitPesapalOrder,
  getPesapalTransactionStatus,
  getNotificationId,
  normalizePesapalStatus,
} from "./src/lib/pesapal.ts";

// In-memory buffer of recent IPN notifications for real-time audit & debugging
interface IPNLogEntry {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  trackingId?: string;
  merchantRef?: string;
  notificationType?: string;
  status: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  confirmationCode?: string;
  rawPayload: any;
  result: 'SUCCESS' | 'WARNING' | 'ERROR';
  details?: string;
}

const ipnLogsBuffer: IPNLogEntry[] = [];
function logIPN(entry: Omit<IPNLogEntry, 'id' | 'timestamp'>) {
  const fullEntry: IPNLogEntry = {
    id: `ipn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  ipnLogsBuffer.unshift(fullEntry);
  if (ipnLogsBuffer.length > 100) {
    ipnLogsBuffer.pop();
  }
  return fullEntry;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  if (process.env.NODE_ENV === "production" &&
      (!process.env.PESAPAL_CONSUMER_KEY || !process.env.PESAPAL_CONSUMER_SECRET)) {
    throw new Error("PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET are required in production");
  }

  const requestCounts = new Map<string, { count: number; resetAt: number }>();
  const RATE_WINDOW_MS = 60_000;
  const RATE_LIMIT = 120;
  app.use("/api", (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const current = requestCounts.get(key);
    if (!current || current.resetAt <= now) {
      requestCounts.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
      return next();
    }
    current.count += 1;
    if (current.count > RATE_LIMIT) {
      return res.status(429).json({ error: "Too many requests" });
    }
    next();
  });

  app.use(express.json({ limit: "100kb" }));
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    next();
  });

  // Vercel Analytics / Speed Insights stub for container & preview environments
  app.all("/_vercel/*", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "visor-stream", db: "cloud-sql", pesapal: "v3" });
  });

  // ==========================================
  // PESAPAL V3 PAYMENT GATEWAY ROUTES
  // ==========================================

  // 1. Initiate Pesapal Order Checkout
  app.post("/api/payments/checkout", requireAuth, async (req: AuthRequest, res) => {
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

      const numAmount = Number(amount);
      if (!Number.isFinite(numAmount) || numAmount <= 0 || numAmount > 100000000) {
        return res.status(400).json({ error: "Invalid payment amount" });
      }
      if (!['UGX', 'KES', 'TZS', 'USD'].includes(String(currency).toUpperCase())) {
        return res.status(400).json({ error: "Unsupported currency" });
      }
      if (!['subscription', 'tip', 'topup'].includes(type)) {
        return res.status(400).json({ error: "Unsupported payment type" });
      }

      const authenticatedUserId = req.user!.uid;

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
          userId: authenticatedUserId,
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

  // 2. Enhanced Pesapal IPN & IDN Webhook Listener (Accepts both POST & GET across multiple aliases)
  const handlePesapalWebhook = async (req: express.Request, res: express.Response) => {
    const startTime = Date.now();
    const payload = { ...req.query, ...req.body };
    const trackingId =
      payload.OrderTrackingId ||
      payload.orderTrackingId ||
      payload.order_tracking_id ||
      payload.OrderTrackingID;
    const merchantRef =
      payload.OrderMerchantReference ||
      payload.orderMerchantReference ||
      payload.merchant_reference ||
      payload.OrderMerchantRef;
    const notificationType =
      payload.OrderNotificationType ||
      payload.orderNotificationType ||
      payload.notification_type ||
      "IPNCHANGE";

    console.log(`[PESAPAL IPN/IDN WEBHOOK] Method: ${req.method}, Path: ${req.path}`);
    console.log(`[PESAPAL IPN/IDN PAYLOAD] Tracking ID: ${trackingId}, Merchant Ref: ${merchantRef}`);

    if (!trackingId) {
      logIPN({
        method: req.method,
        path: req.path,
        trackingId: undefined,
        merchantRef: merchantRef,
        notificationType,
        status: 'AWAITING_TRACKING_ID',
        rawPayload: payload,
        result: 'WARNING',
        details: 'Received webhook ping without OrderTrackingId parameter',
      });

      return res.status(200).json({
        orderNotificationType: notificationType,
        orderTrackingId: null,
        orderMerchantReference: merchantRef || null,
        status: 200,
        message: "Awaiting tracking ID parameter",
      });
    }

    try {
      // 1. Query live transaction status directly from Pesapal
      let statusData: any = {};
      let queryError: string | null = null;

      try {
        statusData = await getPesapalTransactionStatus(trackingId);
      } catch (remoteErr: any) {
        queryError = remoteErr.message || String(remoteErr);
        console.warn("[PESAPAL IPN REMOTE STATUS WARN]", queryError);
      }

      // Normalize status using helper
      const { isCompleted, isFailed, standardStatus } = normalizePesapalStatus(statusData);

      const totalAmount = typeof statusData.amount === 'number' ? statusData.amount : 0;
      const currency = statusData.currency || 'UGX';
      const paymentMethod = statusData.payment_method || 'Mobile Money / Card';
      const confirmationCode = statusData.confirmation_code || null;
      const creatorShare = (totalAmount * 0.7).toFixed(2);
      const platformShare = (totalAmount * 0.3).toFixed(2);

      // 2. Fetch existing DB order if present
      let existingOrder: any = null;
      try {
        if (merchantRef) {
          const rows = await db
            .select()
            .from(pesapalOrders)
            .where(eq(pesapalOrders.merchantReference, merchantRef))
            .limit(1);
          existingOrder = rows[0] || null;
        }
        if (!existingOrder && trackingId) {
          const rows = await db
            .select()
            .from(pesapalOrders)
            .where(eq(pesapalOrders.orderTrackingId, trackingId))
            .limit(1);
          existingOrder = rows[0] || null;
        }
      } catch (dbReadErr) {
        console.warn("DB Read error during IPN check:", dbReadErr);
      }

      if (!existingOrder) {
        logIPN({
          method: req.method,
          path: req.path,
          trackingId,
          merchantRef,
          notificationType,
          status: 'UNKNOWN_ORDER',
          rawPayload: payload,
          result: 'WARNING',
          details: 'Ignored webhook for an order that was not created by Visor',
        });
        return res.status(200).json({
          orderNotificationType: notificationType,
          orderTrackingId: trackingId,
          orderMerchantReference: merchantRef || null,
          status: 200,
        });
      }

      if (statusData.merchant_reference && statusData.merchant_reference !== existingOrder.merchantReference) {
        return res.status(400).json({ error: 'Payment reference mismatch' });
      }

      const wasAlreadyCompleted = existingOrder.status === 'COMPLETED';

      // 3. Upsert order in database
      try {
        if (existingOrder) {
          const effectiveAmount = totalAmount > 0 ? String(totalAmount) : existingOrder.amount;
          const effectiveAmtNum = parseFloat(effectiveAmount) || 0;
          const calcCreatorShare = (effectiveAmtNum * 0.7).toFixed(2);
          const calcPlatformShare = (effectiveAmtNum * 0.3).toFixed(2);

          await db
            .update(pesapalOrders)
            .set({
              status: standardStatus,
              orderTrackingId: trackingId,
              paymentMethod: paymentMethod || existingOrder.paymentMethod,
              creatorEarnings: isCompleted ? calcCreatorShare : existingOrder.creatorEarnings,
              platformEarnings: isCompleted ? calcPlatformShare : existingOrder.platformEarnings,
              pesapalConfirmationCode: confirmationCode || existingOrder.pesapalConfirmationCode,
              updatedAt: new Date(),
            })
            .where(eq(pesapalOrders.id, existingOrder.id));

          // If this was a tip and is now completed, ensure recorded in tips table
          if (isCompleted && !wasAlreadyCompleted && existingOrder.type === 'tip' && existingOrder.streamId) {
            try {
              await db.insert(tips).values({
                streamId: existingOrder.streamId,
                sender: existingOrder.email?.split('@')[0] || 'Super Supporter',
                senderUid: existingOrder.userId || null,
                amount: effectiveAmount,
                currency: existingOrder.currency || currency,
                message: existingOrder.description || 'Super Tip via Pesapal Mobile Money',
                provider: paymentMethod,
              });
            } catch (tipInsertErr) {
              console.warn("Could not insert stream tip row during IPN sync:", tipInsertErr);
            }
          }
        }
      } catch (dbErr) {
        console.error("Failed to persist IPN status in DB:", dbErr);
      }

      // Log IPN event for audit trail
      logIPN({
        method: req.method,
        path: req.path,
        trackingId,
        merchantRef: merchantRef || existingOrder?.merchantReference,
        notificationType,
        status: standardStatus,
        amount: totalAmount,
        currency,
        paymentMethod,
        confirmationCode: confirmationCode || undefined,
        rawPayload: payload,
        result: isCompleted ? 'SUCCESS' : isFailed ? 'WARNING' : 'SUCCESS',
        details: `Processed in ${Date.now() - startTime}ms. Status: ${standardStatus}. Confirmation: ${confirmationCode || 'N/A'}`,
      });

      console.log(
        `[PESAPAL IPN PROCESSED] ${merchantRef || trackingId} -> ${standardStatus}. Code: ${confirmationCode || 'None'}`
      );

      // Conforms to official Pesapal v3 IPN webhook response specification
      return res.status(200).json({
        orderNotificationType: notificationType,
        orderTrackingId: trackingId,
        orderMerchantReference: merchantRef || existingOrder?.merchantReference || null,
        status: 200,
      });
    } catch (error: any) {
      console.error("Pesapal IPN Webhook Processing Error:", error);

      logIPN({
        method: req.method,
        path: req.path,
        trackingId,
        merchantRef,
        notificationType,
        status: 'ERROR',
        rawPayload: payload,
        result: 'ERROR',
        details: error.message || 'Internal webhook error',
      });

      return res.status(200).json({
        orderNotificationType: notificationType || "IPNCHANGE",
        orderTrackingId: trackingId || null,
        orderMerchantReference: merchantRef || null,
        status: 200,
        error: error.message,
      });
    }
  };

  // Mount IPN webhook handlers on multiple endpoints
  app.post("/api/payments/ipn", handlePesapalWebhook);
  app.get("/api/payments/ipn", handlePesapalWebhook);
  app.post("/api/pesapal/ipn", handlePesapalWebhook);
  app.get("/api/pesapal/ipn", handlePesapalWebhook);
  app.post("/api/pesapal/webhook", handlePesapalWebhook);
  app.get("/api/pesapal/webhook", handlePesapalWebhook);
  app.post("/api/pesapal/idn-webhook", handlePesapalWebhook);
  app.get("/api/pesapal/idn-webhook", handlePesapalWebhook);
  app.post("/api/payments/idn", handlePesapalWebhook);
  app.get("/api/payments/idn", handlePesapalWebhook);

  // Manual IPN Reconciliation Endpoint (Re-checks any pending order with Pesapal)
  app.post("/api/payments/reconcile", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { orderTrackingId, merchantReference } = req.body || {};
      if (!orderTrackingId && !merchantReference) {
        return res.status(400).json({ error: "Missing orderTrackingId or merchantReference" });
      }

      // Look up tracking ID from DB if only merchant reference provided
      let trackingId = orderTrackingId;
      let orderRecord: any = null;

      if (merchantReference) {
        const rows = await db
          .select()
          .from(pesapalOrders)
          .where(eq(pesapalOrders.merchantReference, merchantReference))
          .limit(1);
        orderRecord = rows[0] || null;
        if (orderRecord?.orderTrackingId && !trackingId) {
          trackingId = orderRecord.orderTrackingId;
        }
      }

      if (!trackingId) {
        return res.status(400).json({ error: "No Pesapal tracking ID associated with this reference" });
      }
      if (!orderRecord || (orderRecord.userId && orderRecord.userId !== req.user?.uid) && (orderRecord.creatorId && orderRecord.creatorId !== req.user?.uid)) {
        return res.status(404).json({ error: "Payment order not found" });
      }

      const statusData = await getPesapalTransactionStatus(trackingId);
      const { isCompleted, standardStatus } = normalizePesapalStatus(statusData);

      const totalAmount = statusData.amount || (orderRecord ? parseFloat(orderRecord.amount) : 0);
      const creatorShare = (totalAmount * 0.7).toFixed(2);
      const platformShare = (totalAmount * 0.3).toFixed(2);

      if (orderRecord) {
        await db
          .update(pesapalOrders)
          .set({
            status: standardStatus,
            paymentMethod: statusData.payment_method || orderRecord.paymentMethod,
            creatorEarnings: isCompleted ? creatorShare : orderRecord.creatorEarnings,
            platformEarnings: isCompleted ? platformShare : orderRecord.platformEarnings,
            pesapalConfirmationCode: statusData.confirmation_code || orderRecord.pesapalConfirmationCode,
            updatedAt: new Date(),
          })
          .where(eq(pesapalOrders.id, orderRecord.id));
      }

      logIPN({
        method: 'POST',
        path: '/api/payments/reconcile',
        trackingId,
        merchantRef: merchantReference || orderRecord?.merchantReference,
        notificationType: 'MANUAL_RECONCILE',
        status: standardStatus,
        amount: totalAmount,
        currency: statusData.currency || orderRecord?.currency || 'UGX',
        paymentMethod: statusData.payment_method || orderRecord?.paymentMethod,
        confirmationCode: statusData.confirmation_code,
        rawPayload: req.body,
        result: isCompleted ? 'SUCCESS' : 'WARNING',
        details: `Manual reconciliation completed. Status: ${standardStatus}`,
      });

      res.json({
        success: true,
        reconciledStatus: standardStatus,
        isCompleted,
        pesapalStatus: statusData,
        order: {
          merchantReference: merchantReference || orderRecord?.merchantReference,
          orderTrackingId: trackingId,
          status: standardStatus,
          confirmationCode: statusData.confirmation_code,
        },
      });
    } catch (error: any) {
      console.error("Reconciliation error:", error);
      res.status(500).json({ error: error.message || "Failed to reconcile transaction" });
    }
  });

  // IPN Webhook Logs API (For monitoring and telemetry)
  app.get("/api/payments/ipn-logs", requireAuth, (req: AuthRequest, res) => {
    if (req.user?.admin !== true) return res.status(403).json({ error: "Forbidden" });
    res.json({
      success: true,
      count: ipnLogsBuffer.length,
      logs: ipnLogsBuffer,
    });
  });

  // Instant Webhook Simulation / Test Trigger
  app.post("/api/payments/simulate-ipn", requireAuth, async (req: AuthRequest, res) => {
    if (process.env.NODE_ENV === "production" || req.user?.admin !== true) {
      return res.status(404).json({ error: "Not found" });
    }
    try {
      const { merchantReference, orderTrackingId, amount = 10000, currency = "UGX" } = req.body || {};
      const ref = merchantReference || `vsr_sim_${Date.now()}`;
      const tracking = orderTrackingId || `pesapal_track_${Date.now()}`;

      const amtNum = parseFloat(String(amount));
      const creatorShare = (amtNum * 0.7).toFixed(2);
      const platformShare = (amtNum * 0.3).toFixed(2);

      await db
        .insert(pesapalOrders)
        .values({
          merchantReference: ref,
          orderTrackingId: tracking,
          type: "tip",
          amount: String(amtNum),
          currency,
          status: "COMPLETED",
          paymentMethod: "MTN Mobile Money (Simulated)",
          creatorEarnings: creatorShare,
          platformEarnings: platformShare,
          pesapalConfirmationCode: `CONF-${Math.floor(100000 + Math.random() * 900000)}`,
          description: "Simulated IPN Instant Mobile Money Settlement",
        })
        .onConflictDoUpdate({
          target: pesapalOrders.merchantReference,
          set: {
            status: "COMPLETED",
            creatorEarnings: creatorShare,
            platformEarnings: platformShare,
            updatedAt: new Date(),
          },
        });

      res.json({
        success: true,
        message: "Simulated IPN event processed successfully",
        merchantReference: ref,
        orderTrackingId: tracking,
        creatorEarnings: creatorShare,
        platformEarnings: platformShare,
      });
    } catch (error: any) {
      console.error("Simulation IPN Error:", error);
      res.status(500).json({ error: error.message || "Failed to simulate IPN" });
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
      let isFailed = false;
      let statusData: any = {};
      try {
        statusData = await getPesapalTransactionStatus(orderTrackingId);
        const desc = (statusData.payment_status_description || "").toLowerCase();
        const code = statusData.status_code;

        isSuccess = desc === "completed" || code === 1;
        isFailed = desc === "failed" || desc === "invalid" || desc === "reversed" || code === 0 || code === 2 || code === 3;

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

      const statusDesc = statusData.payment_status_description || (isSuccess ? "Completed" : isFailed ? "Failed" : "Pending");
      const statusCode = statusData.status_code !== undefined ? statusData.status_code : (isSuccess ? 1 : isFailed ? 2 : 0);
      const errorCode = statusData.error?.error_type || statusData.error?.code || statusData.error_type || "";
      const errorMessage = statusData.message || statusData.error?.message || statusData.description || "";
      const paymentMethod = statusData.payment_method || "";

      const statusParam = isSuccess ? "success" : isFailed ? "failed" : "pending";
      const redirectPath = `/?payment=${statusParam}&orderId=${encodeURIComponent(orderMerchantReference || "")}&trackingId=${encodeURIComponent(orderTrackingId)}&amount=${statusData.amount || ""}&currency=${encodeURIComponent(statusData.currency || "UGX")}&statusDesc=${encodeURIComponent(statusDesc)}&statusCode=${encodeURIComponent(statusCode)}&errorCode=${encodeURIComponent(errorCode)}&errorMessage=${encodeURIComponent(errorMessage)}&paymentMethod=${encodeURIComponent(paymentMethod)}`;

      res.redirect(redirectPath);
    } catch (error: any) {
      console.error("Pesapal Callback Error:", error);
      res.redirect("/?payment=error");
    }
  });

  // 4. Query Pesapal Transaction Status (Supports route param or query param ?id=...)
  app.get("/api/payments/status/:orderTrackingId?", requireAuth, async (req: AuthRequest, res) => {
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
      if (!dbOrder || (dbOrder.userId && dbOrder.userId !== req.user?.uid) && (dbOrder.creatorId && dbOrder.creatorId !== req.user?.uid)) {
        return res.status(404).json({ error: "Payment order not found" });
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
  app.get("/api/payments/history", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { type, status, limit = "50" } = req.query;
      const authenticatedUserId = req.user!.uid;
      const numLimit = Math.min(100, Math.max(1, parseInt(limit as string) || 50));

      let orders: any[] = [];
      try {
        orders = await db
          .select()
          .from(pesapalOrders)
          .orderBy(desc(pesapalOrders.createdAt))
          .limit(numLimit);
      } catch (dbErr) {
        console.warn("DB query for payment history note:", dbErr);
      }

      // Filter in memory if specific filter requested
      const filtered = orders.filter((o) => {
        if (o.userId !== authenticatedUserId && o.creatorId !== authenticatedUserId) return false;
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
  app.get("/api/wallet/balance", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.uid;

      let completedOrders: any[] = [];
      try {
        completedOrders = await db
          .select()
          .from(pesapalOrders)
          .where(eq(pesapalOrders.status, "COMPLETED"));
        completedOrders = completedOrders.filter((order) => order.creatorId === userId);
      } catch (dbErr) {
        console.warn("DB query for completed orders note:", dbErr);
      }

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

  // 7. Creator Payout Request API (Instant Mobile Money Disbursement)
  app.post("/api/payouts/request", requireAuth, async (req: AuthRequest, res) => {
    try {
      const {
        amountUSD,
        method = "MTN MoMo",
        phone,
        recipientName = "Visor Broadcaster",
        currency = "UGX",
        notes,
      } = req.body || {};

      const numAmountUSD = parseFloat(String(amountUSD));

      if (isNaN(numAmountUSD) || numAmountUSD < 20) {
        return res.status(400).json({
          error: "Minimum payout threshold is $20.00 USD (75,000 UGX / 2,600 KES)",
        });
      }

      if (!phone || String(phone).trim().length < 6) {
        return res.status(400).json({
          error: "Valid Mobile Money phone number or payout address is required",
        });
      }

      // Rates for local amount conversion
      const rateMap: Record<string, number> = {
        UGX: 3750,
        KES: 130,
        TZS: 2600,
        USD: 1,
      };
      const rate = rateMap[currency] || 3750;
      const localAmount = (numAmountUSD * rate).toFixed(0);

      const reference = `PO-VSR-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      const receiptNumber: string | null = null;

      const userId = req.user!.uid;
      const creatorId = req.user!.uid;
      let insertedRecord: any = null;
      try {
        const rows = await db
          .insert(payoutRequests)
          .values({
            reference,
            userId,
            creatorId,
            amountUsd: String(numAmountUSD.toFixed(2)),
            localAmount,
            currency,
            provider: method,
            phone: String(phone).trim(),
            recipientName: String(recipientName).trim(),
            feeUsd: "0.00",
            netPayoutUsd: String(numAmountUSD.toFixed(2)),
            status: "PENDING",
            kycTier: "Tier 2 (Verified Instant Settlement)",
            receiptNumber,
            notes: notes || `Direct Mobile Money Push to ${phone} via Pesapal/Telco Switch`,
          })
          .returning();

        insertedRecord = rows[0];
      } catch (dbErr) {
        console.error("Payout DB insert error:", dbErr);
        return res.status(503).json({ error: "Payout service is temporarily unavailable" });
      }

      res.json({
        success: true,
        message: "Payout request received and awaiting settlement",
        payout: insertedRecord,
        receiptNumber,
        reference,
        requestedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Payout Request Processing Error:", error);
      res.status(500).json({ error: error.message || "Failed to process payout request" });
    }
  });

  // 8. Creator Payout History API
  app.get("/api/payouts/history", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { limit = "50" } = req.query;
      const userId = req.user!.uid;
      const numLimit = Math.min(100, Math.max(1, parseInt(limit as string) || 50));

      let list: any[] = [];
      try {
        list = await db
          .select()
          .from(payoutRequests)
          .orderBy(desc(payoutRequests.createdAt))
          .where(eq(payoutRequests.userId, userId))
          .limit(numLimit);
      } catch (dbErr) {
        console.warn("DB payout query error:", dbErr);
      }

      res.json({
        success: true,
        count: list.length,
        payouts: list.map((item) => ({
          id: item.reference || String(item.id),
          reference: item.reference,
          amountUSD: parseFloat(item.amountUsd) || 0,
          localAmount: item.localAmount,
          currency: item.currency || "UGX",
          provider: item.provider,
          phone: item.phone,
          recipientName: item.recipientName,
          feeUSD: parseFloat(item.feeUsd || "0"),
          netPayoutUSD: parseFloat(item.netPayoutUsd) || 0,
          status: item.status,
          kycTier: item.kycTier,
          receiptNumber: item.receiptNumber,
          notes: item.notes,
          createdAt: item.createdAt,
        })),
      });
    } catch (error: any) {
      console.error("Fetch Payout History Error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch payout history" });
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

  app.post("/api/tips", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { streamId, sender, amount, currency, message, provider } = req.body || {};
      if (!streamId || !sender || !amount || !currency) {
        return res.status(400).json({ error: "Missing required tip fields" });
      }

      const inserted = await db
        .insert(tips)
        .values({
          streamId,
          sender,
          senderUid: req.user!.uid,
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

