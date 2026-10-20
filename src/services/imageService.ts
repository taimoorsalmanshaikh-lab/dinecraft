/**
 * Image and media service adapter.
 * Re-exports from mediaService for complete backward compatibility.
 */
export {
  compressImage,
  uploadImageFile,
  uploadMediaFile,
  validateMediaFile,
} from './mediaService';
export type { UploadProgressCallback, UploadResult } from './mediaService';
