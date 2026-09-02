import { auth, fetchSignInMethodsForEmail } from '../firebase';

/**
 * Describes a Firebase Auth error for user-facing display, including a
 * special case for `auth/account-exists-with-different-credential`: this
 * fires when someone tries to sign in with a provider (e.g. Google) using an
 * email that's already registered via a different provider (e.g. password).
 * Firebase doesn't auto-link these, so without this the user would see a
 * raw, confusing error with no path forward. We look up which method(s) the
 * email is actually registered with and tell them explicitly.
 *
 * Shared between `AuthModal.tsx` (sign-up/sign-in) and
 * `LinkedAccountsPanel.tsx` (link/unlink from Settings) — the latter also
 * needs `credential-already-in-use` and `provider-already-linked`, which
 * `AuthModal` never hits.
 */
export async function describeAuthError(err: any, attemptedEmail: string): Promise<string> {
  if (err.code === 'auth/account-exists-with-different-credential') {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, attemptedEmail);
      if (methods.includes('password')) {
        return 'This email is already registered with a password. Please sign in with your email and password instead, then link Google from Settings.';
      }
      if (methods.length > 0) {
        return `This email is already registered via ${methods.join(', ')}. Please sign in that way instead.`;
      }
    } catch {
      // fall through to generic message below
    }
    return 'This email is already registered with a different sign-in method. Please use the method you originally signed up with.';
  }
  if (err.code === 'auth/email-already-in-use') {
    return 'This email is already registered. Please sign in instead.';
  }
  if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
    return 'Invalid email or password. Please try again.';
  }
  if (err.code === 'auth/user-not-found') {
    return 'No account found with this email. Please sign up.';
  }
  if (err.code === 'auth/too-many-requests') {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (err.code === 'auth/credential-already-in-use') {
    return 'This Google/Apple account is already linked to a different Visor account.';
  }
  if (err.code === 'auth/provider-already-linked') {
    return 'This sign-in method is already linked to your account.';
  }
  return err.message || 'Authentication failed. Please check credentials.';
}
