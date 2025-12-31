// Script to create Supabase storage buckets if they don't exist
import { supabase } from './src/supabaseClient.js';

async function setupStorageBuckets() {
  try {
    console.log('Setting up storage buckets...');
    
    // Check if buckets exist
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    const bucketNames = buckets.map(bucket => bucket.name);
    console.log('Existing buckets:', bucketNames);
    
    // Create avatars bucket if it doesn't exist
    if (!bucketNames.includes('avatars')) {
      console.log('Creating avatars bucket...');
      const { data: avatarsData, error: avatarsError } = await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 1048576, // 1MB
        allowedMimeTypes: ['image/jpeg', 'image/png']
      });
      
      if (avatarsError) {
        console.error('Error creating avatars bucket:', avatarsError);
      } else {
        console.log('✅ Avatars bucket created successfully');
      }
    } else {
      console.log('✅ Avatars bucket already exists');
    }
    
    // Create resumes bucket if it doesn't exist
    if (!bucketNames.includes('resumes')) {
      console.log('Creating resumes bucket...');
      const { data: resumesData, error: resumesError } = await supabase.storage.createBucket('resumes', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      });
      
      if (resumesError) {
        console.error('Error creating resumes bucket:', resumesError);
      } else {
        console.log('✅ Resumes bucket created successfully');
      }
    } else {
      console.log('✅ Resumes bucket already exists');
    }
    
    console.log('Storage setup complete!');
    
  } catch (error) {
    console.error('Error setting up storage:', error);
  }
}

// Run the setup
setupStorageBuckets();

