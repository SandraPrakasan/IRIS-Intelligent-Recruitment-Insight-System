from docx import Document
from src.preprocess.cleaner import postprocess_extracted_text

def parse_docx(path: str) -> str:
    """
    Extract text from DOCX file.
    Returns postprocessed text ready for NER and cleaning.
    """
    doc = Document(path)
    text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
    return postprocess_extracted_text(text)
