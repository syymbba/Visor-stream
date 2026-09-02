import React, { useState } from 'react';
import {
  auth,
  signOut,
  getAuthHeaders,
  EmailAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
} from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';

interface AccountDeletionPanelProps {
  onNavigateToTab?: (tab: string) => void;
}

const CONFIRM_WORD = 'DELETE';

/**
 * Maps the handful of reauthentication error codes a user is actually likely
 * to hit here into plain language. Deliberately not the full breadth of
 * AuthModal.tsx's `describeAuthError` (sign-up/sign-in specific cases don't
 * apply to a re-auth-before-delete flow).
 */
function describeReauthError(err: any): string {
  const code = err?.code as string | undefined;
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Incorrect password. Please try again.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return 'Re-authentication was cancelled. Please try again to continue.';
  }
  if (code === 'auth/user-mismatch') {
    return 'That sign-in did not match your current account. Please try again with the same account.';
  }
  return err?.message || 'Re-authentication failed. Please try again.';
}

export const AccountDeletionPanel: React.FC<AccountDeletionPanelProps> = ({ onNavigateToTab }) => {
  const { currentUser } = useAuth();
  const [confirmInput, setConfirmInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pendingPayoutMessage, setPendingPayoutMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!currentUser) return null;

  const providerId = currentUser.providerData[0]?.providerId;
  const isPasswordAccount = providerId === 'password';
  const canProceed = confirmInput.trim() === CONFIRM_WORD;

  const finishDeletion = async () => {
    setError(null);
    setPendingPayoutMessage(null);
    setIsDeleting(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 409) {
        setPendingPayoutMessage(
          data.error || 'You have a payout request in progress. Please wait for it to complete before deleting your account.',
        );
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete account. Please try again.');
      }

      await signOut(auth);
      onNavigateToTab && onNavigateToTab('landing');
    } catch (err: any) {
      setError(err.message || 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePasswordReauthAndDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPendingPayoutMessage(null);
    if (!currentUser.email) {
      setError('This account has no email on file to re-authenticate with.');
      return;
    }
    setIsDeleting(true);
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);
    } catch (err: any) {
      setIsDeleting(false);
      setError(describeReauthError(err));
      return;
    }
    await finishDeletion();
  };

  const handleOAuthReauthAndDelete = async () => {
    setError(null);
    setPendingPayoutMessage(null);
    setIsDeleting(true);
    try {
      const provider =
        providerId === 'google.com'
          ? new GoogleAuthProvider()
          : new OAuthProvider(providerId || 'apple.com');
      await reauthenticateWithPopup(currentUser, provider);
    } catch (err: any) {
      setIsDeleting(false);
      setError(describeReauthError(err));
      return;
    }
    await finishDeletion();
  };

  return (
    <div className="p-4 bg-[#0b0e14] rounded-2xl border border-rose-500/30 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Danger Zone: Delete Account</h4>
          <p className="text-[11px] text-slate-400 mt-1">
            This permanently deletes your Visor Stream account, profile, stream and payout history.
            This action cannot be undone.
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            For financial compliance, records of completed payments (tips and subscriptions you sent or
            received) are retained and are not deleted with your account.
          </p>
        </div>
      </div>

      {pendingPayoutMessage && (
        <p className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
          {pendingPayoutMessage}
        </p>
      )}
      {error && (
        <p className="text-[11px] text-rose-400 font-mono-code">{error}</p>
      )}

      <div className="space-y-2">
        <label className="text-xs font-bold text-white uppercase font-mono-code">
          Type "{CONFIRM_WORD}" to confirm
        </label>
        <input
          type="text"
          value={confirmInput}
          onChange={(e) => {
            setConfirmInput(e.target.value);
            setError(null);
            setPendingPayoutMessage(null);
          }}
          placeholder={CONFIRM_WORD}
          className="w-full px-3 py-2 bg-[#171a21] border border-[#2a475e] rounded-xl text-xs text-white font-mono-code focus:outline-none focus:border-rose-500"
          autoComplete="off"
        />
      </div>

      {canProceed && isPasswordAccount && (
        <form onSubmit={handlePasswordReauthAndDelete} className="pt-3 border-t border-[#2a475e]/60 space-y-3 animate-fadeIn">
          <p className="text-[11px] text-slate-300">
            Confirm your password to permanently delete your account.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Current password"
            className="w-full px-3 py-2 bg-[#171a21] border border-[#2a475e] rounded-xl text-xs text-white font-mono-code focus:outline-none focus:border-rose-500"
            autoComplete="current-password"
            required
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isDeleting || password.length === 0}
              className="px-3.5 py-2 bg-rose-500 text-slate-950 font-bold rounded-xl hover:bg-rose-400 text-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              <span>{isDeleting ? 'Deleting...' : 'Delete My Account Permanently'}</span>
            </button>
          </div>
        </form>
      )}

      {canProceed && !isPasswordAccount && (
        <div className="pt-3 border-t border-[#2a475e]/60 space-y-3 animate-fadeIn">
          <p className="text-[11px] text-slate-300">
            Re-authenticate with {providerId === 'google.com' ? 'Google' : providerId === 'apple.com' ? 'Apple' : 'your sign-in provider'} to
            permanently delete your account.
          </p>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleOAuthReauthAndDelete}
              disabled={isDeleting}
              className="px-3.5 py-2 bg-rose-500 text-slate-950 font-bold rounded-xl hover:bg-rose-400 text-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              <span>{isDeleting ? 'Deleting...' : 'Re-authenticate & Delete Account'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
