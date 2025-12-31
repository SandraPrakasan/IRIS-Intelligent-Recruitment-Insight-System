import os
from concurrent.futures import ProcessPoolExecutor
from src.ingestion.parser import parse_file
from src.preprocess.cleaner import clean_text
from src.utils.file_utils import save_text
from dotenv import load_dotenv

# Load .env if present
load_dotenv()

# Resume extraction is imported lazily in `run_extraction_pipeline`


def _list_bucket_objects(client, bucket: str, prefix: str = ""):
    storage = client.storage.from_(bucket)
    try:
        resp = storage.list(path=prefix)
    except TypeError:
        resp = storage.list()

    items = None
    if isinstance(resp, dict):
        items = resp.get("data") or resp.get("objects") or resp.get("result") or []
    else:
        items = resp

    names = []
    for o in items or []:
        if isinstance(o, dict):
            if "name" in o:
                names.append(o["name"])
            elif "Key" in o:
                names.append(o["Key"])
        elif isinstance(o, str):
            names.append(o)
    return names


def _download_object(client, bucket: str, obj_path: str, dest_root: str) -> str:
    storage = client.storage.from_(bucket)
    data = storage.download(obj_path)
    local_path = os.path.join(dest_root, obj_path.replace('/', os.sep))
    local_dir = os.path.dirname(local_path)
    if local_dir:
        os.makedirs(local_dir, exist_ok=True)
    with open(local_path, "wb") as f:
        f.write(data)
    return local_path


def fetch_raw_from_supabase_if_enabled(dest_dir: str = "data/resumes/raw") -> None:
    """If `USE_SUPABASE_RAW` is truthy in env, download files from Supabase storage.

    This function is self-contained and only imports `supabase` when enabled.
    """
    use = os.environ.get("USE_SUPABASE_RAW", "0").lower()
    if use not in ("1", "true", "yes"):
        return

    bucket = os.environ.get("SUPABASE_BUCKET", "resumes")
    prefix = os.environ.get("SUPABASE_PREFIX", "")

    SUPABASE_URL = os.environ.get("SUPABASE_URL")
    SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("⚠️  SUPABASE_URL or SUPABASE_KEY not set; skipping Supabase fetch")
        return

    # ensure trailing slash to avoid client warning
    if not SUPABASE_URL.endswith("/"):
        SUPABASE_URL = SUPABASE_URL + "/"

    try:
        from supabase import create_client
    except Exception as e:
        print(f"⚠️  Supabase client not available; install 'supabase' to enable fetching: {e}")
        return

    try:
        client = create_client(SUPABASE_URL, SUPABASE_KEY)
        objs = _list_bucket_objects(client, bucket, prefix)
        if not objs:
            print(f"No objects found in Supabase bucket '{bucket}' with prefix '{prefix}'")
            return

        os.makedirs(dest_dir, exist_ok=True)
        for obj in objs:
            try:
                local = _download_object(client, bucket, obj, dest_dir)
                print(f"Downloaded from Supabase: {obj} -> {local}")
            except Exception as e:
                print(f"Failed to download {obj} from Supabase: {e}")
    except Exception as e:
        print(f"⚠️  Error while fetching from Supabase: {e}")

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
    # If configured, fetch raw resumes from Supabase into `RAW_DIR`
    fetch_raw_from_supabase_if_enabled(RAW_DIR)

    # Step 1: Preprocess raw resumes
    run_preprocessing_pipeline()
    # Step 2: Extract entities from preprocessed resumes
    run_extraction_pipeline()
