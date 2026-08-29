import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(
  uid: string,
  email: string,
  displayName?: string,
  photoUrl?: string
) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName: displayName || null,
        photoUrl: photoUrl || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(displayName ? { displayName } : {}),
          ...(photoUrl ? { photoUrl } : {}),
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database getOrCreateUser failed:', error);
    throw new Error('Database user query failed', { cause: error });
  }
}

export async function getUserProfile(uid: string) {
  try {
    const results = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return results[0] || null;
  } catch (error) {
    console.error('Database getUserProfile failed:', error);
    throw new Error('Failed to fetch user profile', { cause: error });
  }
}

export async function updateUserProfile(
  uid: string,
  data: Partial<typeof users.$inferInsert>
) {
  try {
    const results = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.uid, uid))
      .returning();
    return results[0];
  } catch (error) {
    console.error('Database updateUserProfile failed:', error);
    throw new Error('Failed to update user profile', { cause: error });
  }
}

/**
 * Ensures a `users` row exists for this Firebase uid, without clobbering any
 * fields (like 2FA state) that may already be set. Used by endpoints that
 * need to persist server-authoritative data (e.g. 2FA secrets) for a user who
 * may not have hit /api/auth/sync yet.
 */
export async function ensureUserRow(uid: string, email: string) {
  const existing = await getUserProfile(uid);
  if (existing) return existing;
  return getOrCreateUser(uid, email);
}

export async function getTwoFactorState(uid: string) {
  const results = await db
    .select({
      twoFactorEnabled: users.twoFactorEnabled,
      twoFactorSecret: users.twoFactorSecret,
      twoFactorPendingSecret: users.twoFactorPendingSecret,
    })
    .from(users)
    .where(eq(users.uid, uid))
    .limit(1);
  return results[0] || null;
}

export async function startTwoFactorSetup(uid: string, pendingSecret: string) {
  await db
    .update(users)
    .set({ twoFactorPendingSecret: pendingSecret, updatedAt: new Date() })
    .where(eq(users.uid, uid));
}

export async function confirmTwoFactorEnabled(uid: string, secret: string) {
  await db
    .update(users)
    .set({
      twoFactorEnabled: true,
      twoFactorSecret: secret,
      twoFactorPendingSecret: null,
      twoFactorEnabledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.uid, uid));
}

export async function disableTwoFactor(uid: string) {
  await db
    .update(users)
    .set({
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorPendingSecret: null,
      updatedAt: new Date(),
    })
    .where(eq(users.uid, uid));
}
