import React, { useState } from 'react';
import { useDineCraft } from '../../context/DineCraftContext';
import { AssetItem } from '../../types';
import { uploadMediaFile, validateMediaFile } from '../../services/mediaService';
import {
  FolderOpen,
  Upload,
  Trash2,
  Copy,
  Check,
  Image as ImageIcon,
  Film,
  ExternalLink,
  Search,
  Loader2,
  CheckCircle2,
  X,
} from 'lucide-react';

interface UploadQueueItem {
  name: string;
  size: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
}

export const AssetsManager: React.FC = () => {
  const { activeRestaurant, assets, uploadAsset, deleteAsset, addToast } = useDineCraft();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'image' | 'video'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<AssetItem | null>(null);
  
  // Real-time Upload Progress States
  const [isUploading, setIsUploading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [currentFileText, setCurrentFileText] = useState('');
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || asset.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setOverallProgress(5);
    
    // Initialize queue
    const initialQueue: UploadQueueItem[] = Array.from(files).map((f) => ({
      name: f.name,
      size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
      progress: 0,
      status: 'uploading',
    }));
    setUploadQueue(initialQueue);

    try {
      const totalFiles = files.length;
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const validation = validateMediaFile(file);
        if (!validation.valid) {
          addToast({
            type: 'error',
            title: 'File Rejected',
            message: validation.error || `File ${file.name} is invalid.`,
          });
          continue;
        }

        setCurrentFileText(`Uploading ${i + 1} of ${totalFiles}: ${file.name}`);
        setUploadQueue((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, progress: 20, status: 'uploading' } : item
          )
        );

        const uploadResult = await uploadMediaFile(
          file,
          activeRestaurant.id || 'general',
          (fileProgress, statusText) => {
            setUploadQueue((prev) =>
              prev.map((item, idx) =>
                idx === i ? { ...item, progress: fileProgress, status: fileProgress >= 90 ? 'processing' : 'uploading' } : item
              )
            );
            const overall = Math.round(((i + (fileProgress / 100)) / totalFiles) * 100);
            setOverallProgress(Math.min(98, overall));
            if (statusText) setCurrentFileText(statusText);
          }
        );

        await uploadAsset({
          name: uploadResult.name,
          url: uploadResult.url,
          type: uploadResult.type,
          size: uploadResult.size,
        });

        setUploadQueue((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, progress: 100, status: 'completed' } : item
          )
        );
      }

      setOverallProgress(100);
      setCurrentFileText('All assets uploaded successfully!');
      addToast({
        type: 'success',
        title: 'Assets Uploaded',
        message: `Successfully uploaded and saved to your media library.`,
      });

      setTimeout(() => {
        setIsUploading(false);
        setOverallProgress(0);
        setUploadQueue([]);
        setCurrentFileText('');
      }, 1500);
    } catch (err: any) {
      console.error('Upload error:', err);
      addToast({
        type: 'error',
        title: 'Upload Error',
        message: err.message || 'There was a problem uploading one or more files.',
      });
      setIsUploading(false);
    } finally {
      e.target.value = '';
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    addToast({
      type: 'success',
      title: 'URL Copied',
      message: 'Media asset URL copied to clipboard.',
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-orange-100 text-orange-600 rounded-xl shrink-0">
              <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Assets Media Library</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Central repository for images and videos used across menu dishes, deals, and your storefront for {activeRestaurant.name}.
          </p>
        </div>

        {/* Upload Action Button */}
        <label className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer shrink-0">
          <Upload className="w-4 h-4" />
          <span>{isUploading ? `Uploading (${overallProgress}%)...` : 'Upload Media Files'}</span>
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

      {/* Upload Progress Banner (Active when uploading) */}
      {isUploading && (
        <div className="bg-white rounded-2xl border border-orange-200 p-4 sm:p-5 shadow-xs space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <Loader2 className="w-5 h-5 text-orange-600 animate-spin shrink-0" />
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {currentFileText || 'Uploading media files...'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Optimizing resolution and preparing previews
                </p>
              </div>
            </div>
            <span className="text-sm font-mono font-black text-orange-600 tabular-nums shrink-0">
              {overallProgress}%
            </span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          {/* Individual queue breakdown */}
          {uploadQueue.length > 0 && (
            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
              {uploadQueue.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-700"
                >
                  {item.status === 'completed' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : item.status === 'processing' ? (
                    <Loader2 className="w-3.5 h-3.5 text-orange-600 animate-spin shrink-0" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span className="truncate max-w-[140px] font-bold">{item.name}</span>
                  <span className="text-slate-400 font-mono text-[10px]">({item.size})</span>
                  <span className="text-orange-600 font-bold ml-1">{item.progress}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Files ({assets.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('image')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'image'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Images
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('video')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === 'video'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
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
        <div className="text-center py-16 sm:py-20 bg-white rounded-3xl border border-dashed border-slate-200 p-6 sm:p-8 space-y-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
            <ImageIcon className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">No media assets found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload images or food videos to your assets library. They will be stored securely and can be selected anywhere on your storefront without re-uploading.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs hover:bg-orange-700 transition-colors">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all group flex flex-col"
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

              <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1 space-y-2">
                <div>
                  <p className="text-xs font-bold text-slate-900 truncate" title={asset.name}>
                    {asset.name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : 'Recent'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(asset.url, asset.id)}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
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
                        <span className="hidden sm:inline">Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteAsset(asset.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
          onClick={() => setPreviewAsset(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <h3 className="text-xs sm:text-sm font-bold truncate pr-3">{previewAsset.name}</h3>
              <button
                type="button"
                onClick={() => setPreviewAsset(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 bg-slate-950 flex items-center justify-center aspect-video min-h-[200px]">
              {previewAsset.type === 'video' ? (
                <video src={previewAsset.url} controls autoPlay className="max-h-full max-w-full rounded-xl" />
              ) : (
                <img
                  src={previewAsset.url}
                  alt={previewAsset.name}
                  className="max-h-full max-w-full object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-500">
                Added: {previewAsset.createdAt ? new Date(previewAsset.createdAt).toLocaleDateString() : 'Saved Asset'}
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => copyToClipboard(previewAsset.url, previewAsset.id)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {copiedId === previewAsset.id ? 'Copied URL!' : 'Copy URL'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteAsset(previewAsset.id);
                    setPreviewAsset(null);
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
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
