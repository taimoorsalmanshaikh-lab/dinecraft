import React, { useState } from 'react';
import { X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useDineCraft } from '../../context/DineCraftContext';
import { AssetPickerModal } from './AssetPickerModal';

interface MenuDishDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  categories: string[];
  formName: string;
  setFormName: (val: string) => void;
  formPrice: string;
  setFormPrice: (val: string) => void;
  formCategory: string;
  setFormCategory: (val: string) => void;
  formNewCategoryInput: string;
  setFormNewCategoryInput: (val: string) => void;
  formDescription: string;
  setFormDescription: (val: string) => void;
  formImage: string;
  setFormImage: (val: string) => void;
  formAvailable: boolean;
  setFormAvailable: (val: boolean) => void;
  formFeatured: boolean;
  setFormFeatured: (val: boolean) => void;
  errorMsg: string;
  onSubmit: (e: React.FormEvent) => void;
  imagePresets?: Array<{ label: string; url: string }>;
  handleImageFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MenuDishDrawer: React.FC<MenuDishDrawerProps> = ({
  isOpen,
  onClose,
  isEditing,
  categories,
  formName,
  setFormName,
  formPrice,
  setFormPrice,
  formCategory,
  setFormCategory,
  formNewCategoryInput,
  setFormNewCategoryInput,
  formDescription,
  setFormDescription,
  formImage,
  setFormImage,
  formAvailable,
  setFormAvailable,
  formFeatured,
  setFormFeatured,
  errorMsg,
  onSubmit,
}) => {
  const { activeRestaurant } = useDineCraft();
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-2xs transition-opacity"
          onClick={onClose}
        />

        <div className="relative w-full max-w-lg bg-white h-full shadow-[0_16px_48px_rgba(16,24,40,0.18)] z-10 flex flex-col justify-between p-4 sm:p-7 animate-in slide-in-from-right duration-200 overflow-y-auto">
          <form onSubmit={onSubmit} className="flex-1 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-[#FF6900] uppercase tracking-wider">
                    {isEditing ? 'Update Item' : 'New Dish'}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-[#111827]">
                    {isEditing ? 'Edit Menu Item' : 'Add Menu Item'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-[#F3F4F6] hover:bg-slate-200 text-[#4B5563] flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {errorMsg && (
                <div className="my-3 p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* Form Fields */}
              <div className="space-y-4 py-4 text-xs font-semibold text-[#111827]">
                <div>
                  <label className="block text-[11px] font-bold text-[#9CA3AF] uppercase mb-1">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Classic Truffle Smash Burger"
                    className="w-full px-4 py-2.5 bg-[#F9FAFB] rounded-2xl text-xs font-semibold text-[#111827] border-none focus:ring-2 focus:ring-[#FF6900] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#9CA3AF] uppercase mb-1">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="9.99"
                      className="w-full px-4 py-2.5 bg-[#F9FAFB] rounded-2xl text-xs font-semibold text-[#111827] border-none focus:ring-2 focus:ring-[#FF6900] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#9CA3AF] uppercase mb-1">
                      Category *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F9FAFB] rounded-2xl text-xs font-semibold text-[#111827] border-none focus:ring-2 focus:ring-[#FF6900] focus:outline-hidden"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="__NEW__">+ Custom Category</option>
                    </select>
                  </div>
                </div>

                {formCategory === '__NEW__' && (
                  <div>
                    <label className="block text-[11px] font-bold text-[#9CA3AF] uppercase mb-1">
                      New Category Name
                    </label>
                    <input
                      type="text"
                      value={formNewCategoryInput}
                      onChange={(e) => setFormNewCategoryInput(e.target.value)}
                      placeholder="e.g. Chef Specials"
                      className="w-full px-4 py-2.5 bg-[#F9FAFB] rounded-2xl text-xs font-semibold text-[#111827] border-none focus:ring-2 focus:ring-[#FF6900] focus:outline-hidden"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-[#9CA3AF] uppercase mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Ingredients and culinary preparation details..."
                    className="w-full px-4 py-2.5 bg-[#F9FAFB] rounded-2xl text-xs font-semibold text-[#111827] border-none focus:ring-2 focus:ring-[#FF6900] focus:outline-hidden resize-none"
                  />
                </div>

                {/* Dish Image - Select from Assets */}
                <div>
                  <label className="block text-[11px] font-bold text-[#9CA3AF] uppercase mb-1.5">
                    Dish Image
                  </label>
                  <div className="p-3 bg-[#F9FAFB] rounded-2xl border border-slate-200/80">
                    {formImage ? (
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
                          <img src={formImage} alt="Dish preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-xs font-bold text-[#111827]">Current Dish Photo</p>
                          <div className="flex items-center gap-2 pt-0.5">
                            <button
                              type="button"
                              onClick={() => setAssetPickerOpen(true)}
                              className="px-3 py-1.5 rounded-xl bg-[#FFF1E6] hover:bg-[#ffe3cc] text-[#FF6900] font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>Select from Assets</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormImage('')}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-200/70 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-[11px] cursor-pointer transition-colors"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAssetPickerOpen(true)}
                        className="w-full py-4 border-2 border-dashed border-orange-300 rounded-xl bg-orange-50/40 hover:bg-orange-50/80 transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#FFF1E6] text-[#FF6900] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-[#FF6900]">
                          Select from Assets
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Choose from media library or upload new with live progress
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Toggles */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs font-bold text-[#111827]">Available for Ordering</span>
                  <input
                    type="checkbox"
                    checked={formAvailable}
                    onChange={(e) => setFormAvailable(e.target.checked)}
                    className="w-4 h-4 accent-[#FF6900] rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-[#F3F4F6] text-[#4B5563] text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#FF6900] hover:bg-[#E65F00] text-white text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
              >
                {isEditing ? 'Save Changes' : 'Add to Menu'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Asset Picker Modal */}
      <AssetPickerModal
        isOpen={assetPickerOpen}
        onClose={() => setAssetPickerOpen(false)}
        onSelect={(url) => setFormImage(url)}
        restaurantId={activeRestaurant.id}
        title="Select Dish Photo from Assets"
        currentSelectedUrl={formImage}
      />
    </>
  );
};
