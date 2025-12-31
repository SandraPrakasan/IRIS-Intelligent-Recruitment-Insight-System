import os
import re
from dotenv import load_dotenv
from openai import OpenAI

# ------------------ CONFIGURATION ------------------
RAW_DIR = "data/jobs/raw"
PROCESSED_DIR = "data/jobs/entities"
CATEGORIES = ["Soft_Skills", "Hard_Skills", "Qualification", "Experience", "Preferred_Skills"]

# ------------------ SETUP CLIENT ------------------
load_dotenv()
HF_TOKEN = os.getenv("HF_TOKEN")
if not HF_TOKEN:
    raise ValueError("No HF_TOKEN found in environment variables")

client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=HF_TOKEN,
)

# ------------------ TEXT CLEANING ------------------
def clean_text(text: str) -> str:
    """
    Perform minimal preprocessing:
    - Remove extra spaces and newlines
    - Remove HTML tags or non-printable chars
    - Normalize spaces
    """
    text = re.sub(r"<.*?>", " ", text)  # remove HTML tags
    text = re.sub(r"[^\x00-\x7F]+", " ", text)  # remove non-ASCII
    text = re.sub(r"\s+", " ", text)  # collapse spaces/newlines
    return text.strip()

# ------------------ ENTITY EXTRACTION ------------------
def extract_job_entities(text: str) -> str:
    """
    Use HF GPT model to extract structured entities from job descriptions.
    """
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
-Do not add extra entity categories.
-Strictly follow the format
- Output format must be plain text in this exact format:

Soft_Skills: ["..."]
Required_Skills: ["..."]
Qualification: ["..."]
Experience: ["..."]
Preferred_Skills: ["..."]
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b:fireworks-ai",
        messages=[
            {"role": "system", "content": system_prompt.strip()},
            {"role": "user", "content": cleaned_text},
        ],
        temperature=0.1,
        max_tokens=4000,
    )

    try:
        output = response.choices[0].message.content.strip()
    except Exception:
        output = "❌ Extraction failed."

    return output

# ------------------ PIPELINE ------------------
def process_job_files():
    os.makedirs(PROCESSED_DIR, exist_ok=True)

    for filename in os.listdir(RAW_DIR):
        if not filename.endswith(".txt"):
            continue

        file_path = os.path.join(RAW_DIR, filename)
        out_path = os.path.join(PROCESSED_DIR, filename.replace(".txt", "_entities.txt"))

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()

            if not text.strip():
                print(f"⚠️ Skipping empty file: {filename}")
                continue

            print(f"🔍 Extracting entities from: {filename}")

            extracted = extract_job_entities(text)
             # Filter out lines containing unwanted metadata
            filtered_lines = [
                line for line in extracted.split("\n")
                if not line.lower().startswith(("knowledge cutoff", "current date"))
            ]
            extracted= "\n".join(filtered_lines)

            with open(out_path, "w", encoding="utf-8") as f:
                f.write(extracted + "\n")
                print(extracted)

            print(f"✅ Saved entities -> {out_path}")

        except Exception as e:
            print(f"❌ Error processing {filename}: {e}")

# ------------------ MAIN ------------------
if __name__ == "__main__":
    print("🧪 Starting job preprocessing and entity extraction...\n")
    process_job_files()
    print("\n🎯 All jobs processed successfully.")

