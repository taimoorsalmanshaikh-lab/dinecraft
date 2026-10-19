import React, { useState, useRef } from 'react';
import { Upload, X, Camera, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { uploadImageFile } from '../../services/imageService';
import {
  BURGER_HERO_IMAGE,
  PIZZA_IMAGE,
  BIRYANI_IMAGE,
  RESTAURANT_INTERIOR_IMAGE,
} from '../../data/mockData';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  storagePath?: string;
  label?: string;
  aspectRatio?: '1:1' | '16:9' | '4:3' | 'round';
  helperText?: string;
  showPresets?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  storagePath = 'uploads',
  label,
  aspectRatio = '16:9',
  helperText,
  showPresets = true,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const samplePresets = [
    { label: 'Gourmet Smash Burger', url: BURGER_HERO_IMAGE },
    { label: 'Wood-Fired Pizza', url: PIZZA_IMAGE },
    { label: 'Aromatic Desi Dum Biryani', url: BIRYANI_IMAGE },
    { label: 'Warm Bistro Dining', url: RESTAURANT_INTERIOR_IMAGE },
  ];

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setIsUploading(true);
    setProgress(15);
    try {
      const uniqueName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      const fullPath = `${storagePath}/${uniqueName}`;
      const url = await uploadImageFile(file, fullPath, (p) => setProgress(p));
      onChange(url);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case '1:1':
        return 'aspect-square max-w-[140px] rounded-2xl';
      case 'round':
        return 'aspect-square w-24 h-24 rounded-full';
      case '4:3':
        return 'aspect-4/3 rounded-2xl';
      case '16:9':
      default:
        return 'aspect-16/9 rounded-2xl';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700">{label}</label>
          {showPresets && (
            <button
              type="button"
              onClick={() => setShowPresetPicker(!showPresetPicker)}
              className="text-[11px] font-semibold text-orange-600 hover:text-orange-700"
            >
              {showPresetPicker ? 'Hide Sample Photos' : 'Choose from Samples'}
            </button>
          )}
        </div>
      )}

      {/* Preset Picker Dropdown */}
      {showPresetPicker && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mb-2">
          <p className="text-[11px] font-semibold text-slate-500">Pick a high-resolution food photo:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {samplePresets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  onChange(p.url);
                  setShowPresetPicker(false);
                }}
                className={`group relative aspect-16/10 rounded-lg overflow-hidden border transition-all ${
                  value === p.url ? 'border-2 border-orange-600 ring-2 ring-orange-200' : 'border-slate-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={p.url} alt={p.label} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <span className="absolute inset-x-0 bottom-0 bg-slate-900/80 text-white text-[10px] p-1 truncate">
                  {p.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Preview Box or Empty Dropzone */}
      {value ? (
        <div className="relative group overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs">
          <div className={`${getAspectClass()} overflow-hidden`}>
            <img
              src={value}
              alt="Uploaded photo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Action overlay */}
          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-slate-900 font-bold text-xs rounded-lg shadow-sm hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Change Photo</span>
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
              title="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-orange-500 bg-orange-50/50'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          {isUploading ? (
            <div className="space-y-2 py-4">
              <RefreshCw className="w-6 h-6 text-orange-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-800">Uploading photo...</p>
              <div className="w-32 bg-slate-200 h-1.5 rounded-full mx-auto overflow-hidden">
                <div
                  className="bg-orange-600 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2 py-2">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Click to upload from gallery or drag & drop
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  JPG, PNG, or WebP (auto-compressed before save)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden File Input (opens mobile camera/gallery or desktop file manager) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {helperText && <p className="text-[11px] text-slate-400 leading-tight">{helperText}</p>}
    </div>
  );
};
