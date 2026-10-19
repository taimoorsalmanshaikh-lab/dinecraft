import React, { useState } from 'react';
import { useRouter } from '../../router/RouterContext';
import { useDineCraft } from '../../context/DineCraftContext';
import { Navbar } from '../common/Navbar';
import {
  UtensilsCrossed,
  ArrowRight,
  CheckCircle2,
  Smartphone,
  Sparkles,
  ShoppingBag,
  DollarSign,
  Palette,
  Layers,
  ChevronDown,
  ShieldCheck,
  Store,
  ExternalLink,
} from 'lucide-react';
import { BURGER_HERO_IMAGE } from '../../data/mockData';

export const LandingPage: React.FC = () => {
  const { navigate } = useRouter();
  const { activeRestaurant, restaurants } = useDineCraft();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const steps = [
    {
      number: '01',
      title: 'Customize Your Brand',
      desc: 'Pick your theme colors, upload your food images, set your opening hours, and add your menu items with simple forms.',
      icon: Palette,
    },
    {
      number: '02',
      title: 'Publish in One Click',
      desc: 'Launch your website instantly on your free DineCraft subdomain (e.g. burgerhouse.dinecraft.app) without any hosting setup.',
      icon: Layers,
    },
    {
      number: '03',
      title: 'Receive Customer Orders',
      desc: 'Customers browse your menu on their phone or computer, place orders via Cash on Delivery, and your kitchen queue updates live.',
      icon: ShoppingBag,
    },
  ];

  const features = [
    {
      title: 'No-Code Menu Management',
      desc: 'Add burgers, pizzas, curries, or drinks in seconds. Update prices, toggle sold-out items, and organize categories without tech skills.',
      icon: UtensilsCrossed,
    },
    {
      title: 'Special Deals & Promo Combos',
      desc: 'Create high-converting family boxes and date-night specials with automatic savings badges and validity dates.',
      icon: Sparkles,
    },
    {
      title: 'Mobile-Optimized Ordering',
      desc: 'Over 80% of food orders happen on mobile. Every DineCraft storefront features full touch support and one-tap bag checkout.',
      icon: Smartphone,
    },
    {
      title: 'Kitchen Order Management Queue',
      desc: 'Track incoming orders across New, Accepted, Preparing, and Ready stages with customer contact numbers and delivery addresses.',
      icon: ShoppingBag,
    },
    {
      title: 'Zero Commission Fees',
      desc: 'Keep 100% of your hard-earned revenue. No 30% delivery app commissions taking away your restaurant profit margins.',
      icon: DollarSign,
    },
    {
      title: 'Cash on Delivery Ready',
      desc: 'Collect cash upon doorstep delivery or counter takeaway. Designed specifically for local neighborhood restaurants.',
      icon: ShieldCheck,
    },
  ];

  const pricingTiers = [
    {
      name: 'Starter',
      price: '$19',
      period: '/month',
      desc: 'For emerging food trucks, cloud kitchens, and takeaway cafes.',
      features: [
        'Single restaurant storefront',
        'Unlimited menu items & deals',
        'Free .dinecraft.app subdomain',
        'Direct Cash on Delivery checkout',
        'Real-time order management queue',
        'Standard customer support',
      ],
      recommended: false,
      cta: 'Start Free Demo',
    },
    {
      name: 'Pro',
      price: '$49',
      period: '/month',
      desc: 'For busy dine-in and high-volume delivery restaurants.',
      features: [
        'Everything in Starter',
        'Custom domain connection (.com/.co)',
        'WhatsApp direct customer support link',
        'Advanced menu categories & tags',
        'Priority kitchen order alert sounds',
        'Dedicated onboarding specialist',
      ],
      recommended: true,
      cta: 'Build Restaurant Website',
    },
    {
      name: 'Growth',
      price: '$89',
      period: '/month',
      desc: 'For expanding multi-location brands and busy franchises.',
      features: [
        'Everything in Pro',
        'Multi-branch menu synchronization',
        'Custom SMS order notifications',
        'Exportable customer CRM list',
        'Custom CSS & branding customization',
        '24/7 VIP restaurant hotline',
      ],
      recommended: false,
      cta: 'Explore Growth Plan',
    },
  ];

  const faqs = [
    {
      q: 'Do I need any coding or web development experience?',
      a: 'None whatsoever! If you can post on social media or fill out a simple form, you can build a complete restaurant website with DineCraft in under 5 minutes.',
    },
    {
      q: 'How do customers order from my website?',
      a: 'Customers simply visit your website on their phone or desktop, pick their favorite items or combo deals, enter their address, and choose Cash on Delivery. The order instantly pops up in your owner dashboard.',
    },
    {
      q: 'Can I connect my own custom domain (e.g. www.myburgerhouse.com)?',
      a: 'Yes! Every restaurant receives an instant free subdomain (e.g. flameandbun.dinecraft.app) immediately, and you can connect your existing custom domain in the settings at any time.',
    },
    {
      q: 'Do you charge a percentage commission on my orders?',
      a: 'No! Unlike delivery aggregator apps that take 25%–35% of every order, DineCraft operates on a flat, predictable subscription with 0% commission on your food sales.',
    },
    {
      q: 'Can I update my menu prices and mark sold-out items during the day?',
      a: 'Absolutely. Open your owner dashboard from your phone or tablet, toggle the item switch to unavailable, and your live storefront updates instantaneously.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-orange-100/60">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
          className="absolute inset-0 w-full h-full object-cover z-0 motion-reduce:hidden"
        >
          <source src="https://res.cloudinary.com/dei9dvrb0/video/upload/v1792211560/bc9dcb937b7fb5533fdf2dcec5457107_720w_yrigsn.mp4" type="video/mp4" />
        </video>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#0f172a]/90 via-[#0f172a]/70 to-[#0f172a]/40" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold border border-white/20">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>The No-Code Restaurant Builder Inspired by Shopify</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                Your Restaurant Website.{' '}
                <span className="text-[#FF4D00]">Ready in Minutes.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-200 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Empower your restaurant with a professional, mobile-friendly online ordering website. Manage your menu, launch combo deals, and receive direct customer orders without hiring expensive developers.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => navigate('/onboarding')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-98"
                >
                  <span>Build Your Restaurant Website</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate(`/${activeRestaurant.slug}`)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/30 backdrop-blur-sm transition-all"
                >
                  <Store className="w-4 h-4 text-orange-400" />
                  <span>Explore Demo Store</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>

              {/* Trust markers */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-200 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Instant setup wizard</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>0% order commission</span>
                </div>
              </div>
            </div>

            {/* Right Storefront Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Browser window chrome with glass effect */}
                <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                  <div className="bg-slate-800/80 px-4 py-3 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <div className="text-[11px] font-mono text-slate-300 bg-slate-950/60 px-3 py-1 rounded-md flex items-center gap-1.5">
                      <span className="text-emerald-400">https://</span>
                      <span>flameandbun.dinecraft.app</span>
                    </div>
                    <div className="w-6" />
                  </div>

                  {/* Window Content */}
                  <div className="bg-white p-4 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🍔</span>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Flame & Bun Burgers</p>
                          <p className="text-[10px] text-slate-400">Open until 11:00 PM</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-white bg-orange-600 px-2 py-1 rounded-md">
                        Order Online
                      </span>
                    </div>

                    <div className="relative aspect-16/9 rounded-xl overflow-hidden">
                      <img
                        src={BURGER_HERO_IMAGE}
                        alt="Hero Burger"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                        <p className="text-white text-xs font-bold">
                          The Double Flame Smash · $12.99
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-left">
                      <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-100">
                        <p className="text-[10px] font-bold text-orange-900">Duo Combo Deal</p>
                        <p className="text-xs font-black text-orange-950 mt-0.5">$26.99 (Save $8)</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-900">Doorstep Delivery</p>
                        <p className="text-xs text-slate-500 mt-0.5">25 - 35 mins</p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('/flameandbun')}
                      className="w-full py-2.5 bg-slate-900 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <span>Test Live Storefront</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Simple Steps */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
              Simple 3-Step Setup
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              How DineCraft Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              No technical skills, no hosting fees, and no waiting weeks for developers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="relative p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:border-orange-200 transition-all space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-black text-orange-600/30 font-mono">
                      {step.number}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-orange-600 flex items-center justify-center shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-[#FFF8F2] border-y border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
              Built for Food Businesses
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              Everything Your Restaurant Needs
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Designed specifically for fast food, pizza parlors, cafes, and local restaurants.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 bg-white rounded-2xl border border-orange-100 shadow-2xs space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{feat.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
              Transparent Example Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
              Flat Monthly Plans. Zero Commissions.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Simple plans tailored to single locations and growing multi-branch brands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`flex flex-col justify-between p-8 rounded-3xl border transition-all ${
                  tier.recommended
                    ? 'border-2 border-orange-500 bg-white shadow-xl relative'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                {tier.recommended && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    Most Popular
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{tier.desc}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 tabular-nums">
                      {tier.price}
                    </span>
                    <span className="text-xs text-slate-500">{tier.period}</span>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-700">
                    {tier.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 mt-4">
                  <button
                    onClick={() => navigate('/onboarding')}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all ${
                      tier.recommended
                        ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {tier.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
              Answers & Help
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-orange-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-orange-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 bg-orange-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Take Your Restaurant Online?
          </h2>
          <p className="text-sm sm:text-base text-orange-100 max-w-xl mx-auto leading-relaxed">
            Join hundreds of food operators building their own branded websites and receiving direct customer orders today.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/onboarding')}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-orange-600 hover:bg-orange-50 font-black text-sm rounded-xl shadow-lg transition-all"
            >
              <span>Build Your Restaurant Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* SaaS Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white">DineCraft</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
              <button onClick={() => navigate('/flameandbun')} className="hover:text-white transition-colors">
                Flame & Bun Storefront
              </button>
              <button onClick={() => navigate('/bellanapoli')} className="hover:text-white transition-colors">
                Bella Napoli Storefront
              </button>
              <button onClick={() => navigate('/karachispice')} className="hover:text-white transition-colors">
                Karachi Spice Storefront
              </button>
              <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors">
                Owner Dashboard
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <p>© {new Date().getFullYear()} DineCraft SaaS Inc. Frontend Prototype for Lovable.</p>
            <p>Designed with zero-neon discipline & mobile-first optimization.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
