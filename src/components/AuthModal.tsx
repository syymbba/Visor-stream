import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail
} from '../firebase';
import { googleSignIn } from '../services/googleAuth';
import { syncAuthUserWithFirestore, UserProfile } from '../services/userService';
import { VisorLogo } from './VisorLogo';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Sparkles, 
  Loader2,
  KeyRound,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (profile: UserProfile) => void;
  initialMode?: 'login' | 'signup';
}

type AuthViewMode = 'login' | 'signup' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login'
}) => {
  const [viewMode, setViewMode] = useState<AuthViewMode>(initialMode === 'signup' ? 'signup' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gamerTag, setGamerTag] = useState('');
  const [networkProvider, setNetworkProvider] = useState<'mtn' | 'airtel' | 'mpesa'>('mtn');
  const [phone, setPhone] = useState('+256 780 123 456');
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Synchronize initial mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setViewMode(initialMode === 'signup' ? 'signup' : 'login');
      setErrorMsg(null);
      setSuccessMsg(null);
      // Load remembered email if stored
      try {
        const savedEmail = localStorage.getItem('visor_remembered_email');
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch {
        // Ignore localStorage restrictions
      }
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      // Save or remove remembered email
      try {
        if (rememberMe && email) {
          localStorage.setItem('visor_remembered_email', email);
        } else {
          localStorage.removeItem('visor_remembered_email');
        }
      } catch {
        // Ignore localStorage errors
      }

      if (viewMode === 'forgot') {
        if (!email.trim()) {
          throw new Error('Please enter your email address to reset password.');
        }
        await sendPasswordResetEmail(auth, email.trim());
        setSuccessMsg(`Password reset email sent to ${email}. Check your inbox!`);
        setIsLoading(false);
        return;
      }

      if (viewMode === 'signup') {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const displayName = gamerTag.trim() || email.split('@')[0];
        
        await updateProfile(userCred.user, {
          displayName,
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        });

        const profile = await syncAuthUserWithFirestore(userCred.user, {
          displayName,
          networkProvider,
          mobileNumber: phone
        });

        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        setSuccessMsg(`Welcome to VISOR Stream, ${displayName}!`);
        setTimeout(() => {
          onAuthSuccess(profile);
          onClose();
        }, 1100);
      } else {
        // Sign In
        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const profile = await syncAuthUserWithFirestore(userCred.user);
        
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
        setSuccessMsg(`Welcome back, ${profile.displayName}!`);
        setTimeout(() => {
          onAuthSuccess(profile);
          onClose();
        }, 900);
      }
    } catch (err: any) {
      console.error('Auth action error:', err);
      let msg = err.message || 'Authentication failed. Please check credentials.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password. Please double check and try again.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No account found with this email. Please create an account.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many attempts. Please wait a moment or reset your password.';
      }
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      const res = await googleSignIn();
      if (res && res.user) {
        const profile = await syncAuthUserWithFirestore(res.user);
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        setSuccessMsg(`Signed in with Google as ${profile.displayName}`);
        setTimeout(() => {
          onAuthSuccess(profile);
          onClose();
        }, 900);
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(err.message || 'Google sign-in was interrupted or failed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setErrorMsg('Apple Sign-In is configured for iOS & Safari web clients. Use Google or Email for instant access.');
  };

  const switchMode = (newMode: AuthViewMode) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setViewMode(newMode);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{
        backgroundColor: 'var(--auth-bg-overlay, rgba(4, 7, 13, 0.88))',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
    >
      {/* Background click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Animated Modal Card */}
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ 
          type: 'spring', 
          damping: 26, 
          stiffness: 320, 
          mass: 0.8 
        }}
        className="auth-modal-reveal auth-glow-border relative z-10 w-full max-w-md overflow-hidden rounded-[28px] border transition-colors"
        style={{
          backgroundColor: 'var(--auth-card-bg, #0d121f)',
          borderColor: 'var(--auth-card-border, rgba(56, 189, 248, 0.22))',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85), 0 0 35px -5px var(--auth-accent-glow, rgba(56, 189, 248, 0.35))'
        }}
      >
        {/* Subtle Ambient Top Radial Light */}
        <div 
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-44 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, var(--auth-accent, #38bdf8) 0%, transparent 70%)' }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 z-20 p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/80 transition-all focus:outline-none focus:ring-2 focus:ring-sky-400/40"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Section: Centered Brand Title & Welcome Subtitle */}
          <div className="text-center space-y-3 pt-1">
            <div className="inline-flex items-center justify-center">
              <VisorLogo size="md" showText={false} animated={true} />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-rajdhani font-black text-slate-100 uppercase tracking-wide">
                VISOR <span className="text-[#38BDF8]">STREAM</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                {viewMode === 'login' && 'Good to see you. Dive back in.'}
                {viewMode === 'signup' && 'Join the revolution. Create your streamer account.'}
                {viewMode === 'forgot' && 'Reset your password to regain access.'}
              </p>
            </div>
          </div>

          {/* Toggle Mechanics: Dynamic Action Switcher */}
          {viewMode !== 'forgot' ? (
            <div className="relative p-1 bg-[#070b13] border border-slate-800/80 rounded-2xl flex items-center">
              <motion.div
                className="absolute top-1 bottom-1 rounded-xl bg-gradient-to-r from-sky-500/20 to-sky-400/10 border border-sky-400/40 shadow-sm"
                layout
                transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                style={{
                  left: viewMode === 'login' ? '4px' : '50%',
                  width: 'calc(50% - 4px)',
                }}
              />
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`relative z-10 flex-1 py-2 text-xs font-bold font-rajdhani uppercase tracking-wider transition-colors text-center ${
                  viewMode === 'login' ? 'text-sky-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`relative z-10 flex-1 py-2 text-xs font-bold font-rajdhani uppercase tracking-wider transition-colors text-center ${
                  viewMode === 'signup' ? 'text-sky-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 font-bold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
              <span className="text-[11px] font-mono-code uppercase font-semibold text-sky-400/80 px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20">
                Password Recovery
              </span>
            </div>
          )}

          {/* Feedback messages */}
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                transition={{ duration: 0.2 }}
                className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2.5 overflow-hidden"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                transition={{ duration: 0.2 }}
                className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start gap-2.5 overflow-hidden"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
                <span className="leading-relaxed">{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Fields Container with Fluid Transition */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {viewMode === 'signup' && (
                <motion.div
                  key="signup-handle"
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="space-y-1 overflow-hidden"
                >
                  <label className="text-xs font-bold text-slate-300 font-rajdhani uppercase tracking-wider flex items-center justify-between">
                    <span>Gamer Handle</span>
                    <span className="text-[10px] text-slate-500 lowercase font-mono-code font-normal">public gamertag</span>
                  </label>
                  <div className="auth-input-highlight relative flex items-center bg-[#070b13] border border-slate-800 rounded-xl transition-all">
                    <User className="w-4 h-4 text-slate-500 ml-3.5 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="e.g. Kampala_Sniper_99"
                      value={gamerTag}
                      onChange={(e) => setGamerTag(e.target.value)}
                      required={viewMode === 'signup'}
                      className="w-full px-3 py-2.5 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-medium"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 font-rajdhani uppercase tracking-wider">
                Email Address
              </label>
              <div className="auth-input-highlight relative flex items-center bg-[#070b13] border border-slate-800 rounded-xl transition-all">
                <Mail className="w-4 h-4 text-slate-500 ml-3.5 flex-shrink-0" />
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* Password Field (Only for Login and Signup) */}
            {viewMode !== 'forgot' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 font-rajdhani uppercase tracking-wider">
                  Password
                </label>
                <div className="auth-input-highlight relative flex items-center bg-[#070b13] border border-slate-800 rounded-xl transition-all">
                  <Lock className="w-4 h-4 text-slate-500 ml-3.5 flex-shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="mr-3 text-slate-500 hover:text-slate-300 p-1 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Signup Additional Mobile Money Provider Options */}
            <AnimatePresence mode="wait">
              {viewMode === 'signup' && (
                <motion.div
                  key="signup-momo"
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="space-y-1.5 overflow-hidden pt-1"
                >
                  <label className="text-xs font-bold text-slate-300 font-rajdhani uppercase tracking-wider flex items-center justify-between">
                    <span>Default MoMo Wallet</span>
                    <span className="text-[10px] text-sky-400/80 font-mono-code font-normal">instant tips</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNetworkProvider('mtn')}
                      className={`py-2 px-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center gap-1 ${
                        networkProvider === 'mtn' 
                          ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/60 shadow-[0_0_12px_rgba(234,179,8,0.2)]' 
                          : 'bg-[#070b13] text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span>🇺🇬 MTN MoMo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNetworkProvider('airtel')}
                      className={`py-2 px-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center gap-1 ${
                        networkProvider === 'airtel' 
                          ? 'bg-red-500/20 text-red-400 border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.2)]' 
                          : 'bg-[#070b13] text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span>🔴 Airtel Money</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNetworkProvider('mpesa')}
                      className={`py-2 px-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center gap-1 ${
                        networkProvider === 'mpesa' 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.2)]' 
                          : 'bg-[#070b13] text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span>🇰🇪 M-Pesa</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Remember Me Checkbox & Forgot Password Link (Only for Login view) */}
            {viewMode === 'login' && (
              <div className="flex items-center justify-between pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                      rememberMe 
                        ? 'bg-sky-500 border-sky-400 text-slate-950 shadow-[0_0_8px_rgba(56,189,248,0.4)]' 
                        : 'bg-[#070b13] border-slate-700 group-hover:border-slate-500'
                    }`}>
                      {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 group-hover:text-slate-300 font-medium">
                    Remember me
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-xs text-sky-400 hover:text-sky-300 hover:underline font-semibold font-rajdhani tracking-wide transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Primary Full-Width Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-300 hover:to-sky-400 text-slate-950 font-rajdhani font-black text-sm uppercase tracking-wider transition-all transform active:scale-[0.98] shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Processing...</span>
                  </>
                ) : viewMode === 'login' ? (
                  <span>Sign In</span>
                ) : viewMode === 'signup' ? (
                  <span>Create Account</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-slate-950" />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Horizontal Divider: "or continue with" */}
          {viewMode !== 'forgot' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[11px] uppercase font-mono-code font-bold text-slate-500 tracking-wider">
                  or continue with
                </span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Social Login Buttons: Google & Apple */}
              <div className="grid grid-cols-2 gap-3">
                {/* Google Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="py-2.5 px-3 rounded-xl bg-[#070b13] border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2.5 hover:bg-slate-900 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
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
                  <span>Google</span>
                </button>

                {/* Apple Button */}
                <button
                  type="button"
                  onClick={handleAppleSignIn}
                  disabled={isLoading}
                  className="py-2.5 px-3 rounded-xl bg-[#070b13] border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2.5 hover:bg-slate-900 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
                >
                  <svg className="w-4 h-4 flex-shrink-0 fill-current text-white" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.33-6.53-9.87-11.75-21.2-15.66-34-3.91-12.8-5.87-24.96-5.87-36.48 0-15.19 3.91-28.02 11.74-38.48 7.83-10.46 17.6-15.79 29.31-15.98 5.76 0 11.83 1.48 18.23 4.43 6.39 2.96 10.66 4.44 12.81 4.44 1.74 0 6.23-1.6 13.48-4.79 7.25-3.19 13.59-4.54 19.03-4.06 14.33 1.09 25.54 6.78 33.64 17.07-12.59 7.64-18.78 17.84-18.57 30.61.22 10.02 4.02 18.59 11.41 25.72 7.39 7.13 16.3 11.05 26.74 11.74-2.18 6.52-4.9 12.82-8.16 18.91zM119.22 31.84c0-7.39 2.68-14.32 8.04-20.79 5.37-6.47 11.98-10.35 19.85-11.64.44 1.52.65 3.04.65 4.56 0 7.39-2.79 14.54-8.37 21.43-5.58 6.9-12.3 10.84-20.17 11.82-.44-1.74-.65-3.48-.65-5.21z" />
                  </svg>
                  <span>Apple</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Link: Toggle between sign-in and sign-up states */}
          <div className="text-center pt-3 border-t border-slate-800/80">
            {viewMode === 'login' ? (
              <p className="text-xs text-slate-400">
                New here?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-sky-400 hover:text-sky-300 font-bold hover:underline font-rajdhani text-sm uppercase tracking-wider ml-1 transition-colors"
                >
                  Create account
                </button>
              </p>
            ) : viewMode === 'signup' ? (
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-sky-400 hover:text-sky-300 font-bold hover:underline font-rajdhani text-sm uppercase tracking-wider ml-1 transition-colors"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-xs text-sky-400 hover:text-sky-300 font-bold hover:underline font-rajdhani text-sm uppercase tracking-wider transition-colors"
              >
                Back to Sign in
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
