"""
supabase_ingest.py

- Recursively downloads resumes from Supabase Storage
- Extractor: Uses Google Gemini (via src.preprocess.person_details_extraction_gemini)
- Database: Maps JSON to 'profiles' table columns
- Updates: Uses User ID (id) as the unique key to prevent errors
"""

from __future__ import annotations

import argparse
import os
import hashlib
from typing import List, Dict, Any

from dotenv import load_dotenv
from supabase import create_client

# ✅ CORRECT IMPORT based on your file structure
from src.extraction.person_details_extraction_gemini import process_single_resume

# ---------------------------------------------------------------------
# ENV SETUP
# ---------------------------------------------------------------------

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set in .env")

if not SUPABASE_URL.endswith("/"):
    SUPABASE_URL += "/"

client = create_client(SUPABASE_URL, SUPABASE_KEY)

ALLOWED_EXTENSIONS = {".pdf", ".docx"}

# ---------------------------------------------------------------------
# UTILS
# ---------------------------------------------------------------------

def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)

def compute_file_hash(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()

def extract_user_id(object_path: str) -> str:
    # Assumes folder structure: user_id/filename.pdf
    return object_path.split("/", 1)[0]

# ---------------------------------------------------------------------
# SUPABASE STORAGE HELPERS
# ---------------------------------------------------------------------

def list_all_objects(client, bucket: str, prefix: str = "") -> List[str]:
    storage = client.storage.from_(bucket)
    results = []
    resp = storage.list(prefix) or []

    for item in resp:
        name = item.get("name")
        if not name:
            continue
        
        full_path = f"{prefix}/{name}".strip("/")
        
        # If it has 'id', it's a file. If not, it's a folder.
        if item.get("id") and item.get("metadata"):
            results.append(full_path)
        else:
            results.extend(list_all_objects(client, bucket, full_path))
            
    return results

def download_object(client, bucket: str, object_path: str, dest_root: str) -> str:
    storage = client.storage.from_(bucket)
    data = storage.download(object_path)

    local_path = os.path.join(dest_root, object_path.replace("/", os.sep))
    os.makedirs(os.path.dirname(local_path), exist_ok=True)

    with open(local_path, "wb") as f:
        f.write(data)

    return local_path

# ---------------------------------------------------------------------
# DATABASE & MAPPING HELPERS (The Logic Core)
# ---------------------------------------------------------------------

def is_resume_processed(client, user_id: str, file_hash: str) -> bool:
    """
    Checks if this specific user already has a processed resume with this hash.
    """
    resp = (
        client.table("profiles")
        .select("id")
        .eq("id", user_id)
        .eq("file_hash", file_hash)
        .eq("processed", True)
        .execute()
    )
    return bool(resp.data)

def build_resume_payload(user_id: str, extracted: Dict[str, Any], resume_path: str, file_hash: str) -> Dict[str, Any]:
    """
    Translates Gemini JSON keys to Supabase 'profiles' table columns.
    """
    # 1. Base Payload
    payload = {
        "id": user_id,
        "resume_url": resume_path,
        "file_hash": file_hash,
        "processed": True,
        "updated_at": "now()",
    }

    # 2. Mapping Dictionary (Gemini JSON Key -> DB Column Name)
    FIELD_MAP = {
        # Identity
        "role":             "role",
        "headline":         "headline",
        "summary":          "summary",
        
        
        # Contact & Socials (Crucial Mismatches Fixed Here)
       
         # Gemini: 'linkedin_url' -> DB: 'linkedin'
           # Gemini: 'github_url'   -> DB: 'github'
        "portfolio":        "portfolio",
        
        # Arrays & JSONB
        "skills":           "skills",
        "technical_skills": "technical_skills",
        "education":        "education",
        "current_position": "current_position",
        # Experience
        "experience":       "work_experience", # Gemini: 'experience' -> DB: 'work_experience'
        "experience_years": "experience_years",
        
        # Extra
        "certifications":   "certifications",
        "languages":        "languages",
    }

    # 3. Dynamic Mapping
    for json_key, db_col in FIELD_MAP.items():
        val = extracted.get(json_key)
        # Only update if value is meaningful (not None or empty)
        if val not in (None, "", [], {}):
            payload[db_col] = val

    return payload

def upsert_profile(client, payload: Dict[str, Any]):
    """
    Updates the profile for the user using 'id' as the key.
    """
    try:
        # ✅ FIX: on_conflict='id' ensures we update the specific User row
        # instead of failing on duplicate file_hashes.
        client.table("profiles").upsert(
            payload, 
            on_conflict="id"
        ).execute()
        print(f"✅ Database updated for User ID: {payload['id']}")
        
    except Exception as e:
        print(f"❌ DB Upsert Error for {payload['id']}: {e}")

# ---------------------------------------------------------------------
# MAIN PIPELINE
# ---------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--bucket", default="resume")
    parser.add_argument("--prefix", default="")
    parser.add_argument("--dest", default="data/resumes/raw")
    args = parser.parse_args()

    ensure_dir(args.dest)

    print(f"🔍 Scanning bucket '{args.bucket}'...")
    objects = list_all_objects(client, args.bucket, args.prefix)

    if not objects:
        print("⚠️ No resumes found in Supabase storage.")
        return

    print(f"found {len(objects)} files.")

    for obj in objects:
        # 1. Filter Extensions
        if os.path.splitext(obj)[1].lower() not in ALLOWED_EXTENSIONS:
            continue

        user_id = extract_user_id(obj)

        print(f"\n⬇️ Processing User: {user_id} | File: {obj}")
        
        # 2. Download
        local_path = download_object(client, args.bucket, obj, args.dest)
        
        # 3. Hash Check (Save Money)
        current_hash = compute_file_hash(local_path)
        
        if is_resume_processed(client, user_id, current_hash):
            print("   ⏭️ Skipped: Resume already processed and unchanged.")
            continue

        # 4. Extract (Gemini)
        print("   🧠 Sending to Gemini for extraction...")
        try:
            # ✅ CALLING THE HELPER FUNCTION CORRECTLY
            extracted_data = process_single_resume(local_path)
            print(extracted_data)
            
            if not extracted_data:
                print("   ⚠️ Gemini returned no data. Skipping DB update.")
                continue

            # 5. Build Payload (Map Keys)
            payload = build_resume_payload(user_id, extracted_data, obj, current_hash)
            
            # 6. Upsert to DB
            upsert_profile(client, payload)

        except Exception as e:
            print(f"   ❌ Pipeline failed for this file: {e}")

if __name__ == "__main__":
    main()