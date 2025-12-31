import unittest
from src.preprocess.cleaner import clean_text
from src.preprocess.anonymizer import remove_pii

class TestPreprocessing(unittest.TestCase):

    def test_process_resumes_raw_to_preprocessed(self):
        import os
        from src.ingestion.pdf_reader import parse_pdf

        raw_dir = os.path.join(os.path.dirname(__file__), '../data/resumes/raw')
        out_dir = os.path.join(os.path.dirname(__file__), '../data/resumes/preprocessed')
        os.makedirs(out_dir, exist_ok=True)

        for fname in os.listdir(raw_dir):
            if fname.lower().endswith('.pdf'):
                in_path = os.path.join(raw_dir, fname)
                out_path = os.path.join(out_dir, os.path.splitext(fname)[0] + '.txt')
                try:
                    text = parse_pdf(in_path)
                    anonymized = remove_pii(text)
                    with open(out_path, 'w', encoding='utf-8') as f:
                        f.write(anonymized)
                    print(f"Processed {fname} -> {out_path}")
                except Exception as e:
                    print(f"Failed to process {fname}: {e}")

    def test_clean_text_basic(self):
        raw_text = "This is   a test\nwith multiple\tspaces."
        cleaned = clean_text(raw_text)
        self.assertEqual(cleaned, "This is a test with multiple spaces.")

    def test_clean_text_non_ascii(self):
        raw_text = "Résumé with café and naïve characters."
        cleaned = clean_text(raw_text)
        self.assertEqual(cleaned, "Resume with cafe and naive characters.")

    def test_remove_pii_email_phone(self):
        raw_text = "Contact me at john.doe@example.com or +1-123-456-7890"
        anonymized = remove_pii(raw_text)
        self.assertIn("[email]", anonymized)
        self.assertIn("[phone]", anonymized)

    def test_remove_pii_entities(self):
        raw_text = "John Doe works at OpenAI in San Francisco."
        anonymized = remove_pii(raw_text)
        self.assertIn("[name]", anonymized)
        self.assertIn("[location]", anonymized)

    def test_full_pipeline(self):
        raw_text = "Jane Smith, contact: jane.smith@example.com, lives in London, works at Google."
        anonymized = remove_pii(raw_text)
        self.assertIn("[email]", anonymized)
        self.assertIn("[name]", anonymized)
        self.assertIn("[location]", anonymized)

if __name__ == "__main__":
    unittest.main()
