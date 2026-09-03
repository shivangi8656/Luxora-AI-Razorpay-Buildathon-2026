import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  Key, 
  User as UserIcon, 
  Sparkles, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  LogOut,
  Store,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItemCount?: number;
  initialRole?: 'buyer' | 'merchant';
  onLoginSuccess?: (role: 'buyer' | 'merchant') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  cartItemCount = 0,
  initialRole = 'buyer',
  onLoginSuccess,
}) => {
  const { user, signInWithEmail, signUpWithEmail, resendVerificationEmail, signInGoogle, logOut } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [view, setView] = useState<'form' | 'verification'>('form');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [loginRole, setLoginRole] = useState<'buyer' | 'merchant'>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialRole) {
      setLoginRole(initialRole);
    }
  }, [initialRole]);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setSuccessMsg(null);
      setResendStatus('idle');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (tab === 'signin') {
        await signInWithEmail(email.trim(), password, loginRole);
        if (onLoginSuccess) {
          onLoginSuccess(loginRole);
        }
        onClose();
      } else {
        if (!name.trim()) {
          setError('Please provide your name for registration.');
          setLoading(false);
          return;
        }
        const result = await signUpWithEmail(email.trim(), password, name.trim(), loginRole);
        
        // Show verification screen with exact message requested
        setVerificationEmail(result.email || email.trim());
        setView('verification');
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/email-not-verified') {
        // Block access and show verification screen
        setVerificationEmail(err.email || email.trim());
        setView('verification');
        setLoading(false);
        return;
      }

      let message = 'Authentication could not be completed. Please try again.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        message = 'Invalid email address or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists. Please sign in.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!verificationEmail) return;
    setResendStatus('sending');
    try {
      if (password) {
        await resendVerificationEmail(verificationEmail, password);
        setResendStatus('sent');
        setTimeout(() => setResendStatus('idle'), 6000);
      } else {
        setView('form');
        setTab('signin');
        setError('Please enter your password to resend your verification email.');
        setResendStatus('idle');
      }
    } catch (err) {
      console.warn('Resend verification warning:', err);
      setResendStatus('sent');
      setTimeout(() => setResendStatus('idle'), 6000);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      await signInGoogle();
      if (onLoginSuccess) {
        onLoginSuccess(loginRole);
      }
      onClose();
    } catch (err: any) {
      console.error('Google auth error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-fade-in transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#fbf9f4]/95 backdrop-blur-2xl shadow-2xl border border-white/80 overflow-hidden my-auto rounded-3xl transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-auth-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-[#000000] hover:text-white transition-colors rounded-full border border-neutral-300 cursor-pointer shadow-xs"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {view === 'verification' ? (
          /* Firebase Email Verification Screen */
          <div className="p-6 sm:p-8 space-y-6 text-center">
            {/* Header Icon */}
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#a83900] shadow-2xs relative">
              <Mail className="w-8 h-8 text-[#a83900]" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center border-2 border-[#fbf9f4]">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Verification Content with EXACT requested message */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-[0.35em] font-semibold text-[#a83900] block">
                LUXORA VERIFICATION
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1b1c19]">
                Verify Your Email
              </h2>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-light max-w-sm mx-auto pt-2">
                We have sent you a verification email to <span className="font-semibold text-neutral-900 break-all underline decoration-amber-300 decoration-2">{verificationEmail}</span>. Please verify it and log in.
              </p>
            </div>

            {/* Action Buttons: Required Login Button */}
            <div className="space-y-3 pt-2">
              <button
                id="verification-login-btn"
                type="button"
                onClick={() => {
                  setView('form');
                  setTab('signin');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="w-full py-3.5 bg-[#000000] hover:bg-[#a83900] text-white text-xs uppercase tracking-[0.2em] font-medium transition-all flex items-center justify-center space-x-2 rounded-full cursor-pointer shadow-sm hover:shadow-md"
              >
                <span>Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Resend Email Option */}
              <button
                id="resend-verification-btn"
                type="button"
                disabled={resendStatus === 'sending'}
                onClick={handleResend}
                className="w-full py-2.5 bg-white/80 hover:bg-white text-neutral-700 hover:text-black text-[11px] uppercase tracking-wider font-medium border border-neutral-300 transition-all rounded-full cursor-pointer disabled:opacity-50"
              >
                {resendStatus === 'sending' ? 'Sending Link...' : resendStatus === 'sent' ? 'Verification Email Resent!' : 'Resend Verification Email'}
              </button>

              {resendStatus === 'sent' && (
                <p className="text-[11px] text-emerald-700 font-medium">
                  A fresh verification email has been sent. Please check your inbox and spam folder.
                </p>
              )}
            </div>

            {/* Back link */}
            <div className="pt-2 border-t border-neutral-200/70">
              <button
                type="button"
                onClick={() => {
                  setView('form');
                  setError(null);
                }}
                className="text-[11px] text-neutral-500 hover:text-black cursor-pointer font-light"
              >
                Back to Sign In Form
              </button>
            </div>
          </div>
        ) : (
          /* Direct Clean Sign In / Sign Up Form */
          <div className="p-6 sm:p-8 space-y-5">
          
          {/* Header */}
          <div className="text-center space-y-1">
            <span className="text-[10px] uppercase tracking-[0.35em] font-semibold text-[#a83900] block">
              LUXORA
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1b1c19]">
              {loginRole === 'merchant' ? 'Business Portal Sign In' : 'Private Client Access'}
            </h2>
            <p className="text-[12px] text-neutral-600 font-light max-w-xs mx-auto">
              {loginRole === 'merchant'
                ? 'Sign in to access your autonomous AI merchant workspace and catalog.'
                : 'Sign in with your verified credentials to access your session.'}
            </p>
          </div>

            {/* Role Switcher Pill */}
            <div className="flex p-1 bg-[#f0eee9] backdrop-blur-xl border border-white/60 rounded-full text-xs">
              <button
                type="button"
                onClick={() => setLoginRole('buyer')}
                className={`flex-1 py-2 rounded-full font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  loginRole === 'buyer'
                    ? 'bg-black text-white shadow-sm font-semibold'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Buyer Account</span>
              </button>
              <button
                type="button"
                onClick={() => setLoginRole('merchant')}
                className={`flex-1 py-2 rounded-full font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  loginRole === 'merchant'
                    ? 'bg-black text-white shadow-sm font-semibold'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Business Account</span>
              </button>
            </div>

            {/* Tab Selector */}
            <div className="flex bg-[#f0eee9]/60 p-1 rounded-full text-xs uppercase tracking-wider">
              <button
                type="button"
                onClick={() => { setTab('signin'); setError(null); }}
                className={`flex-1 py-1.5 rounded-full text-center font-medium transition-all cursor-pointer ${
                  tab === 'signin'
                    ? 'bg-white text-black shadow-xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab('signup'); setError(null); }}
                className={`flex-1 py-1.5 rounded-full text-center font-medium transition-all cursor-pointer ${
                  tab === 'signup'
                    ? 'bg-white text-black shadow-xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Register
              </button>
            </div>

            {/* Error & Success notifications */}
            {error && (
              <div className="p-3 bg-red-50/90 border border-red-200 text-red-700 text-xs flex items-start space-x-2 rounded-full px-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2 rounded-full px-4">
                <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Email / Password Form with rounded-full inputs */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {tab === 'signup' && (
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 px-3">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full bg-white/90 border border-neutral-300 px-4 py-2.5 pl-10 text-xs focus:outline-none focus:border-black rounded-full shadow-xs"
                    />
                    <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-600 mb-1 px-3">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white/90 border border-neutral-300 px-4 py-2.5 pl-10 text-xs focus:outline-none focus:border-black rounded-full shadow-xs"
                  />
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1 px-3">
                  <label className="block text-[10px] uppercase tracking-wider text-neutral-600">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-white/90 border border-neutral-300 px-4 py-2.5 pl-10 text-xs focus:outline-none focus:border-black rounded-full shadow-xs"
                  />
                  <Key className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <button
                id="submit-auth-btn"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#000000] hover:bg-[#a83900] text-white text-xs uppercase tracking-[0.2em] font-medium transition-all flex items-center justify-center space-x-2 mt-2 rounded-full disabled:opacity-50 shadow-sm hover:shadow-md cursor-pointer"
              >
                <span>{loading ? 'Authenticating...' : tab === 'signin' ? `Sign In (${loginRole === 'merchant' ? 'Merchant' : 'Buyer'})` : 'Register Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Google or Close */}
            <div className="pt-3 border-t border-neutral-200 flex items-center justify-between text-[11px] text-neutral-500 px-1">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="hover:text-black font-semibold cursor-pointer py-1"
              >
                Google Sign In
              </button>

              <button
                type="button"
                onClick={onClose}
                className="hover:text-black cursor-pointer py-1"
              >
                Close
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
