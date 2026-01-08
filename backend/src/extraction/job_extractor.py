import os
import re
import json
import time
from dotenv import load_dotenv
from typing import Any, Dict, List, Optional
from google import genai
from google.genai import types

from supabase import create_client

# ------------------ CONFIGURATION ------------------
RAW_DIR = "data/jobs/raw"
PROCESSED_DIR = "data/jobs/entities"

# ------------------ SETUP ------------------
load_dotenv()
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
    except Exception as e:
        client = None
        print(f"⚠️ Failed to initialize Gemini client: {e}")
else:
    client = None
    print("⚠️ GEMINI_API_KEY not set; extraction will be disabled.")


def clean_text(text: str) -> str:
    text = re.sub(r"<.*?>", " ", text)
    text = re.sub(r"[^\x00-\x7F]+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extract_job_entities_gemini(text: str) -> Dict[str, Any]:
    cleaned_text = clean_text(text)

    system_prompt = """
    You are an intelligent information extractor specialized in job descriptions.
    Your task is to extract ONLY what is explicitly mentioned and categorize them into the following JSON structure.
    
    Output JSON Schema:
    {
        "skills": ["List of soft skills, general competencies..."],
        "technical_skills": ["List of technical skills, programming languages, tools..."],
        "qualification": ["List of educational qualifications..."],
        "work_experience": ["List of work experience requirements..."],
        "preferred_skills": ["List of preferred/nice-to-have skills..."]
    }

    Rules:
    - Extract exact text as it appears.
    - Do NOT infer or add anything not stated.
    - If no data for a category, return an empty list [].
    - Output MUST be valid JSON.
    """

    if client is None:
        print("❌ Extraction disabled (no Client).")
        return {}

    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents=system_prompt + "\n\nJOB DESCRIPTION:\n" + cleaned_text,
                config=types.GenerateContentConfig(
                    temperature=0.1,
                    response_mime_type="application/json"
                )
            )
            
            extracted_text = response.text.strip()
            # Clean potential markdown fences if present (though response_mime_type usually handles it)
            if extracted_text.startswith("```json"):
                extracted_text = extracted_text[7:]
            if extracted_text.startswith("```"):
                extracted_text = extracted_text[3:]
            if extracted_text.endswith("```"):
                extracted_text = extracted_text[:-3]

            return json.loads(extracted_text)

        except Exception as e:
            error_str = str(e)
            if "503" in error_str or "overloaded" in error_str.lower():
                wait_time = 2 ** (attempt + 1)
                print(f"⚠️ Model overloaded. Retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                print(f"❌ Gemini Extraction failed: {e}")
                return {}
    
    return {}


def upsert_job_entities(sb, job_id: str, experience_level: str, data: Dict[str, Any]) -> None:
    """
    Upserts the extracted entities into the jobs_entities table.
    """
    payload = {
        "job_id": job_id,
        "experience_level": experience_level,
        "skills": data.get("skills", []),
        "technical_skills": data.get("technical_skills", []),
        "qualification": data.get("qualification", []),
        "work_experience": data.get("work_experience", []),
        "preferred_skills": data.get("preferred_skills", []),
        "updated_at": "now()"
    }
    
    try:
        sb.table("jobs_entities").upsert(payload).execute()
        print(f"✅ Database updated for Job ID: {job_id}")
    except Exception as e:
        print(f"❌ DB Upsert Error for {job_id}: {e}")


def process_single_job(sb, job_id: str, description: str, experience_level: str = None) -> None:
    """
    Processes a single job: extracts entities and upserts to DB.
    """
    if not description or not description.strip():
        print(f"⚠️ Skipping empty description for job {job_id}")
        return

    print(f"🔍 Processing Job ID: {job_id}")
    
    extracted_data = extract_job_entities_gemini(description)
    if not extracted_data:
        print("⚠️ No entities extracted.")
        return
        
    upsert_job_entities(sb, job_id, experience_level, extracted_data)



def process_jobs_from_db() -> None:
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("⚠️ SUPABASE_URL or SUPABASE_KEY not set; skipping job fetch")
        return

    try:
        sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"⚠️ Failed to create Supabase client: {e}")
        return

    # Fetch jobs from 'jobs' table
    try:
        resp = sb.table("jobs").select("id, description, experience_level").execute()
    except Exception as e:
        print(f"⚠️ Supabase query failed: {e}")
        return

    data = resp.data if hasattr(resp, "data") else []
    if not data:
        print("⚠️ No job descriptions returned from Supabase.")
        return

    print(f"found {len(data)} jobs to process.")

    os.makedirs(PROCESSED_DIR, exist_ok=True)

    for row in data:
        job_id = row.get("id")
        desc = row.get("description") or ""
        
        process_single_job(sb, job_id, desc, experience_level)


if __name__ == '__main__':
    print("🧪 Starting job entity extraction (DB -> Gemini -> DB)...\n")
    process_jobs_from_db()
    print("\n🎯 All jobs processed.")

