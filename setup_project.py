import os


folders = [
    "data/jobs/embeddings", "data/jobs/entities", "data/jobs/preprocessed", "data/jobs/raw",
    "data/resumes/embeddings", "data/resumes/entities", "data/resumes/preprocessed", "data/resumes/raw",
    "notebooks",
    "src/embeddings", "src/extraction", "src/ingestion", "src/matching", "src/preprocess", "src/utils",
    "tests"
]

files = {
    ".env": "",
    "requirements.txt": "",
    "config.py": "",
    "run_pipeline.py": "",
    "src/__init__.py": "",
    "src/embeddings/__init__.py": "",
    "src/embeddings/local_embedder.py": "",
    "src/embeddings/openai_embedder.py": "",
    "src/extraction/__init__.py": "",
    "src/extraction/ner_spacy.py": "",
    "src/extraction/resume_extractor.py": "",
    "src/ingestion/__init__.py": "",
    "src/ingestion/docx_reader.py": "",
    "src/ingestion/parser.py": "",
    "src/ingestion/pdf_reader.py": "",
    "src/matching/__init__.py": "",
    "src/matching/similarity.py": "",
    "src/matching/trainer.py": "",
    "src/preprocess/__init__.py": "",
    "src/preprocess/anonymizer.py": "",
    "src/preprocess/cleaner.py": "",
    "src/utils/__init__.py": "",
    "src/utils/file_utils.py": "",
    "src/utils/logger.py": "",
    "tests/test_embeddings.py": "",
    "tests/test_extraction.py": "",
    "tests/test_ingestion.py": "",
    "tests/test_matching.py": "",
    "tests/test_preprocess.py": "",
}

os.makedirs("IRIS NEW", exist_ok=True)
os.chdir("IRIS NEW")

for folder in folders:
    os.makedirs(folder, exist_ok=True)

for file, content in files.items():
    with open(file, "w", encoding="utf-8") as f:
        f.write(content)

print("✅ Project scaffold created successfully.")
