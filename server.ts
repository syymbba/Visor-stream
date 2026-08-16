import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { requireAuth, type AuthRequest } from "./src/middleware/auth.ts";
import { getOrCreateUser, getUserProfile, updateUserProfile } from "./src/db/users.ts";
import { db } from "./src/db/index.ts";
import { tips, creatorStats } from "./src/db/schema.ts";
import { desc, eq } from "drizzle-orm";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "visor-stream", db: "cloud-sql" });
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
