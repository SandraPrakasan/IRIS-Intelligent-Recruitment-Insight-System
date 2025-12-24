import os
from concurrent.futures import ProcessPoolExecutor
from src.ingestion.parser import parse_file
from src.preprocess.cleaner import clean_text
from src.utils.file_utils import save_text
# Resume extraction is imported lazily in `run_extraction_pipeline`

RAW_DIR = "data/resumes/raw"
PREPROCESSED_DIR = "data/resumes/preprocessed"
EXTRACTED_DIR = "data/resumes/entities"


def process_resume(file_path: str):
    """Extract and preprocess a single resume file."""
    try:
        raw_text = parse_file(file_path)
        # Import anonymizer lazily; if it fails (heavy deps like torch), skip anonymization
        try:
            from src.preprocess.anonymizer import remove_pii
            anonymized = remove_pii(raw_text)
        except Exception as e:
            print(f"⚠️  Anonymizer not available, skipping PII removal: {e}")
            anonymized = raw_text

        cleaned = clean_text(anonymized)

        filename = os.path.basename(file_path).rsplit(".", 1)[0] + ".txt"
        out_path = os.path.join(PREPROCESSED_DIR, filename)
        save_text(cleaned, out_path)
        print(f"✅ Preprocessed: {file_path} -> {out_path}")
    except Exception as e:
        print(f"❌ Error preprocessing {file_path}: {e}")


def run_preprocessing_pipeline():
    """Process all raw resumes and save preprocessed text."""
    os.makedirs(PREPROCESSED_DIR, exist_ok=True)
    files = [
        os.path.join(RAW_DIR, f)
        for f in os.listdir(RAW_DIR)
        if f.lower().endswith((".pdf", ".docx", ".txt"))
    ]
    print(f"Found {len(files)} files to preprocess...")
    with ProcessPoolExecutor() as executor:
        executor.map(process_resume, files)

def run_extraction_pipeline():
    os.makedirs(EXTRACTED_DIR, exist_ok=True)
    try:
        # Lazy import to avoid heavy `openai`/`pydantic`/`transformers` imports at module import time
        try:
            from src.extraction.resume_extractor import process_multiple_resumes
        except Exception as e:
            print(f"⚠️  Extraction component unavailable, skipping extraction: {e}")
            return

        process_multiple_resumes(PREPROCESSED_DIR, EXTRACTED_DIR)
    except Exception as e:
        print(f"❌ Error during extraction pipeline: {e}")

            


if __name__ == "__main__":
    # Step 1: Preprocess raw resumes
    run_preprocessing_pipeline()
    # Step 2: Extract entities from preprocessed resumes
    run_extraction_pipeline()
