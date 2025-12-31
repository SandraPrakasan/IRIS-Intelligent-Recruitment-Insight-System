# api.py
import os
from dotenv import load_dotenv

# Load env BEFORE importing modules that depend on it
load_dotenv()

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from supabase import create_client
from fastapi.middleware.cors import CORSMiddleware
from supabase_ingest import process_resume

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev; restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Supabase Client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
# Use Service Role Key if available to bypass RLS
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_KEY (or SUPABASE_SERVICE_ROLE_KEY) must be set in .env")

client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Define the data we expect from the frontend
class ResumeRequest(BaseModel):
    user_id: str
    file_path: str  # e.g., "user_123/resume.pdf"

@app.post("/process-resume")
async def process_resume_endpoint(request: ResumeRequest):
    print(f"🔔 Signal received: Process resume for {request.user_id}")

    try:
        # Delegate everything to the unified function
        extracted_data = process_resume(client, request.user_id, request.file_path)
        return {"status": "success", "data": extracted_data}

    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ---------------------------------------------------------------------
# WEBHOOK ENDPOINT (Called by Supabase)
# ---------------------------------------------------------------------

from typing import Dict, Any, Optional

class StorageEventRequest(BaseModel):
    type: str
    table: str
    record: Dict[str, Any]
    schema: str
    old_record: Optional[Dict[str, Any]] = None

@app.post("/webhook/storage")
async def storage_webhook(request: StorageEventRequest):
    """
    Handles Database Webhooks from Supabase (storage.objects insert).
    """
    print(f"🔔 Webhook received: {request.type} on {request.table}")

    # We only care about INSERTs or UPDATEs (overwrites) to the 'resume' bucket
    if request.type not in ["INSERT", "UPDATE"] or request.table != "objects":
        return {"status": "ignored"}
    
    # Extract file details from the record
    # Object path example: "user_123/123456_resume.pdf"
    file_path = request.record.get("name")
    bucket_id = request.record.get("bucket_id")
    
    # Check bucket
    if bucket_id != "resume":
        print(f"⚠️ Ignoring upload to bucket: {bucket_id}")
        return {"status": "ignored", "reason": "wrong bucket"}

    # Extract User ID (assuming folder structure: user_id/filename)
    try:
        user_id = file_path.split("/")[0]
    except Exception:
        print(f"❌ Could not extract user_id from {file_path}")
        return {"status": "error", "message": "invalid file path structure"}

    print(f"▶️ Triggering processing for {file_path}")
    
    # Call the processing logic
    try:
        process_resume(client, user_id, file_path)
        return {"status": "success"}
    except Exception as e:
        print(f"❌ Processing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Run with: uvicorn api:app --reload