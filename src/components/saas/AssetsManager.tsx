import React, { useState } from 'react';
import { useDineCraft } from '../../context/DineCraftContext';
import { AssetItem } from '../../types';
import {
  FolderOpen,
  Upload,
  Trash2,
  Copy,
  Check,
  Image as ImageIcon,
  Film,
  ExternalLink,
  Sparkles,
  Search,
} from 'lucide-react';

export const AssetsManager: React.FC = () => {
  const { activeRestaurant, assets, uploadAsset, deleteAsset, addToast } = useDineCraft();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'image' | 'video'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<AssetItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || asset.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVideo = file.type.startsWith('video/');
        const reader = new FileReader();
        
        await new Promise<void>((resolve) => {
          reader.onload = async (uploadEvent) => {
            const url = uploadEvent.target?.result as string;
            if (url) {
              await uploadAsset({
                name: file.name,
                url,
                type: isVideo ? 'video' : 'image',
              });
            }
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    addToast({
      type: 'success',
      title: 'URL Copied',
      message: 'Media URL copied to clipboard.',
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <FolderOpen className="w-6 h-6" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Assets Media Library</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            All images and videos uploaded for {activeRestaurant.name} are stored here for easy reuse across your website.
          </p>
        </div>

        {/* Upload Action Button */}
        <label className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>{isUploading ? 'Uploading...' : 'Upload Media Files'}</span>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </label>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto text-xs font-semibold">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Files ({assets.length})
          </button>
          <button
            onClick={() => setSelectedFilter('image')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedFilter === 'image'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Images
          </button>
          <button
            onClick={() => setSelectedFilter('video')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedFilter === 'video'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Videos
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search media assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-orange-500 focus:outline-hidden bg-slate-50/50"
          />
        </div>
      </div>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
            <ImageIcon className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">No media assets found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload images or videos directly from your gallery using the upload button above. They will be stored securely for your storefront.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs hover:bg-orange-700">
            <Upload className="w-4 h-4" />
            <span>Upload First Asset</span>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col"
            >
              <div
                className="relative aspect-square bg-slate-100 cursor-pointer overflow-hidden"
                onClick={() => setPreviewAsset(asset)}
              >
                {asset.type === 'video' ? (
                  <video src={asset.url} className="w-full h-full object-cover" />
                ) : (
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="p-2 bg-white text-slate-900 rounded-full shadow-md text-xs">
                    <ExternalLink className="w-4 h-4" />
                  </span>
                </div>
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
                  {asset.type}
                </span>
              </div>

              <div className="p-3 flex flex-col justify-between flex-1 space-y-2">
                <div>
                  <p className="text-xs font-bold text-slate-900 truncate" title={asset.name}>
                    {asset.name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{asset.createdAt}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => copyToClipboard(asset.url, asset.id)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    title="Copy URL"
                  >
                    {copiedId === asset.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => deleteAsset(asset.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Preview Modal */}
      {previewAsset && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewAsset(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold truncate">{previewAsset.name}</h3>
              <button
                onClick={() => setPreviewAsset(null)}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 bg-slate-950 flex items-center justify-center aspect-video">
              {previewAsset.type === 'video' ? (
                <video src={previewAsset.url} controls autoPlay className="max-h-full max-w-full rounded-xl" />
              ) : (
                <img src={previewAsset.url} alt={previewAsset.name} className="max-h-full max-w-full object-contain rounded-xl" />
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">Added on {previewAsset.createdAt}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(previewAsset.url, previewAsset.id)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
                >
                  {copiedId === previewAsset.id ? 'Copied URL!' : 'Copy URL'}
                </button>
                <button
                  onClick={() => {
                    deleteAsset(previewAsset.id);
                    setPreviewAsset(null);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
                >
                  Delete Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
