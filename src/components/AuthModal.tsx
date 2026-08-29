import React, { useState } from 'react';
import { 
  auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  fetchSignInMethodsForEmail
} from '../firebase';
import { basicGoogleSignIn } from '../services/googleAuth';
import { syncAuthUserWithFirestore, UserProfile } from '../services/userService';
import { VisorLogo } from './VisorLogo';
import { User, LogIn, UserPlus, Mail, Lock, Sparkles, Smartphone, ShieldCheck, X, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (profile: UserProfile) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login'
}) => {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');

  // Synchronize when initialMode changes or modal opens
  React.useEffect(() => {
    if (isOpen) {
      setIsSignUp(initialMode === 'signup');
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialMode]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gamerTag, setGamerTag] = useState('');
  const [networkProvider, setNetworkProvider] = useState<'mtn' | 'airtel' | 'mpesa'>('mtn');
  const [phone, setPhone] = useState('+256 780 123 456');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Forgot-password flow
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  if (!isOpen) return null;

  /**
   * Describes an auth error, including a special case for
   * `auth/account-exists-with-different-credential`: this fires when someone
   * tries to sign in with a provider (e.g. Google) using an email that's
   * already registered via a different provider (e.g. password). Firebase
   * doesn't auto-link these, so without this the user would see a raw,
   * confusing error with no path forward. We look up which method(s) the
   * email is actually registered with and tell them explicitly.
   */
  const describeAuthError = async (err: any, attemptedEmail: string): Promise<string> => {
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
    return err.message || 'Authentication failed. Please check credentials.';
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);
    try {
      if (!email.trim()) {
        throw new Error('Enter your email address first.');
      }
      await sendPasswordResetEmail(auth, email.trim());
      setResetEmailSent(true);
    } catch (err: any) {
      // Deliberately generic: don't reveal whether the email exists.
      setResetEmailSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const displayName = gamerTag.trim() || email.split('@')[0];
        
        await updateProfile(userCred.user, {
          displayName,
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        });

        // Fire off email verification (not blocking signup) - a verified
        // email is now required server-side before a creator can request a
        // payout (see /api/payouts/request), so this is a real prerequisite,
        // not just a formality.
        sendEmailVerification(userCred.user).catch((err) => {
          console.warn('Could not send verification email:', err);
        });

        const profile = await syncAuthUserWithFirestore(userCred.user, {
          displayName,
          networkProvider,
          mobileNumber: phone
        });

        confetti({ particleCount: 50, spread: 60 });
        setSuccessMsg(`Welcome to VISOR, ${displayName}! Check your inbox to verify your email.`);
        setTimeout(() => {
          onAuthSuccess(profile);
          onClose();
        }, 1500);
      } else {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const profile = await syncAuthUserWithFirestore(userCred.user);
        
        setSuccessMsg(`Welcome back, ${profile.displayName}!`);
        setTimeout(() => {
          onAuthSuccess(profile);
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg(await describeAuthError(err, email));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const res = await basicGoogleSignIn();
      if (res && res.user) {
        const profile = await syncAuthUserWithFirestore(res.user);
        confetti({ particleCount: 50, spread: 60 });
        setSuccessMsg(`Signed in as ${profile.displayName}`);
        setTimeout(() => {
          onAuthSuccess(profile);
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setErrorMsg(await describeAuthError(err, err.customData?.email || email));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <VisorLogo size="sm" showText={false} animated={true} />
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {isForgotPassword ? 'Reset Your Password' : isSignUp ? 'Create Visor Stream Account' : 'Sign In to Visor Stream'}
              </h2>
              <p className="text-xs text-slate-400">
                {isForgotPassword
                  ? "We'll email you a link to reset your password"
                  : isSignUp ? 'Sync live chat, MoMo tips & streamer rewards' : 'Access your streamer studio & favorites'}
              </p>
            </div>
          </div>
        </div>

        {/* Error / Success feedback */}
        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {isForgotPassword ? (
          <>
            {resetEmailSent ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>If an account exists for {email}, a password reset link is on its way.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3.5 font-sans">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 font-mono-code">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors shadow-lg shadow-sky-500/20 disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}
            <div className="text-center pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setResetEmailSent(false);
                  setErrorMsg(null);
                }}
                className="text-xs text-sky-400 hover:underline font-mono-code font-bold"
              >
                Back to Sign In
              </button>
            </div>
          </>
        ) : (
        <>
        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-2xl bg-white text-slate-950 font-bold text-xs flex items-center justify-center gap-3 hover:bg-slate-100 transition-colors shadow-md disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-800"></div>
          <span className="text-[10px] uppercase font-mono-code font-bold text-slate-500">Or with Email</span>
          <div className="flex-1 h-px bg-slate-800"></div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 font-sans">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 font-mono-code">Gamer Handle</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Kampala_Sniper_99"
                  value={gamerTag}
                  onChange={(e) => setGamerTag(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 font-mono-code">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 font-mono-code">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
                required
              />
            </div>
            {!isSignUp && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(true); setErrorMsg(null); setSuccessMsg(null); }}
                  className="text-[11px] text-sky-400 hover:underline font-mono-code"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          {isSignUp && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 font-mono-code">Default Mobile Money Provider</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNetworkProvider('mtn')}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all ${
                    networkProvider === 'mtn' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  🇺🇬 MTN MoMo
                </button>
                <button
                  type="button"
                  onClick={() => setNetworkProvider('airtel')}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all ${
                    networkProvider === 'airtel' ? 'bg-red-500/20 text-red-400 border-red-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  🔴 Airtel Money
                </button>
                <button
                  type="button"
                  onClick={() => setNetworkProvider('mpesa')}
                  className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all ${
                    networkProvider === 'mpesa' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  🇰🇪 M-Pesa
                </button>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors shadow-lg shadow-sky-500/20 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : isSignUp ? 'Create Visor Account' : 'Sign In to Account'}
            </button>
          </div>
        </form>

        {/* Toggle sign in / sign up */}
        <div className="text-center pt-1 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="text-xs text-sky-400 hover:underline font-mono-code font-bold"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
        </>
        )}
      </div>
    </div>
  );
};
