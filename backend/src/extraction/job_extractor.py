import os
import re
from dotenv import load_dotenv
from openai import OpenAI
from typing import Any, Dict, List, Optional

from supabase import create_client

from src.preprocess.job_preprocess import preprocess_jobs

# ------------------ CONFIGURATION ------------------
RAW_DIR = "data/jobs/raw"
PROCESSED_DIR = "data/jobs/entities"
CATEGORIES = ["Soft_Skills", "Hard_Skills", "Qualification", "Experience", "Preferred_Skills"]

# ------------------ SETUP ------------------
load_dotenv()
HF_TOKEN = os.getenv("HF_TOKEN")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if HF_TOKEN:
    try:
        client = OpenAI(base_url="https://router.huggingface.co/v1", api_key=HF_TOKEN)
    except Exception as e:
        client = None
        print(f"⚠️ Failed to initialize OpenAI client: {e}")
else:
    client = None
    print("⚠️ HF_TOKEN not set; extraction via HF client will be disabled.")


def fetch_and_process_job_descriptions(raw_dir: str = RAW_DIR, out_dir: str = "data/jobs/preprocessed") -> None:
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("⚠️ SUPABASE_URL or SUPABASE_KEY not set; skipping job fetch")
        return

    try:
        sb = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"⚠️ Failed to create Supabase client: {e}")
        return

    try:
        resp = sb.table("jobs").select("id,description").execute()
    except Exception as e:
        print(f"⚠️ Supabase query failed: {e}")
        return

    data: Optional[List[Dict[str, Any]]] = None
    error = None
    try:
        if isinstance(resp, dict):
            data = resp.get("data")
            error = resp.get("error") or resp.get("message")
        else:
            data = getattr(resp, "data", None)
            error = getattr(resp, "error", None)
    except Exception as e:
        print(f"⚠️ Unexpected Supabase response shape: {e}")
        return

    if error:
        print(f"⚠️ Supabase returned an error: {error}")
        return

    if not data:
        print("⚠️ No job descriptions returned from Supabase.")
        return

    try:
        os.makedirs(raw_dir, exist_ok=True)
    except Exception as e:
        print(f"⚠️ Failed to create raw dir {raw_dir}: {e}")
        return

    for row in data:
        if not isinstance(row, dict):
            continue
        desc = row.get("description") or ""
        if not desc.strip():
            continue
        job_id = row.get("id") or row.get("job_id") or "unknown"
        safe_id = str(job_id).replace(os.path.sep, "_")
        fname = os.path.join(raw_dir, f"job_{safe_id}.txt")
        try:
            with open(fname, "w", encoding="utf-8") as f:
                f.write(desc)
            print(f"Downloaded job {job_id} -> {fname}")
        except OSError as e:
            print(f"⚠️ Failed to write {fname}: {e}")
            continue

    try:
        preprocess_jobs(raw_dir, out_dir)
    except Exception as e:
        print(f"⚠️ Preprocessing failed: {e}")


def clean_text(text: str) -> str:
    text = re.sub(r"<.*?>", " ", text)
    text = re.sub(r"[^\x00-\x7F]+", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extract_job_entities(text: str) -> str:
    cleaned_text = clean_text(text)

    system_prompt = f"""
You are an intelligent information extractor specialized in job descriptions.
Your task is to extract ONLY what is explicitly mentioned and categorize them under:
{CATEGORIES}

Rules:
- Extract exact text as it appears.
- Do NOT infer or add anything not stated.
- Each category must be a Python list of strings.
- If no data for a category, return an empty list [].
- Do not add extra entity categories.
- Output format must be plain text in this exact format:

Soft_Skills: ["..."]
Hard_Skills: ["..."]
Qualification: ["..."]
Experience: ["..."]
Preferred_Skills: ["..."]
"""

    if client is None:
        return "❌ Extraction disabled (no HF_TOKEN or client init failed)."

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b:fireworks-ai",
            messages=[
                {"role": "system", "content": system_prompt.strip()},
                {"role": "user", "content": cleaned_text},
            ],
            temperature=0.1,
            max_tokens=4000,
        )

        output = response.choices[0].message.content.strip()
    except Exception as e:
        output = f"❌ Extraction failed: {e}"

    return output


def process_job_files(raw_dir: str = RAW_DIR, processed_dir: str = PROCESSED_DIR) -> None:
    try:
        os.makedirs(processed_dir, exist_ok=True)
    except Exception as e:
        print(f"⚠️ Could not create processed dir {processed_dir}: {e}")
        return

    try:
        files = [f for f in os.listdir(raw_dir) if f.endswith('.txt')]
    except FileNotFoundError:
        print(f"⚠️ Raw dir {raw_dir} does not exist. Nothing to process.")
        return

    for filename in files:
        file_path = os.path.join(raw_dir, filename)
        out_path = os.path.join(processed_dir, filename.replace('.txt', '_entities.txt'))

        try:
            # skip already-extracted files
            if os.path.exists(out_path) and os.path.getsize(out_path) > 0:
                print(f"Skipping already extracted: {out_path}")
                continue
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()

            if not text.strip():
                print(f"⚠️ Skipping empty file: {filename}")
                continue

            print(f"🔍 Extracting entities from: {filename}")
            extracted = extract_job_entities(text)

            filtered_lines = [
                line for line in extracted.split('\n')
                if not line.lower().startswith(("knowledge cutoff", "current date"))
            ]
            extracted = "\n".join(filtered_lines)

            with open(out_path, 'w', encoding='utf-8') as f:
                f.write(extracted + '\n')

            print(f"✅ Saved entities -> {out_path}")

        except Exception as e:
            print(f"❌ Error processing {filename}: {e}")


if __name__ == '__main__':
    print("🧪 Starting job preprocessing and entity extraction...\n")
    # Optionally fetch jobs from Supabase before processing files
    try:
        fetch_and_process_job_descriptions()
    except Exception as e:
        print(f"⚠️ fetch_and_process_job_descriptions failed: {e}")

    process_job_files()
    print("\n🎯 All jobs processed (where possible).")

