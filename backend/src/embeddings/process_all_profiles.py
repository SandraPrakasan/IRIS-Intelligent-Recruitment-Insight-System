
import sys
import os
import time

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from supabase_ingest import client, safe_generate_and_store_embeddings

def process_all_profiles():
    print("🔍 Fetching all user IDs from 'profiles' table...")
    
    try:
        # Fetch all profiles (just IDs needed to trigger the function)
        response = client.table("profiles").select("id").execute()
        
        if not response.data:
            print("⚠️ No profiles found in database.")
            return

        profiles = response.data
        total = len(profiles)
        print(f"✅ Found {total} profiles to process.")

        for i, profile in enumerate(profiles):
            user_id = profile['id']
            print(f"\n[{i+1}/{total}] Processing User ID: {user_id}")
            
            # This function now handles:
            # 1. Fetching the full profile data from DB
            # 2. Parsing CSV lists
            # 3. Generating BGE-M3 embeddings
            # 4. Upserting to profile_embeddings
            safe_generate_and_store_embeddings(client, user_id)
            
            # Small delay to be nice to the CPU/API
            # time.sleep(0.1)

        print("\n🎉 Batch processing complete!")

    except Exception as e:
        print(f"❌ Error fetching profiles: {e}")

if __name__ == "__main__":
    process_all_profiles()
