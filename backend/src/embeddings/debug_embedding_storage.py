
import sys
import os
import time

# Add 'backend' directory to path so we can import 'supabase_ingest' directly
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from supabase_ingest import safe_generate_and_store_embeddings, client

# Mock data
user_id = "test_user_debug_123"
extracted_data = {
    "headline": "Debug Engineer",
    "summary": "This is a test summary for debugging.",
    "skills": "Debug, Python",  # DB stores as string
    "technical_skills": "SQL, Vector DB", # DB stores as string
    "certifications": "",
    "languages": "English" # DB stores as string
}

print(f"DEBUG: Testing embedding storage for User ID: {user_id}")

# 1. Ensure user exists in profiles first (FK constraint)
try:
    print("DEBUG: Ensuring profile exists...")
    # UPSERT the mock data into the profiles table so the function can fetch it
    profile_payload = {
        "id": user_id,
        "full_name": "Debug User",
        "email": "debug@example.com",
        "updated_at": "now()",
        # Add the fields we expect to be there
        "headline": extracted_data["headline"],
        "summary": extracted_data["summary"],
        "skills": extracted_data["skills"],
        "technical_skills": extracted_data["technical_skills"],
        "certifications": extracted_data["certifications"],
        "languages": extracted_data["languages"]
    }
    client.table("profiles").upsert(profile_payload).execute()
    print("DEBUG: Profile upserted.")
except Exception as e:
    print(f"❌ Failed to create test profile: {e}")
    sys.exit(1)

# 2. Run the function
print("DEBUG: Running safe_generate_and_store_embeddings...")
# Now it fetches from DB internally, so we don't pass extracted_data
safe_generate_and_store_embeddings(client, user_id)

# 3. Check if it exists
try:
    print("DEBUG: Verifying storage...")
    resp = client.table("profile_embeddings").select("*").eq("id", user_id).execute()
    if resp.data:
        print("✅ SUCCESS: Embedding record found!")
        print(f"Data keys: {resp.data[0].keys()}")
    else:
        print("❌ FAILURE: No record found in profile_embeddings.")
except Exception as e:
    print(f"❌ Verification failed: {e}")
