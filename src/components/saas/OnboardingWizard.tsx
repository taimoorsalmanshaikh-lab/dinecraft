import React, { useState, useEffect } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';
import { RestaurantCategory } from '../../types';
import {
  UtensilsCrossed,
  ArrowRight,
  Check,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Globe,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  isValidSubdomain,
  buildStorefrontUrl,
  getRootDomain,
  generateSlug,
  isSubdomainModeEnabled,
  openStorefrontInNewTab,
} from '../../lib/subdomain';
import { checkSlugAvailable } from '../../services/restaurantService';

const CATEGORIES: RestaurantCategory[] = [
  'Fast Food',
  'Pizza & Italian',
  'Desi & Biryani',
  'Burgers & Grills',
  'Bakery & Desserts',
  'Beverages & Shakes',
  'Asian & Noodles',
  'Healthy & Salads',
  'Café & Coffee',
  'Steakhouse',
];

export const OnboardingWizard: React.FC = () => {
  const { navigate } = useRouter();
  const { createRestaurant } = useDineCraft();

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Restaurant details
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [isSubdomainCustomized, setIsSubdomainCustomized] = useState(false);
  const [subdomainStatus, setSubdomainStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle');
  const [subdomainMessage, setSubdomainMessage] = useState('');
  const [suggestedSlug, setSuggestedSlug] = useState<string | null>(null);
  const [category, setCategory] = useState<RestaurantCategory>('Fast Food');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [openingHours, setOpeningHours] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [publishedSlug, setPublishedSlug] = useState('');

  // Live slug availability check
  useEffect(() => {
    const clean = subdomain.trim().toLowerCase();
    if (!clean) {
      setSubdomainStatus('idle');
      setSubdomainMessage('');
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
        const res = await checkSlugAvailable(clean);
        if (res.available) {
          setSubdomainStatus('available');
          setSubdomainMessage('Available! Your storefront will be accessible at this address.');
          setSuggestedSlug(null);
        } else {
          setSubdomainStatus('taken');
          setSubdomainMessage(res.error || 'This slug is already in use.');
          setSuggestedSlug(res.suggestedSlug || null);
        }
      } catch {
        setSubdomainStatus('invalid');
        setSubdomainMessage('Could not verify slug availability due to a network error.');
        setSuggestedSlug(null);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [subdomain]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSubdomainCustomized) {
      const autoSub = generateSlug(val);
      setSubdomain(autoSub);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Restaurant name is required';

    const cleanSub = subdomain.trim().toLowerCase();
    const subCheck = isValidSubdomain(cleanSub);
    if (!subCheck.valid) {
      errs.subdomain = subCheck.error || 'Valid slug is required';
    } else if (subdomainStatus === 'taken') {
      errs.subdomain = 'This slug is already taken. Please choose another.';
    }

    if (!phone.trim()) errs.phone = 'Phone number is required';
    if (!address.trim()) errs.address = 'Street address is required';
    if (!city.trim()) errs.city = 'City is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePublish = async () => {
    if (!validate()) return;

    const cleanSub =
      subdomain
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') ||
      generateSlug(name) ||
      'store';

    setIsSubmitting(true);
    try {
      const createdResto = await createRestaurant({
        name: name.trim(),
        slug: cleanSub,
        subdomain: cleanSub,
        description: description.trim() || `Welcome to ${name.trim()}! Order online for fast delivery and pickup.`,
        category,
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        openingHours: openingHours.trim() || 'Mon - Sun: 11:00 AM – 10:00 PM',
        deliveryEnabled: true,
        pickupEnabled: true,
        deliveryFee: 0,
        minimumOrder: 0,
        websiteStatus: 'published',
        status: 'published',
        seoTitle: `${name.trim()} — Online Ordering`,
        seoDescription: `Order fresh food online directly from ${name.trim()}.`,
        heroHeading: `Welcome to ${name.trim()}`,
        heroTagline: 'Order online for fresh delivery and pickup.',
        aboutText: `Welcome to ${name.trim()} located in ${city.trim()}. We are dedicated to serving you delicious dishes with quality and care.`,
        showDealsPage: false,
        showFeaturedSection: false,
        whatsappSupportNumber: phone.replace(/[^0-9]/g, '') || undefined,
      });

      setPublishedSlug(createdResto.slug);
      setCurrentStep(2);

      // Launch celebration confetti
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }
    } catch (err: any) {
      console.error('Publish error:', err);
      setErrors({ form: err.message || 'Failed to create restaurant. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F2] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <span className="text-xl font-black text-slate-900">DineCraft</span>
          </button>

          <span className="text-xs font-semibold text-slate-500">
            {currentStep === 1 ? 'Store Setup' : 'Store Live'}
          </span>
        </div>

        {/* Step Container Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-orange-100/80 shadow-md">
          {currentStep === 1 ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Restaurant Information</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your restaurant details and choose your unique storefront web address.
                </p>
              </div>

              {errors.form && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errors.form}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Restaurant Name */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Restaurant Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Bulgar Burgers, Mario's Kitchen"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                  />
                  {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
                </div>

                {/* Subdomain / Slug Input */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">
                      Store URL Slug <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Your store's web link
                    </span>
                  </div>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 focus-within:border-orange-500 overflow-hidden">
                    <span className="px-3 text-slate-400 font-mono text-xs select-none">
                      {isSubdomainModeEnabled()
                        ? 'https://'
                        : `${typeof window !== 'undefined' ? window.location.origin : 'https://dinecraft-six.vercel.app'}/`}
                    </span>
                    <input
                      type="text"
                      value={subdomain}
                      onChange={(e) => {
                        setIsSubdomainCustomized(true);
                        setSubdomain(generateSlug(e.target.value));
                      }}
                      placeholder="e.g. bulgar"
                      className="flex-1 py-2.5 px-1 bg-transparent font-bold text-slate-900 font-mono text-xs focus:outline-hidden"
                    />
                    {isSubdomainModeEnabled() && (
                      <span className="px-3 text-slate-500 font-mono text-xs bg-slate-100/70 border-l border-slate-200">
                        .{getRootDomain()}
                      </span>
                    )}
                  </div>

                  {/* Real-time Subdomain Feedback */}
                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
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
                    {subdomainStatus === 'taken' && (
                      <div className="flex flex-col gap-1 text-rose-600 font-semibold">
                        <span>{subdomainMessage}</span>
                        {suggestedSlug && (
                          <button
                            type="button"
                            onClick={() => {
                              setSubdomain(suggestedSlug);
                              setIsSubdomainCustomized(true);
                            }}
                            className="text-left text-orange-600 underline hover:text-orange-700 font-normal cursor-pointer"
                          >
                            Use suggested slug: <span className="font-mono font-bold">{suggestedSlug}</span>
                          </button>
                        )}
                      </div>
                    )}
                    {subdomainStatus === 'invalid' && (
                      <span className="text-rose-600 font-semibold">{subdomainMessage}</span>
                    )}
                  </div>
                  {errors.subdomain && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.subdomain}</p>
                  )}
                </div>

                {/* Cuisine Category */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cuisine Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as RestaurantCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 012-3456"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                  />
                  {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
                </div>

                {/* Street Address */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Street Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 123 Main Street"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                  />
                  {errors.address && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.address}</p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. New York, Karachi, London"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                  />
                  {errors.city && <p className="text-[11px] text-rose-600 mt-1">{errors.city}</p>}
                </div>

                {/* Opening Hours */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Opening Hours</label>
                  <input
                    type="text"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    placeholder="e.g. Mon - Sun: 11:00 AM – 10:00 PM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Short Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief intro for your storefront (e.g. Fresh gourmet burgers and hot crispy sides made to order)."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden resize-none"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={isSubmitting || subdomainStatus === 'checking' || subdomainStatus === 'taken'}
                  className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Creating Restaurant...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Create Restaurant & Launch Storefront</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: Restaurant Created & Published */
            <div className="py-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Storefront is Live
                </span>
                <h3 className="text-3xl font-black text-slate-900 mt-1">
                  {name} is Published!
                </h3>
                <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
                  Your restaurant storefront is now active and ready to receive customer orders.
                </p>
              </div>

              {/* Storefront URL address box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto text-center space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Your Storefront Address</p>
                <a
                  href={buildStorefrontUrl(publishedSlug)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-black text-orange-600 hover:text-orange-700 font-mono inline-flex items-center gap-1.5 break-all justify-center"
                >
                  <span>{buildStorefrontUrl(publishedSlug)}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => openStorefrontInNewTab(publishedSlug)}
                  className="w-full sm:w-auto px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Globe className="w-4 h-4" />
                  <span>View My Store</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Go to Owner Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
