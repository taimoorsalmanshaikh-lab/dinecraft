import React, { useState, useEffect } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';
import { sendPasswordReset } from '../../services/authService';
import {
  ChefHat,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Store,
  User,
  ArrowLeft,
} from 'lucide-react';

interface LoginFormProps {
  initialMode?: 'login' | 'signup';
  onModeChange?: (mode: 'login' | 'signup') => void;
}

const REMEMBERED_EMAIL_KEY = 'dinecraft_remembered_email';

export const LoginForm: React.FC<LoginFormProps> = ({
  initialMode = 'login',
  onModeChange,
}) => {
  const { navigate, currentPath, routeMatch } = useRouter();
  const { login, signup, signInWithGoogle, currentUser } = useDineCraft();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [isResetMode, setIsResetMode] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Status & feedback
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);

  // Load remembered email
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Sync mode with props
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // If already logged in, redirect to dashboard only on SaaS auth/root paths, never on storefront paths
  useEffect(() => {
    if (currentUser && !routeMatch.isStorefront && (currentPath === '/' || currentPath === '/login' || currentPath === '/signup' || routeMatch.isAuth)) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate, currentPath, routeMatch]);

  const switchMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setIsResetMode(false);
    setGeneralError('');
    setErrors({});
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!isResetMode) {
      if (!password) {
        errs.password = 'Password is required';
      } else if (password.length < 6) {
        errs.password = 'Password must be at least 6 characters';
      }

      if (mode === 'signup') {
        if (!fullName.trim()) {
          errs.fullName = 'Please enter your full name';
        }
        if (!restaurantName.trim()) {
          errs.restaurantName = 'Please enter your restaurant name';
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setResetSuccessMessage('');

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        // Save or remove remembered email
        try {
          if (rememberMe) {
            localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
          } else {
            localStorage.removeItem(REMEMBERED_EMAIL_KEY);
          }
        } catch {}

        await login(email.trim(), password);
        navigate('/dashboard');
      } else {
        await signup(fullName.trim(), email.trim(), restaurantName.trim(), password);
        navigate('/onboarding');
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      let msg = err.message || 'Authentication failed. Please verify your credentials.';
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        msg = 'Invalid email or password. Please check and try again.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/network-request-failed') {
        msg = 'Network connection issue. Please check your internet and try again.';
      }
      setGeneralError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setResetSuccessMessage('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrors({ email: 'Please enter your email address to receive reset instructions' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setIsResetSubmitting(true);
    try {
      await sendPasswordReset(trimmedEmail);
      setResetSuccessMessage(
        `We've sent a password reset link to ${trimmedEmail}. Please check your inbox and spam folder.`
      );
    } catch (err: any) {
      setGeneralError(err.message || 'Unable to send password reset email at this moment.');
    } finally {
      setIsResetSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGeneralError('');
    setIsGoogleSubmitting(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        if (err.code === 'auth/unauthorized-domain') {
          setGeneralError(
            'Google Sign-In is not enabled for this preview domain. Please sign in using your email and password below.'
          );
        } else {
          setGeneralError(err.message || 'Could not complete Google Sign-In.');
        }
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto py-4 sm:py-6 flex flex-col justify-center">
      {/* Brand Wordmark (centered above form) */}
      <div className="flex items-center justify-center gap-2.5 mb-6 sm:mb-8">
        <div className="w-10 h-10 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center shadow-xs">
          <ChefHat className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold tracking-tight text-[#17212B]">Dine</span>
          <span className="text-2xl font-bold tracking-tight text-[#FF6B00]">Craft</span>
        </div>
      </div>

      {/* Header Text */}
      <div className="text-center mb-6">
        {isResetMode ? (
          <>
            <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#17212B] tracking-tight">
              Reset Password
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1.5">
              Enter your email and we'll send you instructions to reset your password.
            </p>
          </>
        ) : mode === 'login' ? (
          <>
            <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#17212B] tracking-tight">
              Welcome Back!
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1.5">
              Sign in to your restaurant account.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#17212B] tracking-tight">
              Create Restaurant Account
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1.5">
              Launch your online ordering and website in minutes.
            </p>
          </>
        )}
      </div>

      {/* General Error Alert */}
      {generalError && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Reset Success Message */}
      {resetSuccessMessage && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5 leading-relaxed">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{resetSuccessMessage}</span>
        </div>
      )}

      {/* PASSWORD RESET FLOW */}
      {isResetMode ? (
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#17212B] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@restaurant.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                className={`w-full h-12 pl-10 pr-3.5 text-sm rounded-xl border bg-white text-[#17212B] transition-colors ${
                  errors.email
                    ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                    : 'border-[#E2E8F0] focus:border-[#FF6B00]'
                } focus:ring-2 focus:ring-[#FF6B00]/15 outline-hidden`}
              />
            </div>
            {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
          </div>

          <button
            type="submit"
            disabled={isResetSubmitting}
            className="w-full h-[52px] bg-[#FF6B00] hover:bg-[#E85D00] text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isResetSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Reset Link...</span>
              </>
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsResetMode(false)}
            className="w-full py-2.5 text-xs text-[#64748B] hover:text-[#17212B] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </button>
        </form>
      ) : (
        /* STANDARD SIGN IN / SIGN UP FLOW */
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* SIGN UP ADDITIONAL FIELDS */}
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1.5">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Marco Silva"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors({ ...errors, fullName: '' });
                      }}
                      className={`w-full h-12 pl-10 pr-3.5 text-sm rounded-xl border bg-white text-[#17212B] transition-colors ${
                        errors.fullName
                          ? 'border-rose-400 bg-rose-50/20'
                          : 'border-[#E2E8F0] focus:border-[#FF6B00]'
                      } focus:ring-2 focus:ring-[#FF6B00]/15 outline-hidden`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17212B] mb-1.5">
                    Restaurant Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Store className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Artisan Burger Co."
                      value={restaurantName}
                      onChange={(e) => {
                        setRestaurantName(e.target.value);
                        if (errors.restaurantName) setErrors({ ...errors, restaurantName: '' });
                      }}
                      className={`w-full h-12 pl-10 pr-3.5 text-sm rounded-xl border bg-white text-[#17212B] transition-colors ${
                        errors.restaurantName
                          ? 'border-rose-400 bg-rose-50/20'
                          : 'border-[#E2E8F0] focus:border-[#FF6B00]'
                      } focus:ring-2 focus:ring-[#FF6B00]/15 outline-hidden`}
                    />
                  </div>
                  {errors.restaurantName && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.restaurantName}</p>
                  )}
                </div>
              </>
            )}

            {/* A. EMAIL ADDRESS */}
            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@restaurant.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  className={`w-full h-12 pl-10 pr-3.5 text-sm rounded-xl border bg-white text-[#17212B] transition-colors ${
                    errors.email
                      ? 'border-rose-400 bg-rose-50/20'
                      : 'border-[#E2E8F0] focus:border-[#FF6B00]'
                  } focus:ring-2 focus:ring-[#FF6B00]/15 outline-hidden`}
                />
              </div>
              {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
            </div>

            {/* B. PASSWORD */}
            <div>
              <label className="block text-xs font-semibold text-[#17212B] mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  className={`w-full h-12 pl-10 pr-11 text-sm rounded-xl border bg-white text-[#17212B] transition-colors ${
                    errors.password
                      ? 'border-rose-400 bg-rose-50/20'
                      : 'border-[#E2E8F0] focus:border-[#FF6B00]'
                  } focus:ring-2 focus:ring-[#FF6B00]/15 outline-hidden`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.password}</p>
              )}
            </div>

            {/* C. REMEMBER ME AND FORGOT PASSWORD (In Login Mode) */}
            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 text-[#4B5563] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-[#E2E8F0] text-[#FF6B00] focus:ring-[#FF6B00] accent-[#FF6B00] cursor-pointer"
                  />
                  <span>Remember Me</span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsResetMode(true)}
                  className="text-xs font-semibold text-[#FF6B00] hover:text-[#E85D00] transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* D. PRIMARY LOGIN BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full h-[52px] bg-[#FF6B00] hover:bg-[#E85D00] text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-xs focus-visible:outline-2 focus-visible:outline-[#FF6B00] focus-visible:outline-offset-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{mode === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Restaurant Website'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* E. DIVIDER & GOOGLE SIGN-IN (Only on login, removed from sign up per user requirement) */}
          {mode === 'login' && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E2E8F0]" />
                </div>
                <div className="relative flex justify-center text-xs text-[#9CA3AF]">
                  <span className="bg-white px-3 font-medium">or</span>
                </div>
              </div>

              {/* F. GOOGLE SIGN-IN */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting || isGoogleSubmitting}
                className="w-full h-12 px-4 border border-[#E2E8F0] rounded-xl bg-white hover:bg-[#FFF9F4] text-[#17212B] text-xs font-semibold transition-all flex items-center justify-center gap-3 shadow-2xs active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {isGoogleSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                    <span>Connecting with Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </>
          )}

          {/* G. SIGN-UP / SIGN-IN TOGGLE LINK */}
          <div className="pt-2 text-center text-xs text-[#64748B]">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="font-semibold text-[#FF6B00] hover:text-[#E85D00] transition-colors cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-semibold text-[#FF6B00] hover:text-[#E85D00] transition-colors cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

          {/* H. TERMS AND PRIVACY */}
          <p className="text-[11px] text-center text-[#9CA3AF] pt-2 leading-relaxed">
            By continuing, you agree to our{' '}
            <span className="text-[#64748B] hover:text-[#17212B] transition-colors cursor-pointer">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="text-[#64748B] hover:text-[#17212B] transition-colors cursor-pointer">
              Privacy Policy
            </span>
            .
          </p>
        </div>
      )}
    </div>
  );
};
