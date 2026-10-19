import React, { useState, useMemo } from 'react';
import { useDineCraft } from '../../context/DineCraftContext';
import { MenuItem } from '../../types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Upload,
  FolderPlus,
  Tag,
  Image as ImageIcon,
} from 'lucide-react';
import { AssetPickerModal } from './AssetPickerModal';
import {
  BURGER_HERO_IMAGE,
  PIZZA_IMAGE,
  BIRYANI_IMAGE,
  RESTAURANT_INTERIOR_IMAGE,
} from '../../data/mockData';

export const MenuManager: React.FC = () => {
  const { activeRestaurant, getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, addToast } =
    useDineCraft();

  const menuItems = getMenuItems(activeRestaurant.id);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('Burgers');
  const [formNewCategoryInput, setFormNewCategoryInput] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState(BURGER_HERO_IMAGE);
  const [formAvailable, setFormAvailable] = useState(true);
  const [formFeatured, setFormFeatured] = useState(false);

  // Category Manager States
  const [newCatName, setNewCatName] = useState('');
  const [editingCatName, setEditingCatName] = useState<{ original: string; current: string } | null>(null);

  const imagePresets = [
    { label: 'Gourmet Burger', url: BURGER_HERO_IMAGE },
    { label: 'Wood-Fired Pizza', url: PIZZA_IMAGE },
    { label: 'Aromatic Desi / Curry', url: BIRYANI_IMAGE },
    { label: 'Dining Platter', url: RESTAURANT_INTERIOR_IMAGE },
  ];

  // Dynamic Categories from existing menu items and default presets
  const categories = useMemo(() => {
    const itemCats = menuItems.map((m) => m.category).filter(Boolean);
    const set = new Set(['Burgers', 'Pizza', 'Sides', 'Beverages', ...itemCats]);
    return Array.from(set);
  }, [menuItems]);

  const filterTabs = useMemo(() => {
    return ['all', ...categories];
  }, [categories]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, search]);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      if (res) setFormImage(res);
    };
    reader.readAsDataURL(file);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormPrice('9.99');
    setFormCategory(categories[0] || 'Burgers');
    setFormNewCategoryInput('');
    setFormDescription('');
    setFormImage(activeRestaurant.banner || BURGER_HERO_IMAGE);
    setFormAvailable(true);
    setFormFeatured(false);
    setModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormPrice(item.price.toString());
    setFormCategory(item.category);
    setFormNewCategoryInput('');
    setFormDescription(item.description);
    setFormImage(item.imageUrl || item.image || '');
    setFormAvailable(item.available);
    setFormFeatured(item.featured);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) return;

    const parsedPrice = parseFloat(formPrice) || 0;
    const finalCategory = formCategory === '__custom__' && formNewCategoryInput.trim()
      ? formNewCategoryInput.trim()
      : formCategory;

    if (editingItem) {
      updateMenuItem({
        ...editingItem,
        name: formName.trim(),
        price: parsedPrice,
        category: finalCategory,
        description: formDescription.trim(),
        image: formImage,
        imageUrl: formImage,
        available: formAvailable,
        featured: formFeatured,
      });
      addToast({
        type: 'success',
        title: 'Product Updated',
        message: `${formName.trim()} has been updated successfully.`,
      });
    } else {
      addMenuItem({
        restaurantId: activeRestaurant.id,
        name: formName.trim(),
        price: parsedPrice,
        category: finalCategory,
        description: formDescription.trim(),
        image: formImage,
        imageUrl: formImage,
        available: formAvailable,
        featured: formFeatured,
      });
      addToast({
        type: 'success',
        title: 'Product Added',
        message: `${formName.trim()} added to your menu.`,
      });
    }
    setModalOpen(false);
  };

  const toggleAvailability = (item: MenuItem) => {
    updateMenuItem({
      ...item,
      available: !item.available,
    });
    addToast({
      type: 'info',
      title: item.available ? 'Marked Unavailable' : 'Marked Available',
      message: `${item.name} is now ${item.available ? 'unavailable/sold out' : 'available for ordering'}.`,
    });
  };

  // Category Actions
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    setNewCatName('');
    addToast({
      type: 'success',
      title: 'Category Created',
      message: `"${trimmed}" is ready. You can now assign dishes to it.`,
    });
  };

  const handleRenameCategory = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingCatName(null);
      return;
    }

    // Cascade update to all items with oldName
    menuItems.forEach((item) => {
      if (item.category === oldName) {
        updateMenuItem({
          ...item,
          category: trimmed,
        });
      }
    });

    setEditingCatName(null);
    addToast({
      type: 'success',
      title: 'Category Renamed',
      message: `Renamed "${oldName}" to "${trimmed}". Associated items updated.`,
    });
  };

  const handleDeleteCategory = (catName: string) => {
    // Reassign any items in this category to "General" to prevent orphan items
    const affected = menuItems.filter((i) => i.category === catName);
    affected.forEach((item) => {
      updateMenuItem({
        ...item,
        category: 'General',
      });
    });

    if (selectedCategory === catName) {
      setSelectedCategory('all');
    }

    addToast({
      type: 'info',
      title: 'Category Removed',
      message: `Category "${catName}" removed. ${affected.length} items moved to "General".`,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Menu & Products ({menuItems.length})</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add dishes, modify pricing, upload photos, organize categories, or toggle availability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCategoryModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-slate-500" />
            <span>Manage Categories</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#FF6900] hover:bg-[#e05d00] text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {filterTabs.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all capitalize cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat === 'all' ? 'All Dishes' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items Table / Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No products found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {search || selectedCategory !== 'all'
              ? 'Try modifying your search query or selecting a different category.'
              : 'Get started by adding your first restaurant dish to the menu.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            {search || selectedCategory !== 'all' ? (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('all');
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            ) : (
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-[#FF6900] hover:bg-[#e05d00] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Add Your First Product
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const itemImg = item.imageUrl || item.image || BURGER_HERO_IMAGE;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3.5">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 relative">
                      <img
                        src={itemImg}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {!item.available && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center">
                          <span className="text-[9px] font-bold text-white bg-slate-950 px-1.5 py-0.5 rounded">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md capitalize">
                          {item.category}
                        </span>
                        {item.featured && (
                          <span className="px-2 py-0.5 bg-orange-100 text-[#FF6900] text-[10px] font-bold rounded-md flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Featured</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 truncate">{item.name}</h3>
                      <p className="text-xs font-black text-[#172033] mt-1 tabular-nums">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                    {item.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  {/* Availability Toggle */}
                  <button
                    onClick={() => toggleAvailability(item)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      item.available
                        ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        : 'text-rose-700 bg-rose-50 hover:bg-rose-100'
                    }`}
                  >
                    {item.available ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-emerald-600" />
                        <span>Available</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-rose-500" />
                        <span>Sold Out</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit dish details & price"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete dish"
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

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Double Truffle Smash Burger"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="9.99"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden capitalize"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__custom__">+ Enter Custom Category...</option>
                  </select>
                </div>
              </div>

              {formCategory === '__custom__' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    New Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Seafood Specials"
                    value={formNewCategoryInput}
                    onChange={(e) => setFormNewCategoryInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Fresh ingredients, signature sauces, and chef details..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden resize-none"
                />
              </div>

              {/* Product Image */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Product Photo
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <img
                        src={formImage || BURGER_HERO_IMAGE}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAssetPickerOpen(true)}
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
                        onChange={handleImageFileChange}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {imagePresets.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setFormImage(p.url)}
                      className={`rounded-lg border overflow-hidden text-left p-1 cursor-pointer ${
                        formImage === p.url ? 'border-orange-600 bg-orange-50' : 'border-slate-200 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="aspect-square rounded bg-slate-100 overflow-hidden mb-1">
                        <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                      </div>
                      <span className="block text-[9px] font-semibold text-slate-700 truncate">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-800">Available for Online Order</span>
                    <p className="text-[10px] text-slate-500">Uncheck to mark as sold out or unavailable</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formAvailable}
                    onChange={(e) => setFormAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 accent-orange-600 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-800">Feature in "Popular Dishes"</span>
                    <p className="text-[10px] text-slate-500">Highlight on the storefront homepage</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 accent-orange-600 cursor-pointer"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF6900] hover:bg-[#e05d00] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#FF6900]" />
                <h3 className="text-base font-bold text-slate-900">Manage Menu Categories</h3>
              </div>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Create Category Form */}
            <form onSubmit={handleAddCategory} className="pt-4 mb-4 flex gap-2">
              <input
                type="text"
                placeholder="New category name (e.g. Appetizers)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={!newCatName.trim()}
                className="px-4 py-2 bg-[#FF6900] hover:bg-[#e05d00] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                Add
              </button>
            </form>

            {/* Existing Categories List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const count = menuItems.filter((i) => i.category === cat).length;
                const isEditing = editingCatName?.original === cat;

                return (
                  <div
                    key={cat}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={editingCatName.current}
                          onChange={(e) => setEditingCatName({ ...editingCatName, current: e.target.value })}
                          className="flex-1 px-2.5 py-1 text-xs border border-orange-400 rounded-lg focus:outline-hidden"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleRenameCategory(cat, editingCatName.current)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatName(null)}
                          className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 capitalize">{cat}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({count} dishes)</span>
                      </div>
                    )}

                    {!isEditing && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingCatName({ original: cat, current: cat })}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded"
                          title="Rename Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete Category (reassigns items to General)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Menu Item?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This item will be permanently removed from your menu and storefront immediately.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteMenuItem(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs cursor-pointer"
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
        title="Select Dish Photo from Assets"
        currentSelectedUrl={formImage}
      />
    </div>
  );
};
