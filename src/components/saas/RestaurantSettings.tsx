import React, { useState, useEffect } from 'react';
import { useDineCraft } from '../../context/DineCraftContext';
import {
  Save,
  Globe,
  AlertTriangle,
  Check,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';
import {
  isValidSubdomain,
  buildStorefrontUrl,
  getRootDomain,
  generateSlug,
  isSubdomainModeEnabled,
  openStorefrontInNewTab,
} from '../../lib/subdomain';
import { checkSlugAvailable } from '../../services/restaurantService';

export const RestaurantSettings: React.FC = () => {
  const { activeRestaurant, updateRestaurant, restaurants, addToast } = useDineCraft();

  const [form, setForm] = useState({ ...activeRestaurant });
  const [slugWarning, setSlugWarning] = useState(false);
  const [domainModalOpen, setDomainModalOpen] = useState(false);
  const [customDomainInput, setCustomDomainInput] = useState('');
  const [subdomainStatus, setSubdomainStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle');
  const [subdomainMessage, setSubdomainMessage] = useState('');
  const [suggestedSlug, setSuggestedSlug] = useState<string | null>(null);

  const logoOptions = ['🍔', '🍕', '🌮', '🍗', '🍲', '☕', '🥐', '🥩', '🥗', '🍩', '🍣', '🍰'];

  useEffect(() => {
    const clean = (form.slug || '').trim().toLowerCase();
    if (!clean) {
      setSubdomainStatus('invalid');
      setSubdomainMessage('Slug is required.');
      setSuggestedSlug(null);
      return;
    }

    if (clean === activeRestaurant.slug?.toLowerCase()) {
      setSubdomainStatus('available');
      setSubdomainMessage('Current active URL slug.');
      setSuggestedSlug(null);
      return;
    }

    const formatCheck = isValidSubdomain(clean);
    if (!formatCheck.valid) {
      setSubdomainStatus('invalid');
      setSubdomainMessage(formatCheck.error || 'Invalid slug format.');
      setSuggestedSlug(null);
      return;
    }

    setSubdomainStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const res = await checkSlugAvailable(clean, activeRestaurant.id);
        if (res.available) {
          setSubdomainStatus('available');
          setSubdomainMessage('Slug is available!');
          setSuggestedSlug(null);
        } else {
          setSubdomainStatus('taken');
          setSubdomainMessage(res.error || 'Slug already taken.');
          setSuggestedSlug(res.suggestedSlug || null);
        }
      } catch {
        setSubdomainStatus('invalid');
        setSubdomainMessage('Could not verify slug availability due to a network error.');
        setSuggestedSlug(null);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [form.slug, activeRestaurant.slug, activeRestaurant.id]);

  const handleSlugChange = (newSlug: string) => {
    const cleaned = generateSlug(newSlug);
    setForm({ ...form, slug: cleaned, subdomain: cleaned });
    if (cleaned !== activeRestaurant.slug) {
      setSlugWarning(true);
    } else {
      setSlugWarning(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanSlug = (form.slug || '').trim().toLowerCase();
    const formatCheck = isValidSubdomain(cleanSlug);
    if (!formatCheck.valid) {
      addToast({
        type: 'error',
        title: 'Invalid Subdomain',
        message: formatCheck.error || 'Please enter a valid subdomain.',
      });
      return;
    }

    if (subdomainStatus === 'taken') {
      addToast({
        type: 'error',
        title: 'Subdomain Already Taken',
        message: 'This subdomain is taken by another store. Please choose a different one.',
      });
      return;
    }

    // Validate slug uniqueness against other restaurants in memory
    const existing = restaurants.find(
      (r) =>
        r.id !== activeRestaurant.id &&
        (r.slug?.toLowerCase() === cleanSlug || r.subdomain?.toLowerCase() === cleanSlug)
    );
    if (existing) {
      addToast({
        type: 'error',
        title: 'Slug Already Taken',
        message: `The subdomain "${cleanSlug}" is already in use by another restaurant.`,
      });
      return;
    }

    updateRestaurant({
      ...form,
      slug: cleanSlug,
      subdomain: cleanSlug,
    });
    setSlugWarning(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Restaurant Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure business details, ordering policies, subdomains, and future custom domains.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Business Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            1. Restaurant Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Restaurant Brand Name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Brand Logo Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {logoOptions.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setForm({ ...form, logo: em })}
                    className={`w-9 h-9 text-lg rounded-xl border flex items-center justify-center transition-all ${
                      form.logo === em
                        ? 'border-orange-600 bg-orange-50 font-bold scale-105'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Contact Phone Line
              </label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kitchen Street Address
              </label>
              <input
                type="text"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                City / Region
              </label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Business & Kitchen Hours
              </label>
              <input
                type="text"
                required
                value={form.openingHours}
                onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Ordering, Currency & Fulfilment Rules */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              2. Ordering, Currency & Delivery Rules
            </h3>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Live Storefront Sync
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Store Currency Selector */}
            <div className="sm:col-span-2 p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <label className="block font-bold text-slate-900">
                Store Currency Symbol
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { symbol: '$', label: 'USD / Dollar ($)' },
                  { symbol: 'Rs', label: 'PKR / Rupee (Rs)' },
                  { symbol: '₹', label: 'INR (₹)' },
                  { symbol: '€', label: 'EUR / Euro (€)' },
                  { symbol: '£', label: 'GBP / Pound (£)' },
                  { symbol: 'AED', label: 'AED (Dirham)' },
                  { symbol: 'SAR', label: 'SAR (Riyal)' },
                  { symbol: 'C$', label: 'CAD (C$)' },
                ].map((cur) => (
                  <button
                    key={cur.symbol}
                    type="button"
                    onClick={() => setForm({ ...form, currency: cur.symbol })}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      (form.currency || '$') === cur.symbol
                        ? 'bg-[#FF6900] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {cur.label}
                  </button>
                ))}
              </div>
              <div className="pt-1 flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">Or type custom currency:</span>
                <input
                  type="text"
                  maxLength={6}
                  value={form.currency || '$'}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  className="w-24 px-2.5 py-1 text-xs font-bold font-mono rounded-lg border border-slate-300 bg-white focus:border-[#FF6900] focus:outline-hidden"
                  placeholder="$"
                />
              </div>
            </div>

            {/* Fulfilment Toggles */}
            <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-bold text-slate-900">Enable Doorstep Delivery</span>
                <input
                  type="checkbox"
                  checked={form.deliveryEnabled}
                  onChange={(e) => setForm({ ...form, deliveryEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-orange-600 accent-orange-600 cursor-pointer"
                />
              </label>
              <p className="text-[11px] text-slate-500">Allow customers to choose home or office delivery.</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-bold text-slate-900">Enable Counter Pickup</span>
                <input
                  type="checkbox"
                  checked={form.pickupEnabled}
                  onChange={(e) => setForm({ ...form, pickupEnabled: e.target.checked })}
                  className="w-4 h-4 rounded text-orange-600 accent-orange-600 cursor-pointer"
                />
              </label>
              <p className="text-[11px] text-slate-500">Allow customers to pick up directly at your kitchen.</p>
            </div>

            {/* Free Delivery vs Custom Delivery Fee */}
            <div className="sm:col-span-2 p-4 rounded-xl border border-slate-200 bg-orange-50/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-slate-900">Delivery Pricing Mode</h4>
                  <p className="text-[11px] text-slate-500">
                    Set a custom delivery fee or offer 100% free delivery to attract more customers.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, freeDelivery: false })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      !form.freeDelivery
                        ? 'bg-[#111827] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    Custom Delivery Fee
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, freeDelivery: true, deliveryFee: 0 })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      form.freeDelivery
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600'
                    }`}
                  >
                    🎉 Free Delivery
                  </button>
                </div>
              </div>

              {!form.freeDelivery ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Flat Delivery Fee ({form.currency || '$'})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.deliveryFee}
                      onChange={(e) => setForm({ ...form, deliveryFee: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:border-[#FF6900] focus:outline-hidden font-bold"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">Applied automatically at checkout</p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Free Delivery on Orders Above ({form.currency || '$'})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.freeDeliveryThreshold || 0}
                      onChange={(e) => setForm({ ...form, freeDeliveryThreshold: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:border-[#FF6900] focus:outline-hidden"
                      placeholder="0 for none"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">e.g. 30 (Free delivery over 30, otherwise fee applies)</p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Free Delivery is active for all doorstep orders! Customers will see "FREE Delivery" on the checkout page.</span>
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Minimum Order Amount ({form.currency || '$'})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.minimumOrder}
                onChange={(e) => setForm({ ...form, minimumOrder: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Minimum cart subtotal required to place an order</p>
            </div>
          </div>
        </div>

        {/* Website Slug & Subdomain */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              3. Storefront Subdomain & Address
            </h3>
            <button
              type="button"
              onClick={() => openStorefrontInNewTab(form.slug || activeRestaurant.slug)}
              className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Visit Live Store</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="text-xs space-y-2">
            <label className="block font-bold text-slate-700">
              Restaurant URL Slug
            </label>
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:border-orange-500">
              <span className="px-3 text-slate-400 font-mono text-[11px]">
                {isSubdomainModeEnabled()
                  ? 'https://'
                  : `${typeof window !== 'undefined' ? window.location.origin : 'https://dinecraft-six.vercel.app'}/`}
              </span>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="flex-1 py-2.5 px-2 bg-transparent font-bold text-slate-900 font-mono text-xs focus:outline-hidden"
              />
              {isSubdomainModeEnabled() && (
                <span className="px-3 text-slate-500 font-mono text-[11px] bg-slate-100/70 border-l border-slate-200">
                  .{getRootDomain()}
                </span>
              )}
            </div>

            {/* Subdomain real-time feedback */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-0.5">
              {subdomainStatus === 'checking' && (
                <span className="text-slate-500 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin inline-block" />
                  Checking slug availability...
                </span>
              )}
              {subdomainStatus === 'available' && (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {subdomainMessage}
                </span>
              )}
              {(subdomainStatus === 'taken' || subdomainStatus === 'invalid') && (
                <span className="text-rose-600 font-semibold">
                  {subdomainMessage}
                </span>
              )}
              {suggestedSlug && (
                <button
                  type="button"
                  onClick={() => handleSlugChange(suggestedSlug)}
                  className="text-[11px] font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Suggested alternative:</span>
                  <span className="font-mono font-bold">{suggestedSlug}</span>
                </button>
              )}
            </div>

            {slugWarning && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-2 mt-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Warning: Changing your subdomain will change your public website URL. Make sure to update your printed menus, QR codes, and social media bios.
                </p>
              </div>
            )}
          </div>

          {/* Custom Domain Settings (Future-Ready UI from Section 20 of PRD) */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">Custom Domain (e.g. www.myrestaurant.com)</h4>
                <p className="text-[11px] text-slate-500">Connect your own custom .com or .net domain name.</p>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase">
                Coming Soon
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="www.yourrestaurant.com"
                value={customDomainInput}
                onChange={(e) => setCustomDomainInput(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setDomainModalOpen(true)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Connect Domain
              </button>
            </div>
          </div>
        </div>

        {/* Basic SEO fields (Section 20 of PRD) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            4. Search Engine Optimization (SEO)
          </h3>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Storefront Meta Title
            </label>
            <input
              type="text"
              value={form.seoTitle}
              onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Storefront Meta Description
            </label>
            <textarea
              rows={2}
              value={form.seoDescription}
              onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden resize-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>

      {/* Domain Coming Soon Modal */}
      {domainModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
              <LinkIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Custom Domain Provisioning</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Automated DNS record verification and Let's Encrypt SSL certificates are scheduled for the Phase 2 backend release.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1">
              <p className="font-semibold text-slate-800">Future DNS Setup:</p>
              <p className="text-[11px] text-slate-500">Type: CNAME</p>
              <p className="text-[11px] text-slate-500">Host: @ or www</p>
              <p className="text-[11px] text-slate-500 font-mono">Value: ingress.dinecraft.app</p>
            </div>
            <button
              onClick={() => setDomainModalOpen(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
