from src.ingestion.parser import parse_file
import json
from dotenv import load_dotenv
from pathlib import Path
import os
from google import genai
import google.genai.types as types 
import time

# Load env
load_dotenv()


client=genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

BASE_DIR = Path(__file__).resolve().parents[2]
RAW_DIR = BASE_DIR / "data" / "resumes" / "raw"


SYSTEM_PROMPT = """
You are a precise resume entity extraction engine.

TASK:
Extract ONLY the information explicitly present in the resume text.

OUTPUT RULES:
- Output MUST be valid JSON
- Do NOT hallucinate. If a field is missing, use null.
-Include empty lists for missing array fields.
-Include all fields in the output, even if null or empty.
-Include only the fields specified in the schema below.
- Do NOT include any explanations, notes, or extra text outside the JSON.
- Ensure the JSON is properly formatted and parsable.
- Return "work_experience" as a LIST of objects with fields: role, company, year, duration, description.
- Calculate "duration" (e.g. "2 years", "6 months") from dates if not explicitly stated.
- Return "education" as a LIST of objects with fields: course, institution, year.
- For "skills", "technical_skills", "certifications", and "languages", return LISTS of strings.
- **CRITICAL**: "languages" refers ONLY to human spoken/written languages (e.g., English, Hindi, Spanish). Programming languages (Python, Java, etc.) MUST go into "technical_skills".
- For single-value fields like "role", "headline", "summary" and return STRING or null.
-Calculate experience_years as an INTEGER representing total years of experience, or null if not derivable.
-only use the field names and structure defined in the schema below.
-strictLY follow the JSON schema provided.

JSON SCHEMA:
{
  "headline": string | null,
  "summary": string | null,
  "skills": string[],
  "technical_skills": string[],  <-- Put Programming Languages HERE
  "education": [
    {
      "course": string | null,
      "institution": string | null,
      "year": string | null
    }
  ],
  "work_experience": [
    {
      "role": string | null,
      "company": string | null,
      "years": string | null,
      "duration": string | null,
      "description": string | null
    }
  ],
  "projects": [
    {
      "title": "string | null",
      "technologies_used": ["string"],
      "description": string | null
    }
  ],
  "projects": [
    {
      "title": "string | null",
      "technologies_used": ["string"],
      "description": "string | null"
    }
  ],
  "certifications": string[],
  "languages": string[],
  "experience_years": integer | null
}
"current_position": string | null,
"""


def extract_resume_entities_gemini(text: str) -> dict:
    max_retries = 3
    
    for attempt in range(max_retries):
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=SYSTEM_PROMPT + "\n\nRESUME TEXT:\n" + text,
            config=types.GenerateContentConfig(
                temperature=0,
                # 2. CRITICAL: This forces Gemini to return raw JSON without Markdown formatting
                response_mime_type="application/json" 
            )
        )

        try:
            # 3. Clean the response just in case (removes accidental backticks)
            cleaned_text = response.text.strip()
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]
            if cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]
                
            return json.loads(cleaned_text)
        
        except Exception as e:
                # Check if it's the "Overloaded" (503) error
                error_str = str(e)
                if "503" in error_str or "overloaded" in error_str.lower():
                    wait_time = 2 ** (attempt + 1) # Exponential backoff: 2s, 4s, 8s...
                    print(f"⚠️ Model overloaded. Retrying in {wait_time} seconds... (Attempt {attempt+1}/{max_retries})")
                    time.sleep(wait_time)
                else:
                    # If it's a different error (like Auth), fail immediately
                    print(f"❌ Gemini Error: {e}")
                    return {}
                
        except json.JSONDecodeError:
            print(f"❌ JSON Decode Error. Raw response was: {response.text}")
            raise ValueError("Gemini returned invalid JSON")
        except Exception as e:
            # Catch model overload or safety filter blocks
            print(f"❌ Gemini Error: {e}")
            return {}


def process_raw_resumes():
    if not RAW_DIR.exists():
        raise FileNotFoundError(f"Directory not found: {RAW_DIR}")

    for file_path in RAW_DIR.iterdir():
        if file_path.suffix.lower() not in [".pdf", ".docx", ".txt"]:
            continue

        print(f"\n📄 Processing: {file_path.name}")

        try:
            text = parse_file(str(file_path))
            entities = extract_resume_entities_gemini(text)

            print("✅ Extracted entities:")
            print(entities)

        except Exception as e:
            print(f"❌ Failed for {file_path.name}: {e}")

from src.extraction.fallback_extractor import extract_fallback
from src.preprocess.regex_pii import extract_contact_info_regex, mask_contact_info_regex
from src.preprocess.anonymizer import extract_name_and_mask

def process_single_resume(file_path: str) -> dict:
    """
    Helper function for supabase_ingest.py to process a single downloaded file.
    """
    text = ""
    pii_data = {}
    
    try:
        # 1. Convert file path to string just in case
        path_str = str(file_path)
        
        # 2. Parse the text from the file (PDF/DOCX)
        raw_text = parse_file(path_str)
        
        # 3a. Privacy Step 1: Extract and Mask Contact Info (Regex)
        print("🔒 [1/2] Masking Phone/Email/Links...")
        pii_contact = extract_contact_info_regex(raw_text)
        masked_text_v1 = mask_contact_info_regex(raw_text)
        
        # 3b. Privacy Step 2: Extract and Mask Candidate Name (NER)
        print("🔒 [2/2] Masking Names (NER)...")
        ner_result = extract_name_and_mask(masked_text_v1)
        final_masked_text = ner_result["masked_text"]
        candidate_name = ner_result["candidate_name"]
        
        # Merge PII Data
        pii_data = pii_contact
        pii_data["full_name"] = candidate_name 
        
        # Store masked text for error handling usage
        text = final_masked_text 
        print(f"DEBUG: Final Masked Text Length: {len(text)}")
        if len(text) < 50:
            print("⚠️ WARNING: Masked text is suspiciously short!")

        # 4. Send FINAL MASKED text to Gemini
        print("🧠 Sending to Gemini...")
        extracted = extract_resume_entities_gemini(final_masked_text)
        
        # 5. Fallback if Gemini failed
        if not extracted:
            print("⚠️ Gemini returned empty. Using Regex Fallback.")
            extracted = extract_fallback(final_masked_text)
            
        # 6. Merge PII back into results (whether from Gemini or Fallback)
        extracted.update(pii_data)
        
        return extracted
        
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        # Final Fallback attempt
        if text:
            print("⚠️ Exception occurred. Using Regex Fallback on masked text.")
            fallback_data = extract_fallback(text)
            fallback_data.update(pii_data) 
            return fallback_data
        return pii_data
    

if __name__ == "__main__":
    process_raw_resumes()
