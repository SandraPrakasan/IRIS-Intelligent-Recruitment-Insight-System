import os
from typing import Optional

from .cleaner import clean_text


def preprocess_jobs(raw_dir: str = "data/jobs/raw", out_dir: str = "data/jobs/preprocessed") -> Optional[int]:
    """Read all .txt files from `raw_dir`, clean them using `clean_text`,
    and write cleaned versions to `out_dir` preserving filenames.

    Returns the number of files processed or None on error.
    """
    try:
        if not os.path.isdir(raw_dir):
            print(f"⚠️ Raw jobs dir does not exist: {raw_dir}")
            return 0

        os.makedirs(out_dir, exist_ok=True)

        files = [f for f in os.listdir(raw_dir) if f.lower().endswith(".txt")]
        for fname in files:
            src_path = os.path.join(raw_dir, fname)
            dst_path = os.path.join(out_dir, fname)
            # skip if already preprocessed
            if os.path.exists(dst_path) and os.path.getsize(dst_path) > 0:
                print(f"Skipping already preprocessed file: {dst_path}")
                continue
            try:
                with open(src_path, "r", encoding="utf-8") as rf:
                    text = rf.read()
            except Exception as e:
                print(f"⚠️ Failed to read {src_path}: {e}")
                continue

            cleaned = clean_text(text)

            try:
                with open(dst_path, "w", encoding="utf-8") as wf:
                    wf.write(cleaned)
            except Exception as e:
                print(f"⚠️ Failed to write {dst_path}: {e}")
                continue

            print(f"Preprocessed job file: {src_path} -> {dst_path}")

        return len(files)
    except Exception as e:
        print(f"⚠️ preprocess_jobs failed: {e}")
        return None
