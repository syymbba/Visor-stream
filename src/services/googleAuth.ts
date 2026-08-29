import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
];

// IMPORTANT: this provider requests full Gmail read/send/modify scopes and
// must ONLY be used for the explicit "Connect Gmail" action inside the Gmail
// feature (GmailView.tsx / connectGmailAccount below). It must never be used
// for ordinary sign-in - asking every visitor who just wants to watch a
// stream to grant email read/send access is a least-privilege violation and
// a phishing-pattern red flag. Use `basicGoogleSignIn` for regular login.
const gmailScopedProvider = new GoogleAuthProvider();
GMAIL_SCOPES.forEach((scope) => {
  gmailScopedProvider.addScope(scope);
});
gmailScopedProvider.setCustomParameters({
  prompt: 'select_account consent',
});

// Plain provider with no extra scopes, used for regular "Continue with
// Google" sign-in/sign-up (AuthModal.tsx). Only requests Firebase's default
// basic profile/email scopes.
const basicProvider = new GoogleAuthProvider();

// Flag to track sign-in in flight
let isSigningIn = false;
// In-memory cache for OAuth access token (per security directives: NEVER localStorage/sessionStorage)
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Gmail-scoped Google sign-in. Only call this from the explicit Gmail
 * connection flow (GmailView) - it triggers a consent screen asking for
 * email read/send/modify access, which is inappropriate for ordinary login.
 */
export const connectGmailAccount = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, gmailScopedProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google access token for Gmail API');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Gmail connection sign-in failed:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/** @deprecated use `connectGmailAccount` (Gmail feature) or `basicGoogleSignIn` (ordinary login) */
export const googleSignIn = connectGmailAccount;

/**
 * Ordinary "Continue with Google" sign-in for regular app login/signup.
 * Requests no scopes beyond Firebase's default basic profile/email, unlike
 * `connectGmailAccount`.
 */
export const basicGoogleSignIn = async (): Promise<{ user: User } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, basicProvider);
    return { user: result.user };
  } catch (error: any) {
    console.error('Google Sign-in failed:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setAccessTokenInMemory = (token: string | null) => {
  cachedAccessToken = token;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
