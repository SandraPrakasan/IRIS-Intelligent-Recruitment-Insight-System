import os
from openai import OpenAI
from dotenv import load_dotenv
from src.preprocess.anonymizer import remove_pii
from src.preprocess.cleaner import clean_text

# ------------------ HF OpenAI-Compatible Client ------------------
load_dotenv()
HF_TOKEN = os.getenv("HF_TOKEN")
if not HF_TOKEN:
    raise ValueError("No HF_TOKEN found in environment variables")

client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=HF_TOKEN,
)

CATEGORIES = ["Hard_Skills", "Soft_Skills", "Experience", "Education", "Certifications", "Projects"]

# ------------------ Resume Extraction ------------------
def extract_resume_information_as_lists(text: str) -> str:
    cleaned_text = clean_text(remove_pii(text))

    system_prompt = (
    "You are a precise resume entity extractor. "
    "Your ONLY task is to extract EVERY piece of information EXPLICITLY mentioned "
    "in the resume text and return it categorized by section.\n\n"
    "Rules:\n"
    "- Extract ONLY what is EXPLICITLY stated in the text.\n"
    "- Preserve exact wording.\n"
    "- Include repeated items multiple times.\n"
    "- Output must be plain text, with categories followed by Python list-style values.\n"
    f"- Categories: {CATEGORIES}\n"
    "- Use EXACTLY these category names.\n"
    "- Each category must be followed by colon and Python list.\n"
    "- If no info exists for a category, return an empty list [].\n\n"
    "Education-specific rules:\n"
    "- While extracting information under the Education category, "
    "IGNORE names of colleges, schools, universities, institutions, or companies.\n"
    "- EXTRACT ONLY the course, degree, program, specialization, or qualification names "
    "explicitly mentioned.\n"
    "- Extract ONLY the END or COMPLETION year of a course if a year is mentioned.\n"
    "- If a year range is written (e.g., '2020–2024', '2019 to 2023'), "
    "extract ONLY the LAST year ('2024', '2023').\n"
    "- If a single year is mentioned without a range, treat it as the completion year "
    "and extract it.\n"
    "- Do NOT extract start years.\n"
    "- Do NOT infer, calculate, or guess missing years.\n"
    "- Do NOT normalize or reformat years.\n"
)

    user_prompt = f"Resume text:\n{cleaned_text}\nReturn output in EXACTLY the format with all categories."

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b:fireworks-ai",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.1,
        max_tokens=7000
    )

    output_text = response.choices[0].message.content

    # ✅ Correct token usage access
    token_usage = getattr(response, "usage", None)
    if token_usage:
        print(f"Prompt tokens: {getattr(token_usage, 'prompt_tokens', 'N/A')}")
        print(f"Completion tokens: {getattr(token_usage, 'completion_tokens', 'N/A')}")
        print(f"Total tokens: {getattr(token_usage, 'total_tokens', 'N/A')}")

    return output_text.strip()


# ------------------ File Processing ------------------
def process_resume_file(file_path: str, output_dir: str):
    """Process a single preprocessed resume and save extracted entities."""
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    if not text.strip():
        print(f"⚠️ Empty resume: {file_path}")
        return

    try:
        extracted_text = extract_resume_information_as_lists(text)
        os.makedirs(output_dir, exist_ok=True)
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        out_path = os.path.join(output_dir, f"{base_name}_entities.txt")

        with open(out_path, "w", encoding="utf-8") as f:
            f.write(extracted_text + "\n")

        print(f"✅ Entities extracted: {file_path} -> {out_path}")

    except Exception as e:
        print(f"❌ Error extracting entities from {file_path}: {e}")

def process_multiple_resumes(input_dir: str, output_dir: str):
    """Process all resumes in a preprocessed directory."""
    os.makedirs(output_dir, exist_ok=True)
    for filename in os.listdir(input_dir):
        if filename.endswith(".txt"):
            file_path = os.path.join(input_dir, filename)
            process_resume_file(file_path, output_dir)

# ------------------ Test ------------------
if __name__ == "__main__":
    INPUT_DIR = "data/resumes/preprocessed"
    OUTPUT_DIR = "data/resumes/entities"

    # Example single resume test
    sample_text = """
 John Smith is a Senior Software Engineer with 5 years of experience at Google.
    He has a Bachelor's degree in Computer Science from MIT and graduated in 2018.
    Skills: Python, JavaScript, Machine Learning, React, Node.js.
    Contact: john.smith@gmail.com, (555) 123-4567.
    Location: San Francisco, CA.
    Certifications: AWS Certified Solutions Architect, Google Cloud Professional.
    Projects: E-commerce platform, Machine Learning pipeline."""

    print("🧪 Testing HF GPT extraction on sample text...\n")
    print(extract_resume_information_as_lists(sample_text))

    
    print("\n🎯 Processing all resumes in directory...\n")
    process_multiple_resumes(INPUT_DIR, OUTPUT_DIR)
    