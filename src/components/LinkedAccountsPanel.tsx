import React, { useState } from 'react';
import {
  auth,
  linkWithPopup,
  unlink,
  GoogleAuthProvider,
  OAuthProvider,
} from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { describeAuthError } from '../lib/authErrors';
import { Link2, Mail, Unlink, Loader2, AlertCircle } from 'lucide-react';

type ProviderId = 'password' | 'google.com' | 'apple.com';

const APPLE_NOT_ENABLED_MESSAGE = "Apple Sign-In isn't available yet — check back soon.";

/**
 * Lets a signed-in user link/unlink Google and Apple as additional sign-in
 * methods, and shows whether a password is set. Reads
 * `currentUser.providerData` directly rather than through `useAuth()`'s
 * `userProfile` (which tracks the Firestore profile document, not Firebase
 * Auth's linked-provider list) — `linkWithPopup`/`unlink` mutate
 * `auth.currentUser` in place without necessarily firing
 * `onAuthStateChanged`, so this component keeps its own local copy and
 * re-reads `auth.currentUser.providerData` after each successful call.
 */
export const LinkedAccountsPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const [providerData, setProviderData] = useState(currentUser?.providerData ?? []);
  const [error, setError] = useState<string | null>(null);
  const [appleUnavailable, setAppleUnavailable] = useState(false);
  const [busyProvider, setBusyProvider] = useState<ProviderId | null>(null);

  if (!currentUser) return null;

  const isLinked = (providerId: ProviderId) => providerData.some((p) => p.providerId === providerId);
  const onlyMethod = providerData.length === 1;

  const refreshProviderData = () => {
    setProviderData(auth.currentUser?.providerData ? [...auth.currentUser.providerData] : []);
  };

  const handleLinkGoogle = async () => {
    setError(null);
    setAppleUnavailable(false);
    setBusyProvider('google.com');
    try {
      await linkWithPopup(currentUser, new GoogleAuthProvider());
      refreshProviderData();
    } catch (err: any) {
      setError(await describeAuthError(err, currentUser.email || ''));
    } finally {
      setBusyProvider(null);
    }
  };

  const handleLinkApple = async () => {
    setError(null);
    setAppleUnavailable(false);
    setBusyProvider('apple.com');
    try {
      await linkWithPopup(currentUser, new OAuthProvider('apple.com'));
      refreshProviderData();
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/invalid-provider-id') {
        // Apple Sign-In isn't enabled in this Firebase project yet — a
        // console-side prerequisite, not a user error, so we deliberately
        // don't route this through describeAuthError's generic messaging.
        setAppleUnavailable(true);
      } else {
        setError(await describeAuthError(err, currentUser.email || ''));
      }
    } finally {
      setBusyProvider(null);
    }
  };

  const handleUnlink = async (providerId: ProviderId) => {
    setError(null);
    setAppleUnavailable(false);
    setBusyProvider(providerId);
    try {
      await unlink(currentUser, providerId);
      refreshProviderData();
    } catch (err: any) {
      setError(await describeAuthError(err, currentUser.email || ''));
    } finally {
      setBusyProvider(null);
    }
  };

  return (
    <div className="p-4 bg-[#0b0e14] rounded-2xl border border-[#2a475e] space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 shrink-0">
          <Link2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Linked Sign-In Methods</h4>
          <p className="text-[11px] text-slate-400 mt-1">
            Link Google or Apple so you can sign in more than one way. You must always keep at least one
            sign-in method linked.
          </p>
        </div>
      </div>

      {error && (
        <p className="text-[11px] text-rose-400 font-mono-code flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}

      <div className="space-y-2">
        {/* Password / Email — informational only, no unlink action */}
        <div className="p-3 bg-[#171a21] border border-[#2a475e] rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-white">Email & Password</p>
              <p className="text-[11px] text-slate-400 truncate">
                {isLinked('password') ? currentUser.email || 'Password set' : 'Not set'}
              </p>
            </div>
          </div>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg shrink-0 ${
              isLinked('password')
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-500 border border-slate-700'
            }`}
          >
            {isLinked('password') ? 'Set' : 'Not Set'}
          </span>
        </div>

        {/* Google */}
        <div className="p-3 bg-[#171a21] border border-[#2a475e] rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
            </svg>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white">Google</p>
              <p className="text-[11px] text-slate-400 truncate">
                {isLinked('google.com')
                  ? providerData.find((p) => p.providerId === 'google.com')?.email || 'Linked'
                  : 'Not linked'}
              </p>
            </div>
          </div>
          {isLinked('google.com') ? (
            <button
              type="button"
              onClick={() => handleUnlink('google.com')}
              disabled={busyProvider === 'google.com' || onlyMethod}
              title={onlyMethod ? 'Link another sign-in method first — you must keep at least one.' : undefined}
              className="px-3 py-1.5 bg-[#1b2838] border border-[#2a475e] hover:border-rose-500/50 hover:text-rose-400 text-[11px] font-bold text-slate-300 rounded-lg flex items-center gap-1.5 disabled:opacity-40 disabled:hover:border-[#2a475e] disabled:hover:text-slate-300 shrink-0"
            >
              {busyProvider === 'google.com' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Unlink className="w-3.5 h-3.5" />
              )}
              <span>Unlink</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLinkGoogle}
              disabled={busyProvider === 'google.com'}
              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-[11px] font-bold rounded-lg flex items-center gap-1.5 disabled:opacity-50 shrink-0"
            >
              {busyProvider === 'google.com' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
              <span>Link Google</span>
            </button>
          )}
        </div>

        {/* Apple */}
        <div className="p-3 bg-[#171a21] border border-[#2a475e] rounded-xl space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <svg className="w-4 h-4 shrink-0 fill-white" viewBox="0 0 384 512">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
              </svg>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white">Apple</p>
                <p className="text-[11px] text-slate-400 truncate">
                  {isLinked('apple.com')
                    ? providerData.find((p) => p.providerId === 'apple.com')?.email || 'Linked'
                    : 'Not linked'}
                </p>
              </div>
            </div>
            {isLinked('apple.com') ? (
              <button
                type="button"
                onClick={() => handleUnlink('apple.com')}
                disabled={busyProvider === 'apple.com' || onlyMethod}
                title={onlyMethod ? 'Link another sign-in method first — you must keep at least one.' : undefined}
                className="px-3 py-1.5 bg-[#1b2838] border border-[#2a475e] hover:border-rose-500/50 hover:text-rose-400 text-[11px] font-bold text-slate-300 rounded-lg flex items-center gap-1.5 disabled:opacity-40 disabled:hover:border-[#2a475e] disabled:hover:text-slate-300 shrink-0"
              >
                {busyProvider === 'apple.com' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Unlink className="w-3.5 h-3.5" />
                )}
                <span>Unlink</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLinkApple}
                disabled={busyProvider === 'apple.com'}
                className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-[11px] font-bold rounded-lg flex items-center gap-1.5 disabled:opacity-50 shrink-0"
              >
                {busyProvider === 'apple.com' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link2 className="w-3.5 h-3.5" />}
                <span>Link Apple</span>
              </button>
            )}
          </div>
          {appleUnavailable && (
            <p className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2.5 py-1.5">
              {APPLE_NOT_ENABLED_MESSAGE}
            </p>
          )}
        </div>

        {onlyMethod && (
          <p className="text-[11px] text-slate-500 font-mono-code">
            This is your only sign-in method, so it can't be unlinked. Link another method above first.
          </p>
        )}
      </div>
    </div>
  );
};
