import re
import unicodedata
from nltk.corpus import stopwords

# Load English stopwords
STOPWORDS = set(stopwords.words("english"))

def postprocess_extracted_text(text: str) -> str:
    text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)  # space between lower-uppercase
    text = re.sub(r'[\t\r\n]+', ' ', text)            # remove tabs/newlines
    text = re.sub(r' {2,}', ' ', text).strip()       # remove multiple spaces
    return text

def clean_text(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    
    # Remove URLs
    text = re.sub(r'http\S+|www\S+|https\S+', '', text)

    # Remove emails
    text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b', '', text)
    
    # Remove stopwords
    tokens = text.split()
    tokens = [word for word in tokens if word not in STOPWORDS]
    text = " ".join(tokens)

    # Normalize spaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text
