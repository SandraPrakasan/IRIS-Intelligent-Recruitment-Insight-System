-- Check what storage buckets exist in your project
SELECT id, name, public, file_size_limit, allowed_mime_types, created_at 
FROM storage.buckets 
ORDER BY created_at;

