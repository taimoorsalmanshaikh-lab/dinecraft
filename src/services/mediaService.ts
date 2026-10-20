/**
 * Supabase Storage Media Service (Images & Videos)
 *
 * Handles file validation, client-side image compression,
 * direct video streaming to Supabase Storage bucket 'restaurant-assets',
 * and returns durable public CDN URLs.
 */
import { supabase } from '../lib/supabase';

export interface UploadProgressCallback {
  (progress: number, statusText: string): void;
}

export interface UploadResult {
  url: string;
  type: 'image' | 'video';
  name: string;
  size: string;
}

export async function compressImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
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
 * Validates media file type and file size.
 */
export function validateMediaFile(file: File): { valid: boolean; error?: string; type: 'image' | 'video' } {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type || 'unknown'}. Please upload an image (PNG, JPG, WebP) or video (MP4, WebM, QuickTime).`,
      type: 'image',
    };
  }

  const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

  if (isImage && file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Image file too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max image size is 15MB.`,
      type: 'image',
    };
  }

  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    return {
      valid: false,
      error: `Video file too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max video size is 50MB.`,
      type: 'video',
    };
  }

  return {
    valid: true,
    type: isVideo ? 'video' : 'image',
  };
}

/**
 * Uploads an image or video file to Supabase Storage 'restaurant-assets'
 * and returns the permanent CDN URL.
 */
export async function uploadMediaFile(
  file: File,
  restaurantId: string,
  onProgress?: UploadProgressCallback
): Promise<UploadResult> {
  const validation = validateMediaFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid media file');
  }

  const isVideo = validation.type === 'video';
  const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
  const cleanBaseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const timestamp = Date.now();
  const safeResto = restaurantId.replace(/[^a-zA-Z0-9_-]/g, '_');

  if (onProgress) onProgress(15, isVideo ? 'Preparing video file...' : 'Optimizing image resolution...');

  let uploadBody: Blob | File = file;
  let ext = file.name.split('.').pop()?.toLowerCase() || (isVideo ? 'mp4' : 'jpg');
  let contentType = file.type;

  if (!isVideo) {
    try {
      if (onProgress) onProgress(35, 'Compressing image...');
      const compressedDataUrl = await compressImage(file, 1600, 1600, 0.85);
      uploadBody = dataURLtoBlob(compressedDataUrl);
      ext = uploadBody.type === 'image/webp' ? 'webp' : 'jpg';
      contentType = uploadBody.type;
    } catch (e) {
      console.warn('Canvas compression skipped, uploading original image:', e);
      uploadBody = file;
    }
  }

  const storagePath = `${safeResto}/${timestamp}_${cleanBaseName}.${ext}`;

  if (onProgress) onProgress(60, isVideo ? 'Uploading video to secure storage...' : 'Uploading image to media library...');

  const { error: uploadError } = await supabase.storage
    .from('restaurant-assets')
    .upload(storagePath, uploadBody, {
      contentType,
      upsert: true,
    });

  if (uploadError) {
    console.error('[Supabase Storage] Upload error:', uploadError);
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  if (onProgress) onProgress(90, 'Finalizing durable CDN reference...');

  const { data: publicUrlData } = supabase.storage
    .from('restaurant-assets')
    .getPublicUrl(storagePath);

  const publicUrl = publicUrlData?.publicUrl;
  if (!publicUrl) {
    throw new Error('Failed to resolve public URL for uploaded media.');
  }

  if (onProgress) onProgress(100, 'Upload complete!');

  return {
    url: publicUrl,
    type: isVideo ? 'video' : 'image',
    name: file.name.replace(/\.[^/.]+$/, ''),
    size: fileSizeMb,
  };
}

/**
 * Backward compatibility with imageService
 */
export async function uploadImageFile(
  file: File,
  storagePath?: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const result = await uploadMediaFile(file, 'general', (p) => {
    if (onProgress) onProgress(p);
  });
  return result.url;
}
