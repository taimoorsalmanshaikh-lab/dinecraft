import React, { useState } from 'react';
import { useDineCraft } from '../../context/DineCraftContext';
import { Deal } from '../../types';
import { formatCurrency, getCurrencySymbol } from '../../lib/currency';
import { Plus, Edit2, Trash2, Tag, Sparkles, X, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { AssetPickerModal } from './AssetPickerModal';
import {
  BURGER_HERO_IMAGE,
  PIZZA_IMAGE,
  BIRYANI_IMAGE,
  RESTAURANT_INTERIOR_IMAGE,
} from '../../data/mockData';

export const DealsManager: React.FC = () => {
  const { activeRestaurant, updateRestaurant, getDeals, addDeal, updateDeal, deleteDeal } = useDineCraft();
  const deals = getDeals(activeRestaurant.id);
  const currency = activeRestaurant.ordering?.currency || activeRestaurant.currency || '$';

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formOrig, setFormOrig] = useState('');
  const [formDisc, setFormDisc] = useState('');
  const [formImage, setFormImage] = useState(activeRestaurant.banner || BURGER_HERO_IMAGE);
  const [formActive, setFormActive] = useState(true);
  const [formEndDate, setFormEndDate] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [assetPickerOpen, setAssetPickerOpen] = useState(false);

  const openAddModal = () => {
    setEditingDeal(null);
    setFormTitle('');
    setFormDesc('');
    setFormOrig('30.00');
    setFormDisc('22.99');
    setFormImage(activeRestaurant.banner || BURGER_HERO_IMAGE);
    setFormActive(true);
    setFormEndDate('');
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (deal: Deal) => {
    setEditingDeal(deal);
    setFormTitle(deal.title);
    setFormDesc(deal.description);
    setFormOrig(deal.originalPrice.toString());
    setFormDisc(deal.discountedPrice.toString());
    setFormImage(deal.imageUrl || deal.image || '');
    setFormActive(deal.active);
    setFormEndDate(deal.endDate || '');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const orig = parseFloat(formOrig) || 0;
    const disc = parseFloat(formDisc) || 0;

    if (!formTitle.trim()) {
      setErrorMsg('Please enter a title for the deal');
      return;
    }
    if (disc >= orig || disc <= 0 || orig <= 0) {
      setErrorMsg('Discounted price must be strictly lower than the original price.');
      return;
    }

    if (editingDeal) {
      updateDeal({
        ...editingDeal,
        title: formTitle.trim(),
        description: formDesc.trim(),
        originalPrice: orig,
        discountedPrice: disc,
        image: formImage,
        active: formActive,
        endDate: formEndDate || undefined,
      });
    } else {
      addDeal({
        restaurantId: activeRestaurant.id,
        title: formTitle.trim(),
        description: formDesc.trim(),
        originalPrice: orig,
        discountedPrice: disc,
        image: formImage,
        active: formActive,
        endDate: formEndDate || undefined,
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Deals & Special Offers ({deals.length})</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create combo bundles and promotional packages with automatic customer savings calculations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Set Promotional Item</label>
            <select
              value={activeRestaurant.content?.specialOfferDealId || ''}
              onChange={(e) => {
                updateRestaurant({
                  ...activeRestaurant,
                  content: {
                    ...(activeRestaurant.content || {} as any),
                    specialOfferDealId: e.target.value || undefined,
                  }
                });
              }}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
            >
              <option value="">-- None --</option>
              {deals.map(d => (
                <option key={d.id} value={d.id}>{d.title}</option>
              ))}
            </select>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 mt-3.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Deal</span>
          </button>
        </div>
      </div>

      {deals.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <Tag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No active meal deals</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Deals help attract customers and increase average basket values. Launch your first combo special now.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl"
          >
            Create First Deal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {deals.map((deal) => {
            const savings = deal.originalPrice - deal.discountedPrice;
            const savingsPercent = Math.round((savings / deal.originalPrice) * 100);

            return (
              <div
                key={deal.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-16/9 bg-slate-100 overflow-hidden">
                    <img
                      src={deal.image}
                      alt={deal.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                        Save ${savings.toFixed(2)} ({savingsPercent}% OFF)
                      </span>
                    </div>

                    <button
                      onClick={() => updateDeal({ ...deal, active: !deal.active })}
                      className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-bold shadow-xs transition-colors ${
                        deal.active
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-slate-700 text-white hover:bg-slate-800'
                      }`}
                    >
                      {deal.active ? 'Active on Storefront' : 'Inactive (Draft)'}
                    </button>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-900">{deal.title}</h3>
                      <div className="text-right shrink-0">
                        <span className="text-base font-black text-slate-900 tabular-nums">
                          {formatCurrency(deal.discountedPrice, currency)}
                        </span>
                        <span className="text-xs text-slate-400 line-through tabular-nums ml-2">
                          {formatCurrency(deal.originalPrice, currency)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{deal.description}</p>
                    {deal.endDate && (
                      <p className="text-[11px] text-slate-400">
                        Offer runs until {deal.endDate}
                      </p>
                    )}
                  </div>
                </div>

                  <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        updateRestaurant({
                          ...activeRestaurant,
                          content: {
                            ...(activeRestaurant.content || {} as any),
                            specialOfferDealId: activeRestaurant.content?.specialOfferDealId === deal.id ? undefined : deal.id
                          }
                        });
                      }}
                      className={`px-3 py-1.5 font-semibold flex items-center gap-1.5 rounded-lg ${
                        activeRestaurant.content?.specialOfferDealId === deal.id
                          ? 'bg-orange-100 text-orange-800'
                          : 'text-slate-700 hover:bg-slate-200/60'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{activeRestaurant.content?.specialOfferDealId === deal.id ? 'Featured Offer' : 'Set Featured Offer'}</span>
                    </button>
                    
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(deal)}
                        className="px-3 py-1.5 text-slate-700 hover:text-slate-950 font-semibold flex items-center gap-1.5 rounded-lg hover:bg-slate-200/60"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmId(deal.id)}
                        className="px-3 py-1.5 text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Deal Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingDeal ? 'Edit Special Deal' : 'Create Special Deal'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Deal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekend Mega Family Feast"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Items Included in Deal</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. 2 Double Smash Burgers, 1 Truffle Fries, and 2 Soft Drinks"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Original Price ({getCurrencySymbol(currency)})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formOrig}
                    onChange={(e) => setFormOrig(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Discounted Price ({getCurrencySymbol(currency)})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formDisc}
                    onChange={(e) => setFormDisc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Deal Photo - Select from Assets */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Deal Promotional Image</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  {formImage ? (
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs relative">
                        <img
                          src={formImage}
                          alt="Deal Preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 w-full space-y-1 text-center sm:text-left">
                        <p className="text-[11px] font-bold text-slate-700">Selected Deal Photo</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-xs">{formImage}</p>
                        <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setAssetPickerOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF1E6] hover:bg-[#ffe3cc] text-[#FF6900] font-bold text-xs transition-colors cursor-pointer"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Select from Assets</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormImage('')}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-200/70 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAssetPickerOpen(true)}
                      className="w-full py-4 px-4 border-2 border-dashed border-orange-300 rounded-xl bg-orange-50/40 hover:bg-orange-50/80 transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer group"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#FFF1E6] text-[#FF6900] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-[#FF6900]">
                        Select Photo from Assets
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Choose from media library or upload new with live progress
                      </span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valid Until (Optional)</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formActive}
                      onChange={(e) => setFormActive(e.target.checked)}
                      className="w-4 h-4 rounded text-orange-600 accent-orange-600"
                    />
                    <span>Active on Storefront</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {editingDeal ? 'Update Deal' : 'Publish Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-3">
            <h3 className="text-base font-bold text-slate-900">Delete Special Deal?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              This promotion will be permanently removed from your restaurant menu.
            </p>
            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
              >
                Keep Deal
              </button>
              <button
                onClick={() => {
                  deleteDeal(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3.5 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Picker Modal */}
      <AssetPickerModal
        isOpen={assetPickerOpen}
        onClose={() => setAssetPickerOpen(false)}
        onSelect={(url) => setFormImage(url)}
        restaurantId={activeRestaurant.id}
        title="Select Deal Image from Assets"
        currentSelectedUrl={formImage}
      />
    </div>
  );
};
