import React, { useState } from 'react';
import { useDineCraft } from '../../context/DineCraftContext';
import { CreditCard, CheckCircle2, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

export const SubscriptionView: React.FC = () => {
  const { addToast } = useDineCraft();
  const [currentPlan, setCurrentPlan] = useState<'Starter' | 'Pro' | 'Growth'>('Starter');

  const handleSimulatedUpgrade = (plan: 'Starter' | 'Pro' | 'Growth') => {
    setCurrentPlan(plan);
    addToast({
      type: 'success',
      title: 'Plan Updated (Simulated)',
      message: `Your demo subscription has been switched to ${plan}. No payment charged.`,
    });
  };

  const plans = [
    {
      id: 'Starter',
      name: 'Starter Plan',
      price: '$19',
      period: '/month',
      desc: 'Single location restaurant or cloud kitchen.',
      features: [
        'Single restaurant storefront',
        'Unlimited food menu items',
        'Free .dinecraft.app subdomain',
        'Direct Cash on Delivery checkout',
        'Live order queue management',
      ],
    },
    {
      id: 'Pro',
      name: 'Pro Kitchen Plan',
      price: '$49',
      period: '/month',
      desc: 'High-volume dining and delivery operations.',
      features: [
        'Everything in Starter',
        'Custom domain support (.com/.net)',
        'WhatsApp direct customer support button',
        'Featured dishes on homepage',
        'Zero commission on orders',
        'Priority kitchen alerts',
      ],
    },
    {
      id: 'Growth',
      name: 'Franchise Growth',
      price: '$89',
      period: '/month',
      desc: 'Multi-branch operations and expanding brands.',
      features: [
        'Everything in Pro',
        'Multiple location synchronizer',
        'Exportable customer CRM list',
        'Custom SMS order notifications',
        'Dedicated account manager',
      ],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Subscription & Plan</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Simulated SaaS billing overview and tier comparison for future platform monetization.
        </p>
      </div>

      {/* Current Active Plan Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Current Active Tier
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Active Demo
            </span>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{currentPlan} Tier</h3>
          <p className="text-xs text-slate-500">
            Next simulated renewal on <span className="font-semibold text-slate-700">November 16, 2026</span>
          </p>
        </div>

        <div className="p-3 bg-orange-50 border border-orange-200/80 rounded-xl max-w-xs text-xs text-orange-950 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
          <span>This is a simulated demo environment. No real credit card is billed.</span>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((p) => {
          const isCurrent = currentPlan === p.id;
          return (
            <div
              key={p.id}
              className={`flex flex-col justify-between p-6 rounded-2xl border transition-all ${
                isCurrent
                  ? 'border-2 border-orange-600 bg-white shadow-md relative'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  Current Plan
                </span>
              )}

              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="text-base font-bold text-slate-900">{p.name}</h4>
                  <p className="text-slate-500 text-[11px] mt-1">{p.desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 tabular-nums">
                    {p.price}
                  </span>
                  <span className="text-slate-400">{p.period}</span>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2 text-slate-700">
                  {p.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-4">
                <button
                  onClick={() => handleSimulatedUpgrade(p.id as any)}
                  disabled={isCurrent}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : 'bg-slate-900 hover:bg-orange-600 text-white shadow-2xs'
                  }`}
                >
                  {isCurrent ? 'Active Plan' : `Switch to ${p.id}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
