import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { requireAuth, type AuthRequest } from "./src/middleware/auth.ts";
import {
  getOrCreateUser,
  getUserProfile,
  updateUserProfile,
  ensureUserRow,
  getTwoFactorState,
  startTwoFactorSetup,
  confirmTwoFactorEnabled,
  disableTwoFactor,
} from "./src/db/users.ts";
import { db } from "./src/db/index.ts";
import { tips, creatorStats, pesapalOrders, payoutRequests } from "./src/db/schema.ts";
import { applyCompletedOrderToCreatorStats, getOrBackfillCreatorStats } from "./src/db/creatorStats.ts";
import { markOrderCompletedAndCredit } from "./src/db/completeOrder.ts";
import { availableBalanceUsd, reservePayoutAndInsert } from "./src/db/payouts.ts";
import { and, desc, eq, or } from "drizzle-orm";
import {
  submitPesapalOrder,
  getPesapalTransactionStatus,
  getNotificationId,
  normalizePesapalStatus,
  getAppUrl,
} from "./src/lib/pesapal.ts";
import {
  SUPPORTED_CURRENCIES,
  CURRENCY_RATES_PER_USD,
  CREATOR_SHARE_RATE,
  PLATFORM_FEE_RATE,
  getExpectedSubscriptionAmount,
  toUSD,
  fromUSD,
  centsToUsd,
} from "./src/lib/pricing.ts";
import { createRateLimiter } from "./src/lib/rateLimiter.ts";
import { createCorsMiddleware } from "./src/lib/cors.ts";
import { generateTotpSecret, getTotpKeyUri, verifyTotpToken } from "./src/lib/twoFactor.ts";

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

// Fields that may carry raw credentials or PII from the payment provider —
// strip them before storing in the in-memory audit buffer so they don't
// persist in process memory or get exposed via /api/payments/ipn-logs.
const IPN_PAYLOAD_STRIP_KEYS = new Set([
  'consumer_key', 'consumer_secret', 'access_token', 'token', 'secret',
  'password', 'card_number', 'cvv', 'pan', 'account_number',
]);
function sanitizeIpnPayload(payload: any, depth = 0): any {
  if (!payload || typeof payload !== 'object' || depth > 5) return payload;
  if (Array.isArray(payload)) return payload.map((item) => sanitizeIpnPayload(item, depth + 1));
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(payload)) {
    out[k] = IPN_PAYLOAD_STRIP_KEYS.has(k.toLowerCase())
      ? '[REDACTED]'
      : sanitizeIpnPayload(v, depth + 1);
  }
  return out;
}

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

  // Shared-store-aware rate limiter: uses REDIS_URL when configured so the
  // limit is enforced correctly across multiple server instances, instead of
  // multiplying per-instance the way a plain in-memory Map would.
  app.use("/api", createRateLimiter({ windowMs: 60_000, max: 120 }));
  const sensitiveLimiter = createRateLimiter({ windowMs: 60_000, max: 40, failClosed: true });
  app.use("/api/payments/checkout", sensitiveLimiter);
  app.use("/api/payouts", sensitiveLimiter);
  app.use("/api/auth", sensitiveLimiter);
  app.use("/api", createCorsMiddleware());

  app.use(express.json({ limit: "100kb" }));
  app.disable("x-powered-by");

  // Routes safe to cache briefly at the edge/CDN: public, non-sensitive reads
  // that don't vary per authenticated user. Everything else defaults to
  // `no-store`, since a blanket no-store policy previously prevented even
  // these harmless public reads from ever being cached.
  const PUBLICLY_CACHEABLE_GET_ROUTES = [/^\/api\/tips\/[^/]+$/, /^\/api\/health$/];

  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    if (req.path.startsWith("/api/")) {
      const isPubliclyCacheable =
        req.method === "GET" && PUBLICLY_CACHEABLE_GET_ROUTES.some((re) => re.test(req.path));
      res.setHeader(
        "Cache-Control",
        isPubliclyCacheable ? "public, max-age=15, stale-while-revalidate=60" : "no-store"
      );
    }
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
      const normalizedCurrency = String(currency).toUpperCase();
      if (!SUPPORTED_CURRENCIES.includes(normalizedCurrency as any)) {
        return res.status(400).json({ error: "Unsupported currency" });
      }
      if (!['subscription', 'tip', 'topup'].includes(type)) {
        return res.status(400).json({ error: "Unsupported payment type" });
      }
      if (type === 'subscription') {
        const expectedAmount = getExpectedSubscriptionAmount(planId, normalizedCurrency);
        if (expectedAmount === undefined || numAmount !== expectedAmount) {
          return res.status(400).json({ error: "Invalid subscription plan or price" });
        }
      }

      // Validate and sanitize string fields to prevent log injection / spoofing.
      const authenticatedUserId = req.user!.uid;
      const safeEmail = email ? String(email).slice(0, 254) : "customer@visorstream.com";
      const safePhone = phone ? String(phone).slice(0, 20) : "";
      const safeFirstName = firstName ? String(firstName).replace(/[^\p{L}\p{N} '-]/gu, "").slice(0, 50) : "Visor";
      const safeLastName = lastName ? String(lastName).replace(/[^\p{L}\p{N} '-]/gu, "").slice(0, 50) : "User";
      const safeDescription = description ? String(description).slice(0, 250) : undefined;
      // planId and streamId are stored as-is but capped to prevent bloat
      const safePlanId = planId ? String(planId).slice(0, 64) : undefined;
      const safeStreamId = streamId ? String(streamId).slice(0, 128) : undefined;
      // creatorId comes from the client but the self-tip check below is the key guard
      const safeCreatorId = creatorId ? String(creatorId).slice(0, 128) : null;

      // Disallow a payer from designating themselves as the beneficiary of
      // their own tip/subscription. This is the direct exploit path for the
      // "self-attributed creator earnings" gap: since payouts are resolved
      // purely from `order.creatorId === req.user.uid`, without this check an
      // authenticated user could set creatorId to their own uid on a
      // tip/subscription order and have it show up as their own creator
      // earnings. (Full verification that `creatorId` corresponds to a real,
      // registered streamer is a larger product change - streams/streamers in
      // this codebase are currently mock data with no creator-account
      // ownership table - so this targeted check closes the concrete
      // self-dealing exploit without breaking the existing demo tipping flow.)
      if ((type === 'tip' || type === 'subscription') && safeCreatorId && safeCreatorId === authenticatedUserId) {
        return res.status(400).json({ error: "You cannot tip or subscribe to yourself" });
      }

      // Unique Merchant Reference
      const merchantReference = `VSR-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      // Derive app URL for callbacks
      const appUrl = getAppUrl();

      const callbackUrl = `${appUrl}/api/payments/callback`;
      const notificationId = await getNotificationId(appUrl);

      // Submit Order to Pesapal v3 REST API
      const pesapalRes = await submitPesapalOrder({
        merchantReference,
        amount: numAmount,
        currency: normalizedCurrency,
        description: safeDescription || `Visor Stream ${type === "tip" ? "Live Stream Tip" : "Subscription"}`,
        callbackUrl,
        notificationId,
        email: safeEmail,
        phone: safePhone,
        firstName: safeFirstName,
        lastName: safeLastName,
      });

      // Calculate initial 70/30 revenue allocation
      const creatorEarnings = (numAmount * CREATOR_SHARE_RATE).toFixed(2);
      const platformEarnings = (numAmount * PLATFORM_FEE_RATE).toFixed(2);

      // Save order in Cloud SQL database as 'PENDING'
      try {
        await db.insert(pesapalOrders).values({
          merchantReference,
          orderTrackingId: pesapalRes.order_tracking_id,
          type,
          planId: safePlanId || null,
          userId: authenticatedUserId,
          creatorId: safeCreatorId || null,
          streamId: safeStreamId || null,
          amount: String(numAmount),
          currency: normalizedCurrency,
          status: "PENDING",
          description: safeDescription || null,
          email: safeEmail,
          phone: safePhone,
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
        rawPayload: sanitizeIpnPayload(payload),
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
          rawPayload: sanitizeIpnPayload(payload),
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

      // 3. Persist status. Completed payments go through a shared helper
      // that validates amount/currency against the stored order before any
      // ledger credit (IPN used to fall back to the stored total when
      // Pesapal omitted amount, which could credit an unpaid order).
      try {
        if (isCompleted) {
          const completion = await markOrderCompletedAndCredit(existingOrder, statusData, trackingId);
          if (!completion.credited && completion.reason && completion.reason !== 'already_completed') {
            logIPN({
              method: req.method,
              path: req.path,
              trackingId,
              merchantRef,
              notificationType,
              status: 'REJECTED',
              rawPayload: sanitizeIpnPayload(payload),
              result: 'WARNING',
              details: `Completed IPN rejected: ${completion.reason}`,
            });
            return res.status(200).json({
              orderNotificationType: notificationType,
              orderTrackingId: trackingId,
              orderMerchantReference: merchantRef || existingOrder.merchantReference,
              status: 200,
            });
          }
        } else {
          await db
            .update(pesapalOrders)
            .set({
              status: standardStatus,
              orderTrackingId: trackingId,
              paymentMethod: paymentMethod || existingOrder.paymentMethod,
              pesapalConfirmationCode: confirmationCode || existingOrder.pesapalConfirmationCode,
              updatedAt: new Date(),
            })
            .where(eq(pesapalOrders.id, existingOrder.id));
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
        rawPayload: sanitizeIpnPayload(payload),
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
        rawPayload: sanitizeIpnPayload(payload),
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
      if (!orderRecord || (orderRecord.userId !== req.user?.uid && orderRecord.creatorId !== req.user?.uid)) {
        return res.status(404).json({ error: "Payment order not found" });
      }

      const statusData = await getPesapalTransactionStatus(trackingId);
      const { isCompleted, standardStatus } = normalizePesapalStatus(statusData);
      const totalAmount = Number(statusData.amount);

      if (isCompleted) {
        const completion = await markOrderCompletedAndCredit(orderRecord, statusData, trackingId);
        if (!completion.credited && completion.reason && completion.reason !== 'already_completed') {
          return res.status(409).json({
            error: `Payment could not be reconciled: ${completion.reason}`,
            reason: completion.reason,
          });
        }
      } else {
        await db
          .update(pesapalOrders)
          .set({
            status: standardStatus,
            paymentMethod: statusData.payment_method || orderRecord.paymentMethod,
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
        rawPayload: sanitizeIpnPayload(req.body),
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

  // Lightweight audit trail for admin-gated actions. In a fuller deployment
  // this would be a persisted table with retention/alerting; for now this
  // guarantees every admin-privileged access is at least visible in server
  // logs with who/when/what, since there was previously no audit trail at all.
  function auditAdminAction(req: AuthRequest, action: string) {
    console.warn(
      `[ADMIN AUDIT] uid=${req.user?.uid} email=${req.user?.email || "unknown"} action=${action} ip=${req.ip} at=${new Date().toISOString()}`
    );
  }

  // IPN Webhook Logs API (For monitoring and telemetry)
  app.get("/api/payments/ipn-logs", requireAuth, (req: AuthRequest, res) => {
    if (req.user?.admin !== true) return res.status(403).json({ error: "Forbidden" });
    auditAdminAction(req, "view_ipn_logs");
    res.json({
      success: true,
      count: ipnLogsBuffer.length,
      logs: ipnLogsBuffer,
    });
  });

  // Instant Webhook Simulation / Test Trigger
  app.post("/api/payments/simulate-ipn", requireAuth, async (req: AuthRequest, res) => {
    if (req.user?.admin !== true) {
      return res.status(404).json({ error: "Not found" });
    }
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_IPN_SIMULATION !== "true") {
      return res.status(404).json({ error: "Not found" });
    }
    auditAdminAction(req, "simulate_ipn");
    try {
      const { merchantReference, orderTrackingId, amount = 10000, currency = "UGX" } = req.body || {};
      const ref = merchantReference || `vsr_sim_${Date.now()}`;
      const tracking = orderTrackingId || `pesapal_track_${Date.now()}`;
      const creatorId = req.user!.uid;

      const amtNum = parseFloat(String(amount));
      const creatorShare = (amtNum * CREATOR_SHARE_RATE).toFixed(2);
      const platformShare = (amtNum * PLATFORM_FEE_RATE).toFixed(2);

      const existingRows = await db
        .select()
        .from(pesapalOrders)
        .where(eq(pesapalOrders.merchantReference, ref))
        .limit(1);
      const wasAlreadyCompleted = existingRows[0]?.status === "COMPLETED";

      await db
        .insert(pesapalOrders)
        .values({
          merchantReference: ref,
          orderTrackingId: tracking,
          type: "tip",
          creatorId,
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

      if (!wasAlreadyCompleted) {
        try {
          await applyCompletedOrderToCreatorStats({ creatorId, amount: amtNum, currency, type: "tip" });
        } catch (ledgerErr) {
          console.error("Failed to update creator earnings ledger during simulated IPN:", ledgerErr);
        }
      }

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
          const orderRows = await db
            .select()
            .from(pesapalOrders)
            .where(eq(pesapalOrders.merchantReference, orderMerchantReference))
            .limit(1);
          const storedOrder = orderRows[0];
          if (!storedOrder) {
            throw new Error('Payment callback does not match the stored order');
          }
          const completion = await markOrderCompletedAndCredit(storedOrder, statusData, orderTrackingId);
          if (!completion.credited && completion.reason && completion.reason !== 'already_completed') {
            throw new Error(`Payment callback does not match the stored order: ${completion.reason}`);
          }
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
      if (!dbOrder || (dbOrder.userId !== req.user?.uid && dbOrder.creatorId !== req.user?.uid)) {
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
          const completion = await markOrderCompletedAndCredit(dbOrder, pesapalStatus, trackingId);
          if (completion.credited || completion.reason === 'already_completed') {
            dbOrder.status = "COMPLETED";
          }
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

      const ownerScope = or(
        eq(pesapalOrders.userId, authenticatedUserId),
        eq(pesapalOrders.creatorId, authenticatedUserId),
      );
      const filters = [ownerScope];
      if (typeof type === "string" && type.trim()) {
        filters.push(eq(pesapalOrders.type, type));
      }
      if (typeof status === "string" && status.trim()) {
        filters.push(eq(pesapalOrders.status, status));
      }

      let filtered: any[] = [];
      try {
        filtered = await db
          .select()
          .from(pesapalOrders)
          .where(and(...filters))
          .orderBy(desc(pesapalOrders.createdAt))
          .limit(numLimit);
      } catch (dbErr) {
        console.warn("DB query for payment history note:", dbErr);
      }

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
  //
  // Previously this pulled EVERY completed order across the entire platform
  // into Node and filtered by creatorId in JS (O(all completed orders) on
  // every single request, on a 15-20s poll from potentially many open tabs).
  // It now reads a per-creator ledger row that's maintained incrementally by
  // the IPN/callback/reconcile/simulate handlers below (O(1) read), lazily
  // backfilling from an indexed, creator-scoped SQL query the first time.
  app.get("/api/wallet/balance", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.uid;
      const stats = await getOrBackfillCreatorStats(userId);

      const netBalanceUSD = availableBalanceUsd(stats);
      const totalGrossUSD = centsToUsd(stats.totalGrossUsdCents);
      const totalPlatformFeesUSD = centsToUsd(stats.totalPlatformFeesUsdCents);

      res.json({
        success: true,
        balanceUSD: netBalanceUSD,
        balanceUGX: Math.round(fromUSD(netBalanceUSD, "UGX")),
        balanceKES: Math.round(fromUSD(netBalanceUSD, "KES")),
        balanceTZS: Math.round(fromUSD(netBalanceUSD, "TZS")),
        totalRevenueUSD: totalGrossUSD,
        creatorEarningsUSD: netBalanceUSD,
        platformFeesUSD: totalPlatformFeesUSD,
        totalSubscribers: stats.totalSubscriptionsCount,
        totalTipsCount: stats.totalTipsCount,
        completedOrdersCount: stats.completedOrdersCount,
        currencyRates: CURRENCY_RATES_PER_USD,
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
        provider,
        phone,
        recipientName = "Visor Broadcaster",
        currency = "UGX",
        notes,
      } = req.body || {};

      const numAmountUSD = parseFloat(String(amountUSD));

      if (isNaN(numAmountUSD) || numAmountUSD < 20 || numAmountUSD > 50000) {
        return res.status(400).json({
          error: "Minimum payout threshold is $20.00 USD (75,000 UGX / 2,600 KES)",
        });
      }

      if (!phone || String(phone).trim().length < 6 || String(phone).trim().length > 20) {
        return res.status(400).json({
          error: "Valid Mobile Money phone number or payout address is required",
        });
      }

      const normalizedPayoutCurrency = String(currency).toUpperCase();
      if (!SUPPORTED_CURRENCIES.includes(normalizedPayoutCurrency as any)) {
        return res.status(400).json({ error: "Unsupported payout currency" });
      }

      const safeRecipientName = recipientName
        ? String(recipientName).replace(/[^\p{L}\p{N} '-]/gu, "").slice(0, 100)
        : "Visor Broadcaster";
      const safeNotes = notes ? String(notes).slice(0, 500) : undefined;
      const safePayoutPhone = String(phone).trim();

      const userId = req.user!.uid;

      // Require a verified email before allowing money to be withdrawn from
      // the platform. Firebase includes `email_verified` directly on the ID
      // token, so this is a cheap, real check - previously nothing in the
      // signup flow even sent a verification email (see AuthModal.tsx).
      if (!req.user?.email_verified) {
        return res.status(403).json({
          error: "Please verify your email address before requesting a payout. Check your inbox for a verification link.",
        });
      }

      // If the creator has TOTP 2FA enabled, require a valid current code
      // before releasing funds. This is the enforcement point that makes the
      // "Two-Factor Authentication" setting actually protect something,
      // instead of being a client-only cosmetic toggle.
      const { twoFactorToken } = req.body || {};
      const twoFactorState = await getTwoFactorState(userId);
      if (twoFactorState?.twoFactorEnabled) {
        if (typeof twoFactorToken !== 'string' || !/^\d{6}$/.test(twoFactorToken)) {
          return res.status(401).json({
            error: "A valid 2FA code is required to request a payout.",
            requiresTwoFactor: true,
          });
        }
        if (!verifyTotpToken(twoFactorToken, twoFactorState.twoFactorSecret)) {
          return res.status(401).json({
            error: "A valid 2FA code is required to request a payout.",
            requiresTwoFactor: true,
          });
        }
      }

      // Ensure a ledger row exists before the reservation transaction so we
      // don't lock an empty table for first-time creators.
      try {
        await getOrBackfillCreatorStats(userId);
      } catch (balanceErr) {
        console.error("Payout balance verification error:", balanceErr);
        return res.status(503).json({ error: "Unable to verify payout balance" });
      }

      const payoutProvider = provider ? String(provider).slice(0, 64) : (method ? String(method).slice(0, 64) : "MTN MoMo");
      const localAmount = fromUSD(numAmountUSD, normalizedPayoutCurrency).toFixed(0);

      const reference = `PO-VSR-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      const receiptNumber: string | null = null;

      const creatorId = req.user!.uid;
      const reservation = await reservePayoutAndInsert({
        userId,
        amountUSD: numAmountUSD,
        payoutValues: {
          reference,
          userId,
          creatorId,
          amountUsd: String(numAmountUSD.toFixed(2)),
          localAmount,
          currency: normalizedPayoutCurrency,
          provider: payoutProvider,
          phone: safePayoutPhone,
          recipientName: safeRecipientName,
          feeUsd: "0.00",
          netPayoutUsd: String(numAmountUSD.toFixed(2)),
          status: "PENDING",
          kycTier: "Tier 2 (Verified Instant Settlement)",
          receiptNumber,
          notes: safeNotes || `Direct Mobile Money Push to ${safePayoutPhone} via Pesapal/Telco Switch`,
        },
      });

      if (reservation.ok === false) {
        return res.status(400).json({ error: reservation.error, availableUSD: reservation.availableUSD });
      }
      const insertedRecord = reservation.inserted;

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

  // ==========================================
  // TWO-FACTOR AUTHENTICATION (real, backend-enforced TOTP)
  //
  // Replaces the old client-only `twoFactorEnabled` boolean, which was never
  // checked anywhere and was frequently rejected/silently dropped by
  // Firestore rules anyway. State lives in Postgres; the secret never leaves
  // the server except once, at enrollment time, for the user to scan/enter
  // into their authenticator app.
  // ==========================================

  app.get("/api/auth/2fa/status", requireAuth, async (req: AuthRequest, res) => {
    try {
      const state = await getTwoFactorState(req.user!.uid);
      res.json({ success: true, enabled: Boolean(state?.twoFactorEnabled) });
    } catch (error: any) {
      console.error("2FA status error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch 2FA status" });
    }
  });

  app.post("/api/auth/2fa/setup", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const email = req.user?.email || "";
      await ensureUserRow(uid, email);

      const secret = generateTotpSecret();
      await startTwoFactorSetup(uid, secret);

      res.json({
        success: true,
        secret,
        otpauthUrl: getTotpKeyUri(email || uid, secret),
      });
    } catch (error: any) {
      console.error("2FA setup error:", error);
      res.status(500).json({ error: error.message || "Failed to start 2FA setup" });
    }
  });

  app.post("/api/auth/2fa/verify", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const { token } = req.body || {};
      // TOTP codes are always 6 digits; reject anything that doesn't match so
      // verifyTotpToken never receives unexpected input types.
      if (typeof token !== 'string' || !/^\d{6}$/.test(token)) {
        return res.status(400).json({ error: "Invalid verification code. Please try again." });
      }
      const state = await getTwoFactorState(uid);

      if (!state?.twoFactorPendingSecret) {
        return res.status(400).json({ error: "No pending 2FA setup found. Please start setup again." });
      }
      if (!verifyTotpToken(token, state.twoFactorPendingSecret)) {
        return res.status(400).json({ error: "Invalid verification code. Please try again." });
      }

      await confirmTwoFactorEnabled(uid, state.twoFactorPendingSecret);
      res.json({ success: true, enabled: true });
    } catch (error: any) {
      console.error("2FA verify error:", error);
      res.status(500).json({ error: error.message || "Failed to verify 2FA code" });
    }
  });

  app.post("/api/auth/2fa/disable", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const { token } = req.body || {};
      const state = await getTwoFactorState(uid);

      if (state?.twoFactorEnabled) {
        // Require a current valid code to disable, so a hijacked browser
        // session alone isn't enough to strip 2FA protection from an account.
        if (typeof token !== 'string' || !/^\d{6}$/.test(token)) {
          return res.status(400).json({ error: "A valid 2FA code is required to disable two-factor authentication." });
        }
        if (!verifyTotpToken(token, state.twoFactorSecret)) {
          return res.status(400).json({ error: "A valid 2FA code is required to disable two-factor authentication." });
        }
      }

      await disableTwoFactor(uid);
      res.json({ success: true, enabled: false });
    } catch (error: any) {
      console.error("2FA disable error:", error);
      res.status(500).json({ error: error.message || "Failed to disable 2FA" });
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

      // Validate and sanitize string inputs to prevent oversized or malformed writes.
      const safeGamerTag = gamerTag !== undefined ? String(gamerTag).slice(0, 64) : undefined;
      const safeBio = bio !== undefined ? String(bio).slice(0, 500) : undefined;
      const safeCurrency = currency ? String(currency).toUpperCase().slice(0, 10) : undefined;
      const safeMomoPhone = momoPhone ? String(momoPhone).slice(0, 20) : undefined;
      const safeMomoProvider = momoProvider ? String(momoProvider).slice(0, 64) : undefined;

      const updated = await updateUserProfile(uid, {
        gamerTag: safeGamerTag,
        bio: safeBio,
        currency: safeCurrency,
        momoPhone: safeMomoPhone,
        momoProvider: safeMomoProvider,
        dataSaver: typeof dataSaver === 'boolean' ? dataSaver : undefined,
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

  // Tips are written only from verified Pesapal completion (see
  // markOrderCompletedAndCredit). A public POST here previously let any
  // signed-in user insert arbitrary unpaid tip rows into the stream feed.

  // Creator stats endpoint
  app.get("/api/creator/stats/:userId", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { userId } = req.params;
      const stats = await db
        .select()
        .from(creatorStats)
        .where(eq(creatorStats.userId, userId))
        .limit(1);
      const row = stats[0] || null;
      if (!row) {
        return res.json({ success: true, stats: null });
      }

      const isOwner = req.user!.uid === userId;
      const isAdmin = req.user?.admin === true;
      if (!isOwner && !isAdmin) {
        return res.json({
          success: true,
          stats: {
            userId: row.userId,
            totalTipsCount: row.totalTipsCount,
            totalSubscriptionsCount: row.totalSubscriptionsCount,
            completedOrdersCount: row.completedOrdersCount,
          },
        });
      }

      res.json({ success: true, stats: row });
    } catch (error: any) {
      console.error("Fetch creator stats error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch creator stats" });
    }
  });

  app.use(express.static(path.join(process.cwd(), "public"), { index: false }));

  app.get("/sitemap.xml", (_req, res) => {
    res.type("application/xml");
    res.sendFile(path.join(process.cwd(), "public", "sitemap.xml"));
  });

  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain");
    res.send("User-agent: *\nAllow: /\nSitemap: https://visorstream.com/sitemap.xml\n");
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

