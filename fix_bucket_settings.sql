-- Check current bucket settings
SELECT id, name, public, file_size_limit, allowed_mime_types, created_at 
FROM storage.buckets 
WHERE name IN ('avatars', 'resume')
ORDER BY name;

-- Update avatars bucket to be public and set proper limits
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 1048576, -- 1MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/jpg']
WHERE name = 'avatars';

-- Update resume bucket to be public and set proper limits  
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 5242880, -- 5MB
  allowed_mime_types = ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
WHERE name = 'resume';

-- Check if RLS policies exist for avatars bucket
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND policyname LIKE '%avatar%';

-- Create RLS policies for avatars bucket if they don't exist
DO $$
BEGIN
    -- Check if policy exists, if not create it
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can upload their own avatar'
    ) THEN
        CREATE POLICY "Users can upload their own avatar" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can update their own avatar'
    ) THEN
        CREATE POLICY "Users can update their own avatar" ON storage.objects
        FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can delete their own avatar'
    ) THEN
        CREATE POLICY "Users can delete their own avatar" ON storage.objects
        FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Avatar images are publicly accessible'
    ) THEN
        CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
        FOR SELECT USING (bucket_id = 'avatars');
    END IF;
END $$;

-- Create RLS policies for resume bucket if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can upload their own resume'
    ) THEN
        CREATE POLICY "Users can upload their own resume" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'resume' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can update their own resume'
    ) THEN
        CREATE POLICY "Users can update their own resume" ON storage.objects
        FOR UPDATE USING (bucket_id = 'resume' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can delete their own resume'
    ) THEN
        CREATE POLICY "Users can delete their own resume" ON storage.objects
        FOR DELETE USING (bucket_id = 'resume' AND auth.uid()::text = (storage.foldername(name))[1]);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Resume files are publicly accessible'
    ) THEN
        CREATE POLICY "Resume files are publicly accessible" ON storage.objects
        FOR SELECT USING (bucket_id = 'resume');
    END IF;
END $$;

-- Final check of bucket settings
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE name IN ('avatars', 'resume')
ORDER BY name;
