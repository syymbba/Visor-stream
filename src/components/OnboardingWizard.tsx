import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../lib/i18n';
import { auth, reload, sendEmailVerification } from '../firebase';
import { saveUserProfile, DEFAULT_USER_PROFILE, UserProfile } from '../services/userService';
import { MomoProviderPicker, MomoNetworkProvider } from './MomoProviderPicker';
import { VisorLogo } from './VisorLogo';
import { Mail, RefreshCw, ShieldCheck, Wallet, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
}

/**
 * Two-step post-signup onboarding flow shown once, only to genuinely new
 * signups (App.tsx routes here only when AuthModal reports `isNewUser`).
 * Both steps are soft gates — either can be skipped — matching the app's
 * existing policy that email verification is only hard-enforced server-side
 * at payout time, and that mobile money details can always be added later
 * from Settings.
 */
export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const { t } = useLanguage();
  const { currentUser, userProfile, refreshProfile } = useAuth();

  // Google sign-ups (and any account that is already verified) skip
  // straight to step 2 — no point showing a verification step that has
  // nothing to do.
  const [step, setStep] = useState<1 | 2>(() => (currentUser?.emailVerified ? 2 : 1));

  // Step 1: email verification
  const [isResending, setIsResending] = useState(false);
  const [isRechecking, setIsRechecking] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Step 2: wallet setup
  const [networkProvider, setNetworkProvider] = useState<MomoNetworkProvider>(
    (userProfile?.networkProvider as MomoNetworkProvider) || 'mtn'
  );
  const [mobileNumber, setMobileNumber] = useState(userProfile?.mobileNumber || '');
  const [isSaving, setIsSaving] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  if (!currentUser) return null;

  const handleResend = async () => {
    setVerifyMsg(null);
    setIsResending(true);
    try {
      await sendEmailVerification(currentUser);
      setVerifyMsg({ type: 'success', text: t('onboarding.verify.resend_success') });
    } catch (err) {
      console.warn('Could not resend verification email:', err);
      setVerifyMsg({ type: 'error', text: t('onboarding.verify.resend_error') });
    } finally {
      setIsResending(false);
    }
  };

  const handleRecheck = async () => {
    setVerifyMsg(null);
    setIsRechecking(true);
    try {
      await reload(currentUser);
      await refreshProfile();
      if (auth.currentUser?.emailVerified) {
        setStep(2);
      } else {
        setVerifyMsg({ type: 'error', text: t('onboarding.verify.recheck_not_yet') });
      }
    } catch (err) {
      console.warn('Could not recheck verification status:', err);
      setVerifyMsg({ type: 'error', text: t('onboarding.verify.recheck_not_yet') });
    } finally {
      setIsRechecking(false);
    }
  };

  const canSaveWallet = mobileNumber.trim().length > 0;

  const handleSaveWallet = async () => {
    if (!canSaveWallet) return;
    setWalletError(null);
    setIsSaving(true);
    try {
      // Same Firestore write path SettingsView's payments tab already uses
      // for these fields (saveUserProfile only forwards client-writable
      // fields, see userService.ts), so onboarding and Settings stay in sync.
      const base: UserProfile = userProfile ?? { ...DEFAULT_USER_PROFILE, uid: currentUser.uid };
      const updated: UserProfile = {
        ...base,
        networkProvider,
        mobileNumber,
      };
      const ok = await saveUserProfile(updated);
      if (ok) {
        await refreshProfile();
        onComplete();
      } else {
        setWalletError(t('onboarding.wallet.save_error'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fadeIn pb-16">
      <div className="steam-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#2a475e] space-y-6">
        <div className="space-y-3 text-center">
          <div className="flex items-center justify-center">
            <VisorLogo size="sm" showText={false} animated={true} />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white font-rajdhani uppercase tracking-wide">
            {t('onboarding.welcome_title')}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className={`w-2 h-2 rounded-full transition-colors ${step === 1 ? 'bg-[#38bdf8]' : 'bg-[#2a475e]'}`} />
            <span className={`w-2 h-2 rounded-full transition-colors ${step === 2 ? 'bg-[#38bdf8]' : 'bg-[#2a475e]'}`} />
          </div>
          <p className="text-[11px] uppercase font-mono-code tracking-wider text-slate-400">
            {step === 1 ? t('onboarding.step1_label') : t('onboarding.step2_label')}
          </p>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-[#0b0e14] rounded-2xl border border-[#2a475e]">
              <div className="w-10 h-10 rounded-xl bg-[#1b2838] text-[#38bdf8] flex items-center justify-center border border-[#2a475e] flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">{t('onboarding.verify.title')}</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t('onboarding.verify.description')}</p>
              </div>
            </div>

            {verifyMsg && (
              <div
                className={`p-3 rounded-2xl border text-xs flex items-center gap-2 animate-fadeIn ${
                  verifyMsg.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/30 text-red-300'
                }`}
              >
                {verifyMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{verifyMsg.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                {isResending ? t('auth.sending') : t('onboarding.verify.resend_button')}
              </button>
              <button
                type="button"
                onClick={handleRecheck}
                disabled={isRechecking}
                className="py-3 px-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg shadow-sky-500/20 disabled:opacity-50"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {isRechecking ? t('onboarding.verify.recheck_checking') : t('onboarding.verify.recheck_button')}
              </button>
            </div>

            <div className="text-center pt-2 border-t border-[#2a475e]">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-slate-400 hover:text-white hover:underline font-mono-code font-bold"
              >
                {t('onboarding.verify.skip_button')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-[#0b0e14] rounded-2xl border border-[#2a475e]">
              <div className="w-10 h-10 rounded-xl bg-[#1b2838] text-[#38bdf8] flex items-center justify-center border border-[#2a475e] flex-shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">{t('onboarding.wallet.title')}</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t('onboarding.wallet.description')}</p>
              </div>
            </div>

            <MomoProviderPicker
              provider={networkProvider}
              onProviderChange={setNetworkProvider}
              phone={mobileNumber}
              onPhoneChange={setMobileNumber}
              disabled={isSaving}
            />

            {walletError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{walletError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onComplete}
                className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
              >
                {t('onboarding.wallet.skip_button')}
              </button>
              <button
                type="button"
                onClick={handleSaveWallet}
                disabled={!canSaveWallet || isSaving}
                className="py-3 px-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg shadow-sky-500/20 disabled:opacity-50"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                {isSaving ? t('onboarding.wallet.saving') : t('onboarding.wallet.save_button')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
