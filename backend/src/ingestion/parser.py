import os
from .pdf_reader import parse_pdf
from .docx_reader import parse_docx
from src.preprocess.cleaner import postprocess_extracted_text
from src.preprocess.cleaner import clean_text
from src.preprocess.anonymizer import remove_pii

def parse_file(path: str) -> str:
    """Detect file type and parse accordingly."""
    ext = os.path.splitext(path)[1].lower()
    if ext == ".pdf":
        text = parse_pdf(path)
    elif ext == ".docx":
        text = parse_docx(path)
    elif ext == ".txt":
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
    else:
        raise ValueError(f"Unsupported file type: {ext}")
    
    return postprocess_extracted_text(remove_pii(clean_text(text)))
