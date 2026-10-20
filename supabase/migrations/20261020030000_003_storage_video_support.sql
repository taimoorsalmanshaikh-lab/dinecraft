-- Migration: 003_storage_video_support
-- Updates storage.buckets 'restaurant-assets' to allow video uploads (mp4, webm, quicktime, ogg)
-- and increases file size limit to 50MB.

UPDATE storage.buckets 
SET 
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'
  ]
WHERE id = 'restaurant-assets';
