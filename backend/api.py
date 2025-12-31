# api.py
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client

# Import your existing extraction logic
from src.extraction.person_details_extraction_gemini import process_single_resume
from supabase_ingest import upsert_profile, build_resume_payload, download_object, compute_file_hash

load_dotenv()

app = FastAPI()

# Setup Supabase Client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Define the data we expect from the frontend
class ResumeRequest(BaseModel):
    user_id: str
    file_path: str  # e.g., "user_123/resume.pdf"

@app.post("/process-resume")
async def process_resume_endpoint(request: ResumeRequest):
    print(f"🔔 Signal received: Process resume for {request.user_id}")

    try:
        # 1. Define local temp path
        temp_dir = "data/resumes/raw"
        local_path = f"{temp_dir}/{request.file_path}"
        
        # 2. Download the file from Supabase Storage
        # (Reusing your existing download function)
        print(f"⬇️ Downloading {request.file_path}...")
        downloaded_path = download_object(client, "resume", request.file_path, temp_dir)

        # 3. Process with Gemini
        print("🧠 Sending to Gemini...")
        extracted_data = process_single_resume(downloaded_path)

        if not extracted_data:
            raise HTTPException(status_code=500, detail="Gemini returned empty data")

        # 4. Calculate hash (for your existing logic)
        file_hash = compute_file_hash(downloaded_path)

        # 5. Save to Database
        payload = build_resume_payload(request.user_id, extracted_data, request.file_path, file_hash)
        upsert_profile(client, payload)

        # 6. Cleanup (Optional: remove temp file)
        if os.path.exists(downloaded_path):
            os.remove(downloaded_path)

        return {"status": "success", "data": extracted_data}

    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Run with: uvicorn api:app --reload