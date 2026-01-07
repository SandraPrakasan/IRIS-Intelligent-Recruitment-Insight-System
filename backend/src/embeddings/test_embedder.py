
import sys
import os
import numpy as np

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from backend.src.embeddings.local_embedder import generate_embeddings

sample_data = {
    "headline": "Senior Software Engineer",
    "summary": "Experienced in Python and AI.",
    "skills": ["Communication", "Leadership", "Agile"],
    "technical_skills": ["Python", "FastAPI", "React"],
    "certifications": [], # Empty list
    "languages": ["English", "Spanish"]
}

print("Running Embedding Generation Test...")
embeddings = generate_embeddings(sample_data)

print("\nResults:")
for key, vector in embeddings.items():
    vec_len = len(vector)
    print(f"Field: {key:20} | Dimensions: {vec_len} | Sample: {vector[:3]}...")
    
    if vec_len != 1024:
        print(f"❌ ERROR: Expected 1024 dimensions, got {vec_len}")
    
if "certifications" not in embeddings:
    print("Field: certifications       | Correctly skipped (empty)")

print("\nDone.")
