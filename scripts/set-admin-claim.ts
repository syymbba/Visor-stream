/**
 * Grants or revokes the `admin` custom claim on a Firebase user.
 *
 * Previously nothing in this codebase ever called `setCustomUserClaims`, so
 * the `admin`-gated endpoints (`/api/payments/ipn-logs`,
 * `/api/payments/simulate-ipn`) were permanently inaccessible to everyone -
 * an incomplete authorization mechanism with no documented way to actually
 * use it. This script is the explicit, auditable way to grant that claim.
 *
 * Usage:
 *   npx tsx scripts/set-admin-claim.ts <uid-or-email> grant
 *   npx tsx scripts/set-admin-claim.ts <uid-or-email> revoke
 *
 * Requires the same Firebase Admin credentials as the running server
 * (Application Default Credentials, or GOOGLE_APPLICATION_CREDENTIALS).
 */
import 'dotenv/config';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

async function main() {
  const [uidOrEmail, action] = process.argv.slice(2);

  if (!uidOrEmail || !['grant', 'revoke'].includes(action || '')) {
    console.error('Usage: tsx scripts/set-admin-claim.ts <uid-or-email> <grant|revoke>');
    process.exit(1);
  }

  if (!getApps().length) {
    initializeApp({ projectId: firebaseConfig.projectId });
  }
  const auth = getAuth();

  const user = uidOrEmail.includes('@')
    ? await auth.getUserByEmail(uidOrEmail)
    : await auth.getUser(uidOrEmail);

  const existingClaims = user.customClaims || {};
  const nextClaims = { ...existingClaims, admin: action === 'grant' ? true : undefined };

  await auth.setCustomUserClaims(user.uid, nextClaims);

  // Revoke existing refresh tokens so the claim change takes effect
  // immediately rather than waiting up to an hour for the old ID token to expire.
  await auth.revokeRefreshTokens(user.uid);

  console.log(
    `[set-admin-claim] ${action === 'grant' ? 'Granted' : 'Revoked'} admin claim for ${user.email || user.uid} (${user.uid}). ` +
      'Existing sessions have been revoked; the user must sign in again.'
  );
}

main().catch((err) => {
  console.error('[set-admin-claim] Failed:', err);
  process.exit(1);
});
