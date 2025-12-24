import pypdf
import pdfplumber
from src.preprocess.cleaner import postprocess_extracted_text

def parse_pdf(path: str) -> str:
    """
    Extract text from a PDF file.
    Tries pdfplumber first, falls back to pypdf.
    Returns postprocessed text.
    """
    text = ""

    # --- pdfplumber extraction ---
    try:
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        if text.strip():
            return postprocess_extracted_text(text)
    except Exception as e:
        print(f"⚠️ pdfplumber failed for {path}: {e}")

    # --- fallback to pypdf ---
    try:
        with open(path, "rb") as f:
            reader = pypdf.PdfReader(f)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        if text.strip():
            return postprocess_extracted_text(text)
    except Exception as e:
        print(f"❌ pypdf also failed for {path}: {e}")

    raise ValueError(f"Unable to extract text from PDF: {path}")
