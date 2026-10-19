import React, { useState, useEffect } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';
import { DeviceSimulator } from '../common/DeviceSimulator';
import {
  Palette,
  Type,
  Layout,
  Save,
  Globe,
  ExternalLink,
  Sparkles,
  Check,
  Upload,
  Info,
  Tag,
  Phone,
  Clock,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react';
import { AssetPickerModal } from './AssetPickerModal';
import {
  BURGER_HERO_IMAGE,
  PIZZA_IMAGE,
  BIRYANI_IMAGE,
  RESTAURANT_INTERIOR_IMAGE,
} from '../../data/mockData';

export const WebsiteCustomizer: React.FC = () => {
  const { navigate } = useRouter();
  const { activeRestaurant, updateRestaurant, addToast, deals } = useDineCraft();

  const [activeTab, setActiveTab] = useState<'branding' | 'hero' | 'promo' | 'info' | 'sections'>('branding');

  // Working draft state initialized from activeRestaurant
  const [draft, setDraft] = useState({ ...activeRestaurant });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [assetPickerTarget, setAssetPickerTarget] = useState<'logo' | 'banner' | 'plate' | null>(null);

  // Sync draft when activeRestaurant changes and not dirty
  useEffect(() => {
    if (!hasUnsavedChanges) {
      setDraft({ ...activeRestaurant });
    }
  }, [activeRestaurant, hasUnsavedChanges]);

  const logoOptions = ['🍔', '🍕', '🌮', '🍗', '🍲', '☕', '🥐', '🥩', '🥗', '🍩', '🍣', '🍰'];

  const colorOptions = [
    { label: 'Signature Orange', hex: '#FF6900' },
    { label: 'Sunset Tangerine', hex: '#F97316' },
    { label: 'Crimson Red', hex: '#DC2626' },
    { label: 'Forest Emerald', hex: '#16A34A' },
    { label: 'Royal Blue', hex: '#2563EB' },
    { label: 'Imperial Purple', hex: '#9333EA' },
    { label: 'Warm Amber', hex: '#D97706' },
    { label: 'Midnight Navy', hex: '#0F172A' },
  ];

  const bannerPresets = [
    { label: 'Gourmet Burger Kitchen', url: BURGER_HERO_IMAGE },
    { label: 'Artisan Wood-Fired Pizza', url: PIZZA_IMAGE },
    { label: 'Traditional Desi & Biryani', url: BIRYANI_IMAGE },
    { label: 'Dining Bistro Atmosphere', url: RESTAURANT_INTERIOR_IMAGE },
  ];

  const updateDraft = (fields: Partial<typeof draft>) => {
    setDraft((prev) => ({ ...prev, ...fields }));
    setHasUnsavedChanges(true);
  };

  const handleImageFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onImageSelected: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      if (res) onImageSelected(res);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    // Ensure contact fields and root fields remain in perfect sync
    const finalDraft = {
      ...draft,
      logoUrl: draft.logo || draft.logoUrl,
      bannerUrl: draft.banner || draft.bannerUrl,
      contact: {
        ...(draft.contact || {}),
        phone: draft.phone || draft.contact?.phone || '',
        whatsapp: draft.whatsappSupportNumber || draft.contact?.whatsapp || '',
        email: draft.contact?.email || '',
        address: draft.address || draft.contact?.address || '',
        city: draft.city || draft.contact?.city || '',
        openingHours: draft.openingHours || draft.contact?.openingHours || '',
      },
    };

    updateRestaurant(finalDraft);
    setDraft(finalDraft);
    setHasUnsavedChanges(false);
    addToast({
      type: 'success',
      title: 'Store Changes Saved',
      message: 'Your storefront customization has been saved and updated.',
    });
  };

  const handlePublish = () => {
    const finalDraft = {
      ...draft,
      websiteStatus: 'published' as const,
      status: 'published' as const,
      logoUrl: draft.logo || draft.logoUrl,
      bannerUrl: draft.banner || draft.bannerUrl,
      contact: {
        ...(draft.contact || {}),
        phone: draft.phone || draft.contact?.phone || '',
        whatsapp: draft.whatsappSupportNumber || draft.contact?.whatsapp || '',
        email: draft.contact?.email || '',
        address: draft.address || draft.contact?.address || '',
        city: draft.city || draft.contact?.city || '',
        openingHours: draft.openingHours || draft.contact?.openingHours || '',
      },
    };

    updateRestaurant(finalDraft);
    setDraft(finalDraft);
    setHasUnsavedChanges(false);
    addToast({
      type: 'success',
      title: 'Storefront Published Live!',
      message: `Your changes are immediately live on /${finalDraft.slug}`,
    });
  };

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col bg-slate-100 overflow-hidden font-sans">
      {/* Top Customizer Actions Bar */}
      <div className="px-4 sm:px-6 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('branding')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'branding'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Branding</span>
            </button>

            <button
              onClick={() => setActiveTab('hero')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'hero'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Hero Banner</span>
            </button>

            <button
              onClick={() => setActiveTab('promo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'promo'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Offer Banner</span>
            </button>

            <button
              onClick={() => setActiveTab('info')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'info'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Contact & Hours</span>
            </button>

            <button
              onClick={() => setActiveTab('sections')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'sections'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Sections</span>
            </button>
          </div>

          {hasUnsavedChanges && (
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md hidden sm:inline whitespace-nowrap">
              Unsaved changes
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={handlePublish}
            className="px-4 py-2 bg-[#FF6900] hover:bg-[#e05d00] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Publish Changes</span>
          </button>

          <button
            onClick={() => navigate(`/${activeRestaurant.slug}`)}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Open storefront in full page"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Split Workstation: Left Settings + Right Live Device Simulator */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Settings Panel */}
        <div className="w-full lg:w-96 bg-white border-r border-slate-200 overflow-y-auto p-5 space-y-6 shrink-0">
          {/* TAB 1: Branding & Identity */}
          {activeTab === 'branding' && (
            <div className="space-y-6 text-xs">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Brand Identity</h3>
                <p className="text-slate-500 text-[11px]">
                  Customize your restaurant name, visual logo mark, and theme color.
                </p>
              </div>

              {/* Restaurant Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Restaurant Brand Name
                </label>
                <input
                  type="text"
                  required
                  value={draft.name}
                  onChange={(e) => updateDraft({ name: e.target.value })}
                  placeholder="e.g. Saffron Grill & Cafe"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden font-semibold text-slate-900"
                />
              </div>

              {/* Logo / Brand Image Upload */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">Brand Logo / Icon</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {draft.logo && (draft.logo.startsWith('data:') || draft.logo.startsWith('http') || draft.logo.startsWith('/')) ? (
                      <img src={draft.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">{draft.logo || '🍽️'}</span>
                    )}
                  </div>

                  <div className="flex-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAssetPickerTarget('logo')}
                      className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-[11px] transition-colors shadow-2xs cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-orange-600" />
                      <span>Select from Assets</span>
                    </button>

                    <label className="flex-1 flex items-center justify-center gap-1.5 p-2 border-2 border-dashed border-orange-300 rounded-xl bg-orange-50/50 hover:bg-orange-50 cursor-pointer text-orange-700 font-bold text-[11px] transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileChange(e, (url) => updateDraft({ logo: url, logoUrl: url }))}
                      />
                    </label>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {logoOptions.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => updateDraft({ logo: em, logoUrl: '' })}
                      className={`w-8 h-8 text-base rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                        draft.logo === em
                          ? 'border-orange-600 bg-orange-50 font-bold scale-105'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Colors */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-bold text-slate-700">
                    Theme Accent Color
                  </label>
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    {draft.themeColor || '#FF6900'}
                  </span>
                </div>

                {/* Custom Color Input */}
                <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl mb-3">
                  <input
                    type="color"
                    value={draft.themeColor || '#FF6900'}
                    onChange={(e) =>
                      updateDraft({
                        themeColor: e.target.value,
                        theme: {
                          ...(draft.theme || {}),
                          primary: e.target.value,
                        },
                      })
                    }
                    className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white"
                  />
                  <div className="flex-1">
                    <p className="text-[11px] font-bold text-slate-800">Custom Color</p>
                    <p className="text-[10px] text-slate-400">Pick any custom shade on the wheel</p>
                  </div>
                </div>

                {/* Preset Swatches */}
                <div className="space-y-1.5">
                  {colorOptions.map((c) => {
                    const isSelected =
                      (draft.themeColor || '#FF6900').toLowerCase() === c.hex.toLowerCase();
                    return (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() =>
                          updateDraft({
                            themeColor: c.hex,
                            theme: {
                              ...(draft.theme || {}),
                              primary: c.hex,
                            },
                          })
                        }
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-slate-900 bg-slate-100/80 font-bold shadow-2xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.label}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">{c.hex}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Hero Section */}
          {activeTab === 'hero' && (
            <div className="space-y-5 text-xs">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Hero Section</h3>
                <p className="text-slate-500 text-[11px]">
                  Customize your main storefront banner, headline, and supporting tagline.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={draft.heroHeading || ''}
                  onChange={(e) => updateDraft({ heroHeading: e.target.value })}
                  placeholder="Good Food Brings People Together"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Supporting Description / Tagline
                </label>
                <textarea
                  rows={3}
                  value={draft.heroTagline || ''}
                  onChange={(e) => updateDraft({ heroTagline: e.target.value })}
                  placeholder="Experience delicious food crafted with passion and the freshest ingredients."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden resize-none"
                />
              </div>

              {/* Banner Upload */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  Hero Banner Photo
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setAssetPickerTarget('banner')}
                    className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-orange-600" />
                    <span>Select from Assets</span>
                  </button>

                  <label className="flex-1 flex items-center justify-center gap-2 p-2.5 border-2 border-dashed border-orange-300 rounded-xl bg-orange-50/50 hover:bg-orange-50 cursor-pointer text-orange-700 font-bold text-xs transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileChange(e, (url) => updateDraft({ banner: url, bannerUrl: url }))}
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {bannerPresets.map((b) => (
                    <button
                      key={b.label}
                      type="button"
                      onClick={() => updateDraft({ banner: b.url, bannerUrl: b.url })}
                      className={`rounded-xl border overflow-hidden text-left transition-all cursor-pointer ${
                        draft.banner === b.url || draft.bannerUrl === b.url
                          ? 'border-2 border-orange-600 ring-2 ring-orange-100 shadow-2xs'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
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
                      <p className="p-1.5 text-[10px] font-semibold text-slate-800 truncate">
                        {b.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Special Limited Offer Banner (Single Active Offer) */}
          {activeTab === 'promo' && (
            <div className="space-y-5 text-xs">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Tag className="w-3 h-3" />
                  <span>Single Special Offer</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Special Limited Offer</h3>
                <p className="text-slate-500 text-[11px]">
                  Configure your restaurant's single, high-impact orange special offer banner.
                </p>
              </div>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <div>
                  <p className="font-bold text-slate-900">Show Special Offer Banner</p>
                  <p className="text-[11px] text-slate-500">Display this single promotional offer on homepage</p>
                </div>
                <input
                  type="checkbox"
                  checked={draft.content?.reservationBanner?.enabled !== false && draft.showDealsPage !== false}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    updateDraft({
                      showDealsPage: enabled,
                      content: {
                        ...(draft.content || {} as any),
                        reservationBanner: {
                          ...(draft.content?.reservationBanner || {
                            eyebrow: 'Special Limited Offer',
                            title: 'Get 20% Off Your First Online Order',
                            text: 'Order directly from our kitchen today.',
                            buttonLabel: 'Claim Offer & Order Now',
                            badges: ['Instant Confirmation', 'Freshly Prepared'],
                          }),
                          enabled,
                        },
                      },
                    });
                  }}
                  className="w-4 h-4 rounded text-orange-600 accent-orange-600 cursor-pointer"
                />
              </label>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Offer Label (Eyebrow)
                </label>
                <input
                  type="text"
                  value={draft.content?.reservationBanner?.eyebrow || 'Special Limited Offer'}
                  onChange={(e) => {
                    updateDraft({
                      content: {
                        ...(draft.content || {} as any),
                        reservationBanner: {
                          ...(draft.content?.reservationBanner || {
                            enabled: true,
                            title: 'Get 20% Off Your First Online Order',
                            text: 'Order directly from our kitchen today.',
                            buttonLabel: 'Claim Offer & Order Now',
                            badges: [],
                          }),
                          eyebrow: e.target.value,
                        },
                      },
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Promotional Heading
                </label>
                <input
                  type="text"
                  value={draft.content?.reservationBanner?.title || 'Get 20% Off Your First Online Order'}
                  onChange={(e) => {
                    updateDraft({
                      content: {
                        ...(draft.content || {} as any),
                        reservationBanner: {
                          ...(draft.content?.reservationBanner || {
                            enabled: true,
                            eyebrow: 'Special Limited Offer',
                            text: 'Order directly from our kitchen today.',
                            buttonLabel: 'Claim Offer & Order Now',
                            badges: [],
                          }),
                          title: e.target.value,
                        },
                      },
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Promotional Description
                </label>
                <textarea
                  rows={3}
                  value={draft.content?.reservationBanner?.text || 'Order directly from our kitchen today and enjoy hot, delicious food delivered straight to your door.'}
                  onChange={(e) => {
                    updateDraft({
                      content: {
                        ...(draft.content || {} as any),
                        reservationBanner: {
                          ...(draft.content?.reservationBanner || {
                            enabled: true,
                            eyebrow: 'Special Limited Offer',
                            title: 'Get 20% Off Your First Online Order',
                            buttonLabel: 'Claim Offer & Order Now',
                            badges: [],
                          }),
                          text: e.target.value,
                        },
                      },
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Button Label
                </label>
                <input
                  type="text"
                  value={draft.content?.reservationBanner?.buttonLabel || 'Claim Offer & Order Now'}
                  onChange={(e) => {
                    updateDraft({
                      content: {
                        ...(draft.content || {} as any),
                        reservationBanner: {
                          ...(draft.content?.reservationBanner || {
                            enabled: true,
                            eyebrow: 'Special Limited Offer',
                            title: 'Get 20% Off Your First Online Order',
                            text: 'Order directly from our kitchen today.',
                            badges: [],
                          }),
                          buttonLabel: e.target.value,
                        },
                      },
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Promotional Banner Image
                </label>
                <label className="flex items-center justify-center gap-2 p-2.5 border-2 border-dashed border-orange-300 rounded-xl bg-orange-50/50 hover:bg-orange-50 cursor-pointer text-orange-700 font-bold text-xs transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Upload Promo Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFileChange(e, (url) => {
                      updateDraft({
                        content: {
                          ...(draft.content || {} as any),
                          reservationBanner: {
                            ...(draft.content?.reservationBanner || {
                              enabled: true,
                              eyebrow: 'Special Limited Offer',
                              title: 'Get 20% Off Your First Online Order',
                              text: 'Order directly from our kitchen today.',
                              buttonLabel: 'Claim Offer & Order Now',
                              badges: [],
                            }),
                            imageUrl: url,
                          },
                        },
                      });
                    })}
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: Contact, Hours & Footer */}
          {activeTab === 'info' && (
            <div className="space-y-5 text-xs">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Contact, Location & Hours</h3>
                <p className="text-slate-500 text-[11px]">
                  Ensure customers can easily call, visit, and check your schedule.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={draft.phone || draft.contact?.phone || ''}
                  onChange={(e) => updateDraft({ phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={draft.address || draft.contact?.address || ''}
                  onChange={(e) => updateDraft({ address: e.target.value })}
                  placeholder="100 Main Street"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  City & Postal
                </label>
                <input
                  type="text"
                  value={draft.city || draft.contact?.city || ''}
                  onChange={(e) => updateDraft({ city: e.target.value })}
                  placeholder="Downtown, City"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Operating Hours Summary
                </label>
                <input
                  type="text"
                  value={draft.openingHours || draft.contact?.openingHours || ''}
                  onChange={(e) => updateDraft({ openingHours: e.target.value })}
                  placeholder="Mon - Sun: 11:00 AM – 10:00 PM"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  About Story / Footer Description
                </label>
                <textarea
                  rows={3}
                  value={draft.description || draft.aboutText || ''}
                  onChange={(e) => updateDraft({ description: e.target.value, aboutText: e.target.value })}
                  placeholder="Artisanal cuisine crafted with passion and the freshest ingredients."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 5: Sections & Ordering Settings */}
          {activeTab === 'sections' && (
            <div className="space-y-5 text-xs">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Storefront Sections & Fulfillment</h3>
                <p className="text-slate-500 text-[11px]">
                  Configure which fulfillment types and sections to display.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-900">Featured Items Section</p>
                    <p className="text-[11px] text-slate-500">Showcase top-rated customer dishes on home</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.showFeaturedSection !== false}
                    onChange={(e) => updateDraft({ showFeaturedSection: e.target.checked })}
                    className="w-4 h-4 rounded text-orange-600 accent-orange-600 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-900">Doorstep Delivery Fulfillment</p>
                    <p className="text-[11px] text-slate-500">Allow customers to order for home delivery</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.deliveryEnabled !== false}
                    onChange={(e) => updateDraft({ deliveryEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-orange-600 accent-orange-600 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <p className="font-bold text-slate-900">Counter Pickup Fulfillment</p>
                    <p className="text-[11px] text-slate-500">Allow customers to collect food at kitchen</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.pickupEnabled !== false}
                    onChange={(e) => updateDraft({ pickupEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-orange-600 accent-orange-600 cursor-pointer"
                  />
                </label>

                <div className="pt-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Minimum Order Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    value={draft.minimumOrder ?? 15}
                    onChange={(e) => updateDraft({ minimumOrder: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Live Storefront Preview */}
        <div className="flex-1 p-2 sm:p-3 overflow-hidden flex flex-col bg-slate-50">
          <DeviceSimulator
            restaurant={draft}
            onOpenFullscreen={() => navigate(`/${draft.slug}`)}
          />
        </div>
      </div>

      {/* Asset Picker Modal */}
      <AssetPickerModal
        isOpen={assetPickerTarget !== null}
        onClose={() => setAssetPickerTarget(null)}
        onSelect={(url) => {
          if (assetPickerTarget === 'logo') {
            updateDraft({ logo: url, logoUrl: url });
          } else if (assetPickerTarget === 'banner') {
            updateDraft({ banner: url, bannerUrl: url });
          } else if (assetPickerTarget === 'plate') {
            updateDraft({ plateImageUrl: url });
          }
          setAssetPickerTarget(null);
        }}
        restaurantId={activeRestaurant.id}
        title={
          assetPickerTarget === 'logo'
            ? 'Select Brand Logo from Assets'
            : assetPickerTarget === 'plate'
            ? 'Select Featured Dish Plate from Assets'
            : 'Select Hero Banner from Assets'
        }
        currentSelectedUrl={
          assetPickerTarget === 'logo'
            ? draft.logo
            : assetPickerTarget === 'plate'
            ? draft.plateImageUrl
            : draft.banner
        }
      />
    </div>
  );
};
