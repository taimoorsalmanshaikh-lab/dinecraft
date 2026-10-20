import React, { useState } from 'react';
import { X, Camera, Image as ImageIcon } from 'lucide-react';
import { useDineCraft } from '../../context/DineCraftContext';
import { AssetPickerModal } from '../saas/AssetPickerModal';

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
  label,
  aspectRatio = '16:9',
  helperText,
}) => {
  const { activeRestaurant } = useDineCraft();
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);

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
        <label className="block text-xs font-bold text-slate-700">{label}</label>
      )}

      {/* Image Preview Box or Empty Select from Assets Box */}
      {value ? (
        <div className="relative group overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs rounded-2xl">
          <div className={`${getAspectClass()} overflow-hidden`}>
            <img
              src={value}
              alt="Uploaded photo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Action overlay */}
          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setAssetPickerOpen(true)}
              className="px-3 py-1.5 bg-white text-slate-900 font-bold text-xs rounded-xl shadow-sm hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Select from Assets</span>
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors cursor-pointer"
              title="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAssetPickerOpen(true)}
          className="w-full border-2 border-dashed border-orange-300 rounded-2xl p-5 text-center cursor-pointer transition-all bg-orange-50/40 hover:bg-orange-50/80 flex flex-col items-center justify-center gap-1.5 group"
        >
          <div className="w-10 h-10 rounded-full bg-[#FFF1E6] text-[#FF6900] flex items-center justify-center mx-auto shadow-2xs group-hover:scale-105 transition-transform">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#FF6900]">
              Select Photo from Assets
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Choose from media library or upload new with live progress
            </p>
          </div>
        </button>
      )}

      {helperText && <p className="text-[11px] text-slate-400 leading-tight">{helperText}</p>}

      {/* Asset Picker Modal */}
      <AssetPickerModal
        isOpen={assetPickerOpen}
        onClose={() => setAssetPickerOpen(false)}
        onSelect={(url) => onChange(url)}
        restaurantId={activeRestaurant?.id || ''}
        title="Select Photo from Assets"
        currentSelectedUrl={value}
      />
    </div>
  );
};
