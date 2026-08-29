/**
 * Real, backend-enforced TOTP two-factor authentication.
 *
 * This replaces the previous `twoFactorEnabled` UI toggle, which was a plain
 * boolean stored (unreliably) on the client and never checked by any
 * authentication or money-moving endpoint - i.e. it protected nothing. Secrets
 * are generated and verified server-side and gate sensitive actions such as
 * payout requests (see server.ts).
 */
import { authenticator } from 'otplib';

const SERVICE_NAME = 'Visor Stream';

// Allow one 30s step of clock drift in either direction before/after the
// current window, which is standard practice for TOTP UX.
authenticator.options = { window: 1 };

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

export function getTotpKeyUri(accountLabel: string, secret: string): string {
  return authenticator.keyuri(accountLabel, SERVICE_NAME, secret);
}

export function verifyTotpToken(token: string | undefined | null, secret: string | null | undefined): boolean {
  if (!token || !secret) return false;
  const normalized = String(token).trim();
  if (!/^\d{6}$/.test(normalized)) return false;
  try {
    return authenticator.verify({ token: normalized, secret });
  } catch {
    return false;
  }
}
