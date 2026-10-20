import React, { useState, useEffect, useRef } from 'react';
import { AssetItem } from '../../types';
import { getRestaurantAssets, saveAsset } from '../../services/restaurantService';
import { uploadMediaFile, validateMediaFile } from '../../services/mediaService';
import {
  Image as ImageIcon,
  X,
  Upload,
  Check,
  Search,
  Filter,
  Film,
  Plus,
  Loader2,
  CheckCircle2,
  CloudUpload,
  Sparkles,
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
  const [isDragOver, setIsDragOver] = useState(false);

  // Real-time Upload Progress State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSize, setUploadFileSize] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const processFile = async (file: File) => {
    if (!file) return;

    const validation = validateMediaFile(file);
    if (!validation.valid) {
      alert(validation.error || 'Invalid media file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);
    setUploadFileName(file.name);
    setUploadFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    setUploadStatus('Uploading file to secure storage...');

    try {
      const uploadResult = await uploadMediaFile(
        file,
        restaurantId || 'general',
        (progress, status) => {
          setUploadProgress(progress);
          if (status) setUploadStatus(status);
        }
      );

      const newAsset: AssetItem = {
        id: `asset_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        restaurantId,
        name: uploadResult.name,
        url: uploadResult.url,
        type: uploadResult.type,
        size: uploadResult.size,
        createdAt: new Date().toISOString(),
      };

      await saveAsset(newAsset);
      setAssets((prev) => [newAsset, ...prev]);

      setUploadProgress(100);
      setUploadStatus('Upload complete! Applying asset...');

      setTimeout(() => {
        onSelect(newAsset.url);
        setIsUploading(false);
        setUploadProgress(0);
        onClose();
      }, 500);
    } catch (err: any) {
      console.error('Failed to upload new asset:', err);
      setUploadStatus(err.message || 'Upload failed. Please try again.');
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 2000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  if (!isOpen) return null;

  const filteredAssets = assets.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'all') return true;
    return a.type === filterType;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden border border-black/5 animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF1E6] text-[#FF6900] flex items-center justify-center shrink-0 shadow-2xs">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold text-[#111827] leading-tight truncate">
                {title}
              </h2>
              <p className="text-[11px] sm:text-xs text-[#9CA3AF] truncate">
                Select from restaurant media library or upload a new photo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F3F4F6] hover:bg-slate-200 text-[#4B5563] flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Upload Progress Card (Prominently visible when uploading) */}
        {isUploading && (
          <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-orange-50 via-[#FFF1E6] to-amber-50 border-b border-orange-200/80 shrink-0 animate-fadeIn">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-2.5 min-w-0">
                {uploadProgress >= 100 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 animate-bounce" />
                ) : (
                  <Loader2 className="w-4 h-4 text-[#FF6900] animate-spin shrink-0" />
                )}
                <div className="min-w-0">
                  <span className="font-bold text-[#111827] truncate block text-xs">
                    {uploadFileName || 'Uploading media...'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {uploadStatus}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <span className="font-black text-[#FF6900] font-mono text-sm tabular-nums">
                  {uploadProgress}%
                </span>
                {uploadFileSize && (
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {uploadFileSize}
                  </span>
                )}
              </div>
            </div>

            {/* Visual Animated Progress Bar Track */}
            <div className="w-full bg-orange-200/60 h-2.5 rounded-full overflow-hidden p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#FF6900] to-amber-500 rounded-full transition-all duration-300 ease-out shadow-xs"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Drag-over indicator overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-[#FF6900]/90 z-20 flex flex-col items-center justify-center text-white backdrop-blur-xs p-6 text-center animate-fadeIn pointer-events-none">
            <CloudUpload className="w-14 h-14 mb-3 animate-bounce" />
            <h3 className="text-xl font-bold">Drop Image to Upload</h3>
            <p className="text-xs text-white/80 mt-1">
              File will be uploaded to your restaurant assets library with live progress tracking
            </p>
          </div>
        )}

        {/* Toolbar: Search, Filter, Upload Button */}
        <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 border-b border-slate-100 bg-[#F9FAFB] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="relative flex-1 min-w-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-[#111827] focus:border-[#FF6900] focus:outline-hidden"
              />
            </div>

            <div className="flex items-center rounded-xl bg-white border border-slate-200 p-0.5 text-xs font-semibold shrink-0">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-2 sm:px-3 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
                  filterType === 'all'
                    ? 'bg-[#FF6900] text-white shadow-2xs font-bold'
                    : 'text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterType('image')}
                className={`px-2 sm:px-3 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
                  filterType === 'image'
                    ? 'bg-[#FF6900] text-white shadow-2xs font-bold'
                    : 'text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                Images
              </button>
              <button
                type="button"
                onClick={() => setFilterType('video')}
                className={`px-2 sm:px-3 py-1 rounded-lg transition-colors cursor-pointer text-xs ${
                  filterType === 'video'
                    ? 'bg-[#FF6900] text-white shadow-2xs font-bold'
                    : 'text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                Videos
              </button>
            </div>
          </div>

          <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF6900] hover:bg-[#E65F00] text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0 active:scale-95">
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? `Uploading ${uploadProgress}%...` : 'Upload New Asset'}</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              disabled={isUploading}
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Assets Grid */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 min-h-[220px]">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#FF6900] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-semibold">Loading media assets...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF1E6] text-[#FF6900] flex items-center justify-center mx-auto">
                <ImageIcon className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-[#111827]">No media assets found</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {searchQuery
                  ? 'No media matches your search query.'
                  : "You haven't uploaded any media items yet. Click upload to add photos to your restaurant library."}
              </p>
              <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF6900] hover:bg-[#E65F00] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer mt-2">
                <Plus className="w-4 h-4" />
                <span>Upload First Asset</span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  disabled={isUploading}
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
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
                        ? 'border-[#FF6900] ring-2 ring-[#FF6900]/30 shadow-md scale-[1.01]'
                        : 'border-slate-200 hover:border-[#FF6900]/60 hover:shadow-xs'
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
                          referrerPolicy="no-referrer"
                        />
                      )}

                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#FF6900] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    <div className="pt-2 px-1 pb-1">
                      <p className="text-xs font-bold text-[#111827] truncate">{asset.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5 truncate">
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
        <div className="px-4 sm:px-6 py-3 border-t border-slate-100 bg-[#F9FAFB] flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="truncate">{filteredAssets.length} asset(s) in library</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-[#4B5563] font-bold transition-colors cursor-pointer shrink-0 ml-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
