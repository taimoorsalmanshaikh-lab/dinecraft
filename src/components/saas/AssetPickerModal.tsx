import React, { useState, useEffect } from 'react';
import { AssetItem } from '../../types';
import { getRestaurantAssets, saveAsset } from '../../services/restaurantService';
import {
  Image as ImageIcon,
  X,
  Upload,
  Check,
  Search,
  Filter,
  Film,
  Plus,
} from 'lucide-react';

interface AssetPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  restaurantId: string;
  title?: string;
  currentSelectedUrl?: string;
}

export const AssetPickerModal: React.FC<AssetPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  restaurantId,
  title = 'Select Media from Assets',
  currentSelectedUrl,
}) => {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen && restaurantId) {
      loadAssets();
    }
  }, [isOpen, restaurantId]);

  const loadAssets = async () => {
    setIsLoading(true);
    try {
      const data = await getRestaurantAssets(restaurantId);
      setAssets(data);
    } catch (e) {
      console.warn('Error loading assets in picker:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      const isVideo = file.type.startsWith('video/');
      const newAsset: AssetItem = {
        id: `asset_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        restaurantId,
        name: file.name.replace(/\.[^/.]+$/, ''),
        url: dataUrl,
        type: isVideo ? 'video' : 'image',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        createdAt: new Date().toISOString(),
      };

      try {
        await saveAsset(newAsset);
        setAssets((prev) => [newAsset, ...prev]);
        // Automatically select the newly uploaded asset
        onSelect(newAsset.url);
        onClose();
      } catch (err) {
        console.error('Failed to upload new asset:', err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const filteredAssets = assets.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'all') return true;
    return a.type === filterType;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-black/5 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                {title}
              </h2>
              <p className="text-xs text-slate-500">
                Choose from your restaurant's saved asset media library
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar: Search, Filter, Upload */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:border-orange-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center rounded-xl bg-white border border-slate-200 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'all' ? 'bg-orange-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterType('image')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'image' ? 'bg-orange-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Images
              </button>
              <button
                type="button"
                onClick={() => setFilterType('video')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'video' ? 'bg-orange-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Videos
              </button>
            </div>
          </div>

          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Uploading...' : 'Upload to Assets'}</span>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              disabled={isUploading}
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Assets Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-semibold">Loading media assets...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="py-14 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-400 flex items-center justify-center mx-auto">
                <ImageIcon className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No assets found</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {searchQuery
                  ? 'No media matches your search query.'
                  : "You haven't uploaded any media items to your assets library yet."}
              </p>
              <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer mt-2">
                <Plus className="w-4 h-4" />
                <span>Upload First Asset</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredAssets.map((asset) => {
                const isSelected = currentSelectedUrl === asset.url;
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => {
                      onSelect(asset.url);
                      onClose();
                    }}
                    className={`group relative rounded-2xl overflow-hidden border-2 text-left transition-all p-1.5 flex flex-col bg-white cursor-pointer ${
                      isSelected
                        ? 'border-orange-600 ring-2 ring-orange-600/30 shadow-md'
                        : 'border-slate-200 hover:border-orange-400 hover:shadow-xs'
                    }`}
                  >
                    <div className="aspect-square rounded-xl bg-slate-100 overflow-hidden relative">
                      {asset.type === 'video' ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white">
                          <Film className="w-8 h-8 opacity-70" />
                          <span className="text-[10px] mt-1 font-mono uppercase">Video</span>
                        </div>
                      ) : (
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}

                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="pt-2 px-1 pb-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{asset.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">
                        {asset.type} {asset.size ? `• ${asset.size}` : ''}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>{filteredAssets.length} asset(s) available</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
