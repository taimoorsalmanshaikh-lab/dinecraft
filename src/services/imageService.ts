/**
 * Supabase Storage + Client-Side Image Service
 *
 * Compresses images client-side via HTML5 Canvas before uploading
 * to Supabase Storage bucket 'restaurant-assets'.
 * Returns the permanent public CDN URL.
 */
import { supabase } from '../lib/supabase';

export async function compressImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Try WebP first, fallback to JPEG
        let dataUrl = canvas.toDataURL('image/webp', quality);
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

function dataURLtoBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Uploads an image to Supabase Storage bucket 'restaurant-assets'
 * and returns the public URL.
 */
export async function uploadImageFile(
  file: File,
  storagePath?: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  if (onProgress) onProgress(20);

  // 1. Client-side compression
  const compressedDataUrl = await compressImage(file, 1400, 1400, 0.85);
  if (onProgress) onProgress(50);

  try {
    const blob = dataURLtoBlob(compressedDataUrl);
    const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = storagePath || `uploads/${Date.now()}_${cleanFileName}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('restaurant-assets')
      .upload(path, blob, {
        contentType: blob.type,
        upsert: true,
      });

    if (uploadError) {
      console.warn('[Supabase Storage] Upload error, falling back to data URL:', uploadError);
      if (onProgress) onProgress(100);
      return compressedDataUrl;
    }

    const { data: publicUrlData } = supabase.storage
      .from('restaurant-assets')
      .getPublicUrl(path);

    if (onProgress) onProgress(100);
    return publicUrlData.publicUrl || compressedDataUrl;
  } catch (err) {
    console.warn('[Supabase Storage] Exception during upload, fallback to data URL:', err);
    if (onProgress) onProgress(100);
    return compressedDataUrl;
  }
}
