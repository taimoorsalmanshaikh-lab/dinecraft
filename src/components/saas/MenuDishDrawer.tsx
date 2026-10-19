import React from 'react';
import { X, Upload, Sparkles } from 'lucide-react';
import { MenuItem } from '../../types';

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
  imagePresets: Array<{ label: string; url: string }>;
  handleImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  imagePresets,
  handleImageFileChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-2xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white h-full shadow-[0_16px_48px_rgba(16,24,40,0.18)] z-10 flex flex-col justify-between p-6 sm:p-8 animate-in slide-in-from-right duration-200 overflow-y-auto">
        <form onSubmit={onSubmit} className="flex-1 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-[#FF6900] uppercase tracking-wider">
                  {isEditing ? 'Update Item' : 'New Dish'}
                </span>
                <h3 className="text-xl font-black text-[#111827]">
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

              {/* Photo presets or upload */}
              <div>
                <label className="block text-[11px] font-bold text-[#9CA3AF] uppercase mb-1">
                  Dish Image
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {imagePresets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormImage(p.url)}
                      className={`relative w-16 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        formImage === p.url ? 'border-[#FF6900] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <div className="mt-2 flex items-center gap-3">
                  <label className="px-3.5 py-1.5 rounded-full bg-[#F3F4F6] hover:bg-slate-200 text-[#4B5563] text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-[#FF6900]" />
                    <span>Upload Custom Photo</span>
                    <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
                  </label>
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
  );
};
