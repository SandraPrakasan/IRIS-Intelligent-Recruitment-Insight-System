import os
import json
import csv
from dotenv import load_dotenv
from openai import OpenAI
from datasets import load_dataset
from src.preprocess.anonymizer import remove_pii
from src.preprocess.cleaner import clean_text

# ================== ENV + CLIENT ==================
load_dotenv()
HF_TOKEN = os.getenv("HF_TOKEN")
if not HF_TOKEN:
    raise ValueError("HF_TOKEN not found in environment variables")

client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=HF_TOKEN,
)

# ================== CONSTANTS ==================
CATEGORIES = [
    "Hard_Skills",
    "Soft_Skills",
    "Experience",
    "Education",
    "Certifications",
    "Projects",
]

LABEL_MAP = {
    "No fit": "<0.6",
    "Potential fit": ">=0.6",
    "Good fit": ">=0.8",
}

OUTPUT_CSV = "resume_job_entities.csv"
PROGRESS_FILE = "progress.json"

# ================== ENTITY EXTRACTION ==================
def extract_resume_information_as_json(text: str) -> str:
    cleaned_text = clean_text(remove_pii(text))

    system_prompt = (
        """You are a precise resume entity extractor.

Your ONLY task is to extract EVERY piece of information EXPLICITLY mentioned in the resume text
and return it in a STRICT JSON format.

Rules (MANDATORY):
- Extract ONLY what is EXPLICITLY stated in the text.
- Do NOT infer, assume, normalize, or enrich information.
- Preserve exact wording as it appears in the resume.
- Include repeated items multiple times.
- Do NOT merge similar items.
- Do NOT add new categories.
- Do NOT omit any explicitly mentioned information.
- Output MUST be valid JSON.
- Output MUST contain ALL categories, even if empty.
- If no information exists for a category, return an empty list [].
- The JSON must NOT contain comments, explanations, markdown, or extra text.

Categories (EXACT KEYS — case-sensitive):
[
  "Hard_Skills",
  "Soft_Skills",
  "Experience",
  "Education",
  "Certifications",
  "Projects"
]

Category-specific rules:

Hard_Skills:
- Extract programming languages, tools, frameworks, libraries, databases, platforms, technologies.

Soft_Skills:
- Extract interpersonal, behavioral, or professional skills ONLY if explicitly mentioned.

Experience:
- Extract job roles, titles, responsibilities, durations, and work descriptions exactly as written.
- Do NOT calculate years of experience.
- Do NOT infer seniority.

Education:
- IGNORE names of colleges, schools, universities, institutions, or companies.
- EXTRACT ONLY:
  - course names
  - degree names
  - program names
  - specializations
  - qualifications
- Extract ONLY the END or COMPLETION year if a year is mentioned.
- If a range is written (e.g., "2020–2024", "2019 to 2023"), extract ONLY the LAST year.
- If a single year is mentioned, treat it as the completion year.
- Do NOT extract start years.
- Do NOT infer missing years.

Certifications:
- Extract certification names exactly as written.
- Include issuing organization ONLY if explicitly mentioned.

Projects (IMPORTANT):
- IGNORE project names, titles, or ideas unless a skill/technology is explicitly tied to them.
- EXTRACT ONLY:
  - skills
  - tools
  - technologies
  - frameworks
  - programming languages
  explicitly stated as USED in the project.
- Do NOT infer skills based on project description.
- Do NOT extract project outcomes, ideas, or domains unless a tool/skill is named.

Output Format (STRICT):
Return ONLY a single JSON object with the exact keys listed above.

Example Resume text= "John Smith is a Senior Software Engineer with 5 years of experience at Google.
Skills: Python, JavaScript, React, Node.js.
Bachelor of Technology in Computer Science, 2018.
Certified AWS Solutions Architect.
Built an e-commerce platform using React, Node.js, and MongoDB.
"
Example Output={
  "Hard_Skills": [
    "Python",
    "JavaScript",
    "React",
    "Node.js",
    "MongoDB"
  ],
  "Soft_Skills": [],
  "Experience": [
    "Senior Software Engineer with 5 years of experience at Google"
  ],
  "Education": [
    "Bachelor of Technology in Computer Science, 2018"
  ],
  "Certifications": [
    "AWS Solutions Architect"
  ],
  "Projects": [
    "React",
    "Node.js",
    "MongoDB"
  ]
}
"""
    )

    user_prompt = (
        f"Resume text:\n{cleaned_text}\n"
        "Return output in EXACTLY the specified JSON format with all categories."
    )

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b:fireworks-ai",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.1,
        max_tokens=7000,
    )

    return response.choices[0].message.content.strip()

# ================== PROGRESS HANDLING ==================
def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, "r", encoding="utf-8") as f:
            return json.load(f).get("last_index", 0)
    return 0

def save_progress(index):
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump({"last_index": index}, f)

# ================== MAIN PROCESS ==================
def main():
    print("📥 Loading Hugging Face dataset...")
    ds = load_dataset("cnamuangtoun/resume-job-description-fit")
    dataset = ds["train"]

    start_index = load_progress()
    total_rows = len(dataset)

    print(f"📊 Total rows: {total_rows}")
    print(f"▶️ Resuming from row index: {start_index}")

    file_exists = os.path.exists(OUTPUT_CSV)

    with open(OUTPUT_CSV, "a", newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(
            csvfile,
            fieldnames=["resume_entities", "job_entities", "label"],
        )

        if not file_exists:
            writer.writeheader()

        for i in range(start_index, total_rows):
            example = dataset[i]

            try:
                resume_entities = extract_resume_information_as_json(
                    example["resume_text"]
                )
                job_entities = extract_resume_information_as_json(
                    example["job_description_text"]
                )

                writer.writerow({
                    "resume_entities": resume_entities,
                    "job_entities": job_entities,
                    "label": LABEL_MAP.get(example["label"], example["label"]),
                })

                save_progress(i + 1)
                print(f"✅ Processed row {i + 1}/{total_rows}")

            except Exception as e:
                print(f"❌ Error at row {i}: {e}")
                print("⛔ Stopping. Rerun script to resume.")
                return

    print("🎉 Completed all rows successfully.")

# ================== ENTRY ==================
if __name__ == "__main__":
    main()
