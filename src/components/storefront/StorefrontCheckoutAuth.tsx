import React, { useState } from 'react';
import { useDineCraft } from '../../context/DineCraftContext';
import { Restaurant } from '../../types';
import {
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

interface StorefrontCheckoutAuthProps {
  restaurant: Restaurant;
  onSuccess: () => void;
  defaultEmail?: string;
  defaultName?: string;
  defaultPhone?: string;
  defaultAddress?: string;
}

export const StorefrontCheckoutAuth: React.FC<StorefrontCheckoutAuthProps> = ({
  restaurant,
  onSuccess,
  defaultEmail = '',
  defaultName = '',
  defaultPhone = '',
  defaultAddress = '',
}) => {
  const { login, signUpCustomer } = useDineCraft();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');

  // Form states
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState(defaultPhone);
  const [address, setAddress] = useState(defaultAddress);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'signin') {
        await login(cleanEmail, password);
      } else {
        const cleanName = name.trim();
        if (!cleanName) {
          setErrorMsg('Please enter your full name.');
          setIsLoading(false);
          return;
        }
        await signUpCustomer(cleanEmail, password, cleanName, phone.trim(), address.trim(), restaurant.id);
      }
      onSuccess();
    } catch (err: any) {
      console.error('Checkout auth error:', err);
      const msg = err.message || 'Authentication failed. Please verify your credentials.';
      if (msg.includes('already registered') || msg.includes('User already registered')) {
        setErrorMsg('An account with this email already exists. Please switch to Sign In.');
      } else if (msg.includes('Invalid login credentials')) {
        setErrorMsg('Invalid email or password. Please try again.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sf-card p-6 sm:p-8 space-y-6 animate-fadeIn text-[var(--text,#111827)]">
      {/* Header */}
      <div className="text-center space-y-2 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-[var(--brand-subtle,#FFF1E6)] text-[var(--brand,#FF6900)] flex items-center justify-center mx-auto shadow-2xs">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2
          className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text,#111827)]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {mode === 'signup' ? 'Create Your Customer Account' : 'Welcome Back'}
        </h2>
        <p className="text-xs text-[var(--text-muted,#6B7280)] leading-relaxed">
          An account is required to securely place and track your live kitchen order at{' '}
          <strong className="text-[var(--text,#111827)]">{restaurant.name}</strong>. Your cart items are saved.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#F3F4F6] p-1 rounded-full max-w-xs mx-auto">
        <button
          type="button"
          onClick={() => {
            setMode('signup');
            setErrorMsg(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
            mode === 'signup'
              ? 'bg-white text-[var(--text,#111827)] shadow-2xs'
              : 'text-[var(--text-muted,#6B7280)] hover:text-[var(--text,#111827)]'
          }`}
        >
          New Customer
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('signin');
            setErrorMsg(null);
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
            mode === 'signin'
              ? 'bg-white text-[var(--text,#111827)] shadow-2xs'
              : 'text-[var(--text-muted,#6B7280)] hover:text-[var(--text,#111827)]'
          }`}
        >
          Sign In
        </button>
      </div>

      {/* Error alert */}
      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5 max-w-lg mx-auto">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
        {mode === 'signup' && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text,#111827)] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Full Name *</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full h-11 px-4 text-xs bg-[#F9FAFB] rounded-xl border border-black/10 focus:border-[var(--brand,#FF6900)] focus:ring-2 focus:ring-[var(--brand,#FF6900)]/20 focus:outline-hidden transition-all text-[var(--text,#111827)]"
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--text,#111827)] flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>Email Address *</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-11 px-4 text-xs bg-[#F9FAFB] rounded-xl border border-black/10 focus:border-[var(--brand,#FF6900)] focus:ring-2 focus:ring-[var(--brand,#FF6900)]/20 focus:outline-hidden transition-all text-[var(--text,#111827)]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[var(--text,#111827)] flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Password *</span>
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full h-11 px-4 text-xs bg-[#F9FAFB] rounded-xl border border-black/10 focus:border-[var(--brand,#FF6900)] focus:ring-2 focus:ring-[var(--brand,#FF6900)]/20 focus:outline-hidden transition-all text-[var(--text,#111827)]"
          />
        </div>

        {mode === 'signup' && (
          <>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text,#111827)] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Phone Number</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full h-11 px-4 text-xs bg-[#F9FAFB] rounded-xl border border-black/10 focus:border-[var(--brand,#FF6900)] focus:ring-2 focus:ring-[var(--brand,#FF6900)]/20 focus:outline-hidden transition-all text-[var(--text,#111827)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text,#111827)] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Delivery Address (Optional)</span>
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, apartment or suite"
                className="w-full h-11 px-4 text-xs bg-[#F9FAFB] rounded-xl border border-black/10 focus:border-[var(--brand,#FF6900)] focus:ring-2 focus:ring-[var(--brand,#FF6900)]/20 focus:outline-hidden transition-all text-[var(--text,#111827)]"
              />
            </div>
          </>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="sf-button-primary w-full py-3.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-bold"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{mode === 'signup' ? 'Creating Account...' : 'Signing In...'}</span>
              </span>
            ) : (
              <>
                <span>{mode === 'signup' ? 'Create Account & Continue' : 'Sign In & Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        <div className="pt-1 flex items-center justify-center gap-2 text-[11px] text-[var(--text-muted,#6B7280)]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Your cart and ordering details will be preserved</span>
        </div>
      </form>
    </div>
  );
};
