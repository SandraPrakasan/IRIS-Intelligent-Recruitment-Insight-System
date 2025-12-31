import os
import unittest
from src.preprocess.job_preprocess import preprocess_jobs

class TestJobPreprocessing(unittest.TestCase):

    def setUp(self):
        self.raw_dir = os.path.join(os.path.dirname(__file__), "../data/jobs/raw")
        self.out_dir = os.path.join(os.path.dirname(__file__), "../data/jobs/preprocessed")
        os.makedirs(self.raw_dir, exist_ok=True)
        with open(os.path.join(self.raw_dir, "sample_job.txt"), "w", encoding="utf-8") as f:
            f.write("Senior Developer!!!\nMust have\tPython, ML & AI skills…")

    def test_job_cleaning(self):
        preprocess_jobs(self.raw_dir, self.out_dir)
        out_file = os.path.join(self.out_dir, "sample_job.txt")
        with open(out_file, "r", encoding="utf-8") as f:
            cleaned = f.read()
        self.assertIn("senior developer", cleaned)
        self.assertNotIn("!!!", cleaned)
        self.assertTrue(cleaned.islower())

if __name__ == "__main__":
    unittest.main()
