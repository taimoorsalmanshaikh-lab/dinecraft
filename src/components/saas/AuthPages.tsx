import React, { useState } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';
import { UtensilsCrossed, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface AuthPagesProps {
  type: 'login' | 'signup';
}

export const AuthPages: React.FC<AuthPagesProps> = ({ type }) => {
  const { navigate } = useRouter();
  const { login, signup, signInWithGoogle, currentUser } = useDineCraft();

  const isLogin = type === 'login';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!fullName.trim()) {
        errs.fullName = 'Please enter your full name';
      }
      if (!restaurantName.trim()) {
        errs.restaurantName = 'Please enter your restaurant name';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    if (!validate()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email.trim(), password);
        navigate('/dashboard');
      } else {
        const slug = await signup(fullName.trim(), email.trim(), restaurantName.trim(), password);
        navigate('/onboarding');
      }
    } catch (err: any) {
      console.error('Auth submit error:', err);
      let msg = err.message || 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Invalid email or password. Please verify and try again.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password is too weak. Please use at least 6 characters with letters and numbers.';
      }
      setGeneralError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGeneralError('');
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        if (err.code === 'auth/unauthorized-domain') {
          setGeneralError('Google Sign-In is not authorized for this preview domain in Firebase. Please use Email & Password sign-in or registration below.');
        } else {
          setGeneralError(err.message || 'Could not complete Google Sign-In.');
        }
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F2] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2.5 text-center group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-xs">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-slate-900">DineCraft</span>
        </button>

        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {isLogin ? 'Sign in to your restaurant' : 'Start your restaurant business'}
        </h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          {isLogin
            ? 'Manage your menus, live customer orders, and online storefront.'
            : 'Build your restaurant website and launch online ordering in minutes.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-md border border-orange-100/80 space-y-6">
          {generalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Real Google Sign-In */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full py-2.5 px-4 border border-slate-300 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2.5 shadow-2xs active:scale-98 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>{isGoogleLoading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider text-slate-400">
                <span className="bg-white px-2">Or continue with email</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Marco Silva"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors({ ...errors, fullName: '' });
                  }}
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                    errors.fullName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                  } focus:border-orange-500 focus:outline-hidden`}
                />
                {errors.fullName && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.fullName}</p>
                )}
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Saffron Grill & Cafe"
                  value={restaurantName}
                  onChange={(e) => {
                    setRestaurantName(e.target.value);
                    if (errors.restaurantName) setErrors({ ...errors, restaurantName: '' });
                  }}
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                    errors.restaurantName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                  } focus:border-orange-500 focus:outline-hidden`}
                />
                {errors.restaurantName && (
                  <p className="text-[11px] text-rose-600 mt-1">{errors.restaurantName}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="owner@myrestaurant.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                  errors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                } focus:border-orange-500 focus:outline-hidden`}
              />
              {errors.email && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  className={`w-full px-3.5 py-2.5 pr-10 text-xs rounded-xl border ${
                    errors.password ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                  } focus:border-orange-500 focus:outline-hidden`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? 'Processing...' : isLogin ? 'Sign In to Dashboard' : 'Create Restaurant Website'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Switch link */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            {isLogin ? (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/signup')}
                  className="font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                >
                  Sign up for free
                </button>
              </p>
            ) : (
              <p>
                Already have a restaurant?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
