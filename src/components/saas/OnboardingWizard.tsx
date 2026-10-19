import React, { useState, useEffect } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';
import { RestaurantCategory } from '../../types';
import {
  UtensilsCrossed,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
  Globe,
  Palette,
  Image,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  BURGER_HERO_IMAGE,
  PIZZA_IMAGE,
  BIRYANI_IMAGE,
  RESTAURANT_INTERIOR_IMAGE,
} from '../../data/mockData';
import {
  isValidSubdomain,
  buildStorefrontUrl,
  getRootDomain,
  generateSlug,
  isSubdomainModeEnabled,
  openStorefrontInNewTab,
} from '../../lib/subdomain';
import { checkSlugAvailable } from '../../services/restaurantService';

export const OnboardingWizard: React.FC<OnboardingWizardProps> = () => {
  const { navigate } = useRouter();
  const { createRestaurant, addMenuItem, addDeal } = useDineCraft();

  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Info & Subdomain
  const [name, setName] = useState('Smash Grill & Co.');
  const [subdomain, setSubdomain] = useState('smash-grill');
  const [isSubdomainCustomized, setIsSubdomainCustomized] = useState(false);
  const [subdomainStatus, setSubdomainStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken' | 'invalid'
  >('idle');
  const [subdomainMessage, setSubdomainMessage] = useState('');
  const [suggestedSlug, setSuggestedSlug] = useState<string | null>(null);
  const [category, setCategory] = useState<RestaurantCategory>('Fast Food');
  const [description, setDescription] = useState(
    'Artisan smashed burgers, hand-spun milkshakes, and crispy seasoned fries.'
  );
  const [phone, setPhone] = useState('+1 (555) 789-0123');
  const [address, setAddress] = useState('210 Market Street');
  const [city, setCity] = useState('Seattle');
  const [openingHours, setOpeningHours] = useState('Mon - Sun: 11:30 AM – 10:30 PM');

  // Step 2: Branding
  const [logo, setLogo] = useState('🍔');
  const [themeColor, setThemeColor] = useState('#F97316');
  const [banner, setBanner] = useState(BURGER_HERO_IMAGE);
  const [heroHeading, setHeroHeading] = useState('Crispy, Juicy & Fresh to Order');
  const [heroTagline, setHeroTagline] = useState(
    'Handcrafted burgers made with 100% prime beef on freshly toasted brioche buns.'
  );

  // Step 3: Menu Items
  const [menuItemsList, setMenuItemsList] = useState<
    Array<{
      name: string;
      price: number;
      category: string;
      description: string;
      image: string;
      available: boolean;
    }>
  >([
    {
      name: 'Classic Cheese Smash',
      price: 11.5,
      category: 'Burgers',
      description: 'Double beef patties, American cheese, diced onions, and house burger sauce.',
      image: BURGER_HERO_IMAGE,
      available: true,
    },
    {
      name: 'Cajun Seasoned Fries',
      price: 5.5,
      category: 'Sides',
      description: 'Golden fries dusted in zesty Cajun spice blend with garlic dip.',
      image: BURGER_HERO_IMAGE,
      available: true,
    },
    {
      name: 'Strawberry Malt Shake',
      price: 6.0,
      category: 'Drinks',
      description: 'Blended whole milk strawberry ice cream topped with malt crumbles.',
      image: BURGER_HERO_IMAGE,
      available: true,
    },
  ]);

  // Temporary new item fields
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Burgers');
  const [newItemDesc, setNewItemDesc] = useState('');

  // Step 4: Deal (Optional)
  const [dealTitle, setDealTitle] = useState('Lunchtime Smash & Shake Box');
  const [dealDescription, setDealDescription] = useState(
    'Includes 1 Classic Cheese Smash, 1 Cajun Seasoned Fries, and 1 Shake.'
  );
  const [dealOriginalPrice, setDealOriginalPrice] = useState('23.00');
  const [dealDiscountedPrice, setDealDiscountedPrice] = useState('17.99');
  const [includeDeal, setIncludeDeal] = useState(true);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [publishedSlug, setPublishedSlug] = useState('');

  const logoOptions = ['🍔', '🍕', '🌮', '🍗', '🍲', '☕', '🥐', '🥩', '🥗', '🍩'];
  const colorOptions = [
    { label: 'Sunset Orange', hex: '#F97316' },
    { label: 'Crimson Red', hex: '#DC2626' },
    { label: 'Forest Emerald', hex: '#15803D' },
    { label: 'Warm Amber', hex: '#D97706' },
    { label: 'Royal Charcoal', hex: '#1E293B' },
  ];
  const bannerOptions = [
    { label: 'Gourmet Burger', url: BURGER_HERO_IMAGE },
    { label: 'Wood-Fired Pizza', url: PIZZA_IMAGE },
    { label: 'Aromatic Desi / Curry', url: BIRYANI_IMAGE },
    { label: 'Warm Bistro Dining', url: RESTAURANT_INTERIOR_IMAGE },
  ];

  const handleAddItem = () => {
    if (!newItemName.trim() || !newItemPrice) return;
    setMenuItemsList((prev) => [
      ...prev,
      {
        name: newItemName.trim(),
        price: parseFloat(newItemPrice) || 9.99,
        category: newItemCategory,
        description: newItemDesc.trim() || 'Prepared fresh to order.',
        image: banner,
        available: true,
      },
    ]);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemDesc('');
  };

  const handleRemoveItem = (index: number) => {
    setMenuItemsList((prev) => prev.filter((_, i) => i !== index));
  };

  // Live slug availability check
  useEffect(() => {
    const clean = subdomain.trim().toLowerCase();
    if (!clean) {
      setSubdomainStatus('invalid');
      setSubdomainMessage('Slug is required.');
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
      const autoSub = generateSlug(val) || 'my-restaurant';
      setSubdomain(autoSub);
    }
  };

  const validateStep = (step: number) => {
    const errs: Record<string, string> = {};
    if (step === 1) {
      if (!name.trim()) errs.name = 'Restaurant name is required';
      const cleanSub = subdomain.trim().toLowerCase();
      const subCheck = isValidSubdomain(cleanSub);
      if (!subCheck.valid) {
        errs.subdomain = subCheck.error || 'Valid subdomain is required';
      } else if (subdomainStatus === 'taken') {
        errs.subdomain = 'This subdomain is already taken. Please choose another.';
      }
      if (!phone.trim()) errs.phone = 'Phone number is required';
      if (!address.trim()) errs.address = 'Street address is required';
      if (!city.trim()) errs.city = 'City is required';
    } else if (step === 2) {
      if (!heroHeading.trim()) errs.heroHeading = 'Hero heading is required';
    } else if (step === 3) {
      if (menuItemsList.length < 3) {
        errs.menu = 'Please have at least 3 menu items before continuing.';
      }
    } else if (step === 4 && includeDeal) {
      const orig = parseFloat(dealOriginalPrice) || 0;
      const disc = parseFloat(dealDiscountedPrice) || 0;
      if (!dealTitle.trim()) errs.dealTitle = 'Deal title is required';
      if (disc <= 0 || orig <= 0) {
        errs.dealPrice = 'Please enter valid deal prices';
      } else if (disc >= orig) {
        errs.dealPrice = 'Discounted price must be lower than original price';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePublish = async () => {
    const cleanSub =
      subdomain
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') ||
      name.toLowerCase().replace(/[^a-z0-9]/g, '') ||
      'myresto';

    try {
      // 1. Create Restaurant in Context
      const createdResto = await createRestaurant({
        name,
        slug: cleanSub,
        subdomain: cleanSub,
        description,
        category,
        logo,
        banner,
        themeColor,
        theme: { primary: themeColor },
        phone,
        address,
        city,
        openingHours,
        deliveryEnabled: true,
        pickupEnabled: true,
        deliveryFee: 3.99,
        minimumOrder: 15.0,
        websiteStatus: 'published',
        seoTitle: `${name} — Online Ordering`,
        seoDescription: `${description} Order fresh food online directly.`,
        heroHeading,
        heroTagline,
        aboutText: `Welcome to ${name}! Located in ${city}, we pride ourselves on exceptional flavor and warm service.`,
        showDealsPage: includeDeal,
        showFeaturedSection: true,
        whatsappSupportNumber: phone.replace(/[^0-9]/g, '') || '15551234567',
      });

      // 2. Add menu items
      for (const [idx, item] of menuItemsList.entries()) {
        await addMenuItem({
          restaurantId: createdResto.id,
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          image: item.image,
          available: item.available,
          featured: idx < 3,
        });
      }

      // 3. Add deal if enabled
      if (includeDeal && dealTitle) {
        await addDeal({
          restaurantId: createdResto.id,
          title: dealTitle,
          description: dealDescription,
          image: banner,
          originalPrice: parseFloat(dealOriginalPrice) || 20,
          discountedPrice: parseFloat(dealDiscountedPrice) || 15,
          active: true,
        });
      }

      setPublishedSlug(createdResto.slug);
    } catch (e) {
      console.error('Publish error:', e);
    }

    // Launch confetti celebration!
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {
      // Safe fallback
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F2] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <span className="text-xl font-black text-slate-900">DineCraft</span>
          </button>

          <span className="text-xs font-semibold text-slate-500">
            Setup Wizard · Step {currentStep} of 5
          </span>
        </div>

        {/* Progress Bar Indicator */}
        <div className="bg-white p-3 rounded-2xl border border-orange-100 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-2 mb-2">
            <span className={currentStep >= 1 ? 'text-orange-600' : ''}>1. Info</span>
            <span className={currentStep >= 2 ? 'text-orange-600' : ''}>2. Branding</span>
            <span className={currentStep >= 3 ? 'text-orange-600' : ''}>3. Menu</span>
            <span className={currentStep >= 4 ? 'text-orange-600' : ''}>4. Deal</span>
            <span className={currentStep >= 5 ? 'text-orange-600' : ''}>5. Publish</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-orange-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Container Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-orange-100/80 shadow-md">
          {/* STEP 1: Restaurant Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Restaurant Information</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Tell customers where you are located and when your kitchen is open.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Restaurant Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                  />
                  {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
                </div>

                {/* Subdomain Input */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700">
                      Store URL Address & Slug <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Unique storefront web address
                    </span>
                  </div>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 focus-within:border-orange-500 overflow-hidden">
                    <span className="px-3 text-slate-400 font-mono text-xs">
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
                      placeholder="my-restaurant"
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
                    {(subdomainStatus === 'taken' || subdomainStatus === 'invalid') && (
                      <span className="text-rose-600 font-semibold">
                        {subdomainMessage}
                      </span>
                    )}
                    {suggestedSlug && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsSubdomainCustomized(true);
                          setSubdomain(suggestedSlug);
                        }}
                        className="text-[11px] font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Suggested alternative:</span>
                        <span className="font-mono font-bold">{suggestedSlug}</span>
                      </button>
                    )}
                    {errors.subdomain && (
                      <span className="text-rose-600 font-bold">{errors.subdomain}</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as RestaurantCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden bg-white"
                  >
                    <option value="Fast Food">Fast Food (Burgers, Shakes)</option>
                    <option value="Pizza">Pizza & Italian</option>
                    <option value="Cafe">Cafe & Bakery</option>
                    <option value="Pakistani Restaurant">Pakistani / Desi Cuisine</option>
                    <option value="Fine Dining">Fine Dining</option>
                    <option value="Other">Other Cuisine</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Contact Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                  />
                  {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Short Tagline / Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Street Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Opening Hours
                  </label>
                  <input
                    type="text"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Branding */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Restaurant Branding</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Choose your logo badge, storefront theme accent color, and hero banner.
                </p>
              </div>

              {/* Logo Emoji Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Restaurant Logo Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {logoOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setLogo(emoji)}
                      className={`w-11 h-11 text-xl rounded-xl border flex items-center justify-center transition-all ${
                        logo === emoji
                          ? 'border-orange-600 bg-orange-50 scale-105 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Color */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Theme Accent Color
                </label>
                <div className="flex flex-wrap gap-3">
                  {colorOptions.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setThemeColor(c.hex)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                        themeColor === c.hex
                          ? 'border-slate-900 bg-slate-50 font-bold'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Banner Image Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Hero Banner Photography
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {bannerOptions.map((b) => (
                    <button
                      key={b.label}
                      type="button"
                      onClick={() => setBanner(b.url)}
                      className={`flex flex-col text-left rounded-xl border overflow-hidden transition-all ${
                        banner === b.url
                          ? 'border-2 border-orange-600 ring-2 ring-orange-100 shadow-sm'
                          : 'border-slate-200 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="aspect-16/10 bg-slate-100">
                        <img
                          src={b.url}
                          alt={b.label}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="p-2 text-[11px] font-semibold text-slate-800 truncate">
                        {b.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hero Heading and Tagline */}
              <div className="space-y-4 text-xs pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Storefront Hero Headline
                  </label>
                  <input
                    type="text"
                    value={heroHeading}
                    onChange={(e) => setHeroHeading(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Storefront Hero Tagline
                  </label>
                  <input
                    type="text"
                    value={heroTagline}
                    onChange={(e) => setHeroTagline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Menu Items */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Add Menu Items</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Add at least 3 items for launch. You can edit, add, or delete more later anytime.
                </p>
              </div>

              {/* Current Items List */}
              <div className="space-y-3">
                {menuItemsList.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{item.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {item.category} · ${item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Remove sample item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {errors.menu && (
                <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  {errors.menu}
                </p>
              )}

              {/* Quick Add Form */}
              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-200/70 space-y-3">
                <h3 className="text-xs font-bold text-orange-950 uppercase tracking-wide flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Dish</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <input
                      type="text"
                      placeholder="Item Name (e.g. Garlic Bread)"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price (e.g. 7.99)"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <select
                      value={newItemCategory}
                      onChange={(e) => setNewItemCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 focus:outline-hidden"
                    >
                      <option value="Burgers">Burgers</option>
                      <option value="Pizza">Pizza</option>
                      <option value="Sides">Sides</option>
                      <option value="Drinks">Drinks</option>
                      <option value="Desserts">Desserts</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Short description of ingredients..."
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg shadow-2xs"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Create a Deal */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Launch a Special Deal</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Promotional combos boost average customer order size by 35%.
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={includeDeal}
                    onChange={(e) => setIncludeDeal(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 accent-orange-600"
                  />
                  <span>Include Deal</span>
                </label>
              </div>

              {includeDeal ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Deal Title
                    </label>
                    <input
                      type="text"
                      value={dealTitle}
                      onChange={(e) => setDealTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                    />
                    {errors.dealTitle && (
                      <p className="text-[11px] text-rose-600 mt-1">{errors.dealTitle}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      What is included in this combo?
                    </label>
                    <textarea
                      rows={2}
                      value={dealDescription}
                      onChange={(e) => setDealDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Original Total ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={dealOriginalPrice}
                        onChange={(e) => setDealOriginalPrice(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Discounted Offer Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={dealDiscountedPrice}
                        onChange={(e) => setDealDiscountedPrice(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {errors.dealPrice && (
                    <p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                      {errors.dealPrice}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                  Deals step is skipped. You can always create promotions from your dashboard.
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Review & Publish */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Review & Launch</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Everything looks fantastic! You are ready to publish your website.
                </p>
              </div>

              {publishedSlug ? (
                /* Celebration State after Publishing */
                <div className="py-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Website is Live
                    </span>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">
                      {name} is Published!
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
                      Your restaurant storefront is now active and ready to process simulated customer orders.
                    </p>
                  </div>

                  {/* Subdomain URL box */}
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
                      onClick={() => {
                        openStorefrontInNewTab(publishedSlug);
                      }}
                      className="w-full sm:w-auto px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Open Customer Storefront</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Enter Owner Dashboard
                    </button>
                  </div>
                </div>
              ) : (
                /* Review summary before publishing */
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-500 uppercase text-[10px]">Restaurant</span>
                      <span className="font-bold text-slate-900">{logo} {name}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-500 uppercase text-[10px]">Store Subdomain</span>
                      <span className="font-bold text-orange-600 font-mono text-xs">{subdomain}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-500 uppercase text-[10px]">Cuisine Category</span>
                      <span className="font-medium text-slate-800">{category}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-500 uppercase text-[10px]">Menu Items Ready</span>
                      <span className="font-bold text-slate-900">{menuItemsList.length} items configured</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="font-bold text-slate-500 uppercase text-[10px]">Location</span>
                      <span className="font-medium text-slate-800">{address}, {city}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-500 uppercase text-[10px]">Active Promo Deal</span>
                      <span className="font-medium text-slate-800">
                        {includeDeal ? `${dealTitle} ($${dealDiscountedPrice})` : 'None added'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col gap-3">
                    <button
                      onClick={handlePublish}
                      className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Publish Restaurant Website</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Wizard Navigation Footer */}
          {!publishedSlug && (
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-100">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 5 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all active:scale-98"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface OnboardingWizardProps {}
