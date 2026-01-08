
import os
import json
import numpy as np
from typing import List, Any
from dotenv import load_dotenv
from supabase import create_client
from sentence_transformers import SentenceTransformer

# Load env
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")

# Initialize Model (Globals are bad but efficient for serverless-ish/script use)
# Using a singleton pattern to avoid reloading model on every call if imported
_model = None

def get_model():
    global _model
    if _model is None:
        print("📥 Loading BAAI/bge-m3 model...")
        _model = SentenceTransformer('BAAI/bge-m3')
    return _model

def get_supabase():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Missing Supabase credentials for embeddings.")
        return None
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def generate_embedding(text: str) -> List[float]:
    if not text or not text.strip():
        return [0.0] * 1024 # BGE-M3 is 1024d
    
    model = get_model()
    # BGE-M3 returns 1024 dim
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()

def generate_list_embedding(items: List[str]) -> List[float]:
    if not items:
        return [0.0] * 1024
    
    model = get_model()
    embeddings = model.encode(items, normalize_embeddings=True)
    # Mean pooling
    mean_embedding = np.mean(embeddings, axis=0)
    return mean_embedding.tolist()

def safe_generate_and_store_embeddings(client, user_id: str) -> None:
    """
    Fetches profile data, generates embeddings, and upserts to profile_embeddings.
    """
    print(f"🧬 Generating embeddings for User: {user_id}")
    
    # 1. Fetch Profile
    resp = client.table("profiles").select("*").eq("id", user_id).execute()
    if not resp.data:
        print(f"⚠️ Profile not found for {user_id}")
        return
    
    profile = resp.data[0]
    
    # 2. Extract Fields
    # Text fields
    summary = profile.get("summary") or ""
    headline = profile.get("headline") or ""
    role = profile.get("role") or ""
    
    # Lists (CSV or Array) - Handle both just in case
    def parse_list(val):
        if not val: return []
        if isinstance(val, list): return val
        if isinstance(val, str): return [x.strip() for x in val.split(",") if x.strip()]
        return []

    skills = parse_list(profile.get("skills"))
    tech_skills = parse_list(profile.get("technical_skills"))
    # For experience and education, we might need more complex parsing if stored as JSONB
    # But for now let's assume simple text representation or skip if complex JSON
    # If experience is JSONB, we'll serialize it to text for embedding
    experience_raw = profile.get("work_experience") or []
    if isinstance(experience_raw, list):
         # It's a list of objects or strings. Convert to list of strings.
         experience_texts = []
         for item in experience_raw:
             if isinstance(item, dict):
                 # Flatten: "Role at Company (Year): Description"
                 role_ = item.get("role") or ""
                 comp_ = item.get("company") or ""
                 desc_ = item.get("description") or ""
                 text = f"{role_} at {comp_}. {desc_}"
                 experience_texts.append(text)
             elif isinstance(item, str):
                 experience_texts.append(item)
         experience = experience_texts
    else:
        experience = []

    # 3. Generate Embeddings (Extra fields for completeness)
    certifications = parse_list(profile.get("certifications"))
    
    try:
        current_position_emb = generate_embedding(f"{role} {headline}")
        summary_emb = generate_embedding(summary)
        skills_emb = generate_list_embedding(skills)
        technical_skills_emb = generate_list_embedding(tech_skills)
        experience_emb = generate_list_embedding(experience)
        certifications_emb = generate_list_embedding(certifications)
        
        # 4. Upsert
        # Matches columns in create_profile_embeddings.sql
        payload = {
            "id": user_id,
            "headline": current_position_emb,
            "summary": summary_emb,
            "skills": skills_emb,
            "technical_skills": technical_skills_emb,
            "experience": experience_emb,
            "certifications": certifications_emb,
            "updated_at": "now()"
        }
        
        client.table("profile_embeddings").upsert(payload).execute()
        print(f"✅ Embeddings stored for {user_id}")
        
    except Exception as e:
        print(f"❌ Embedding generation failed: {e}")

if __name__ == "__main__":
    # Test run
    sb = get_supabase()
    if sb:
        # Replace with a valid ID for testing if needed
        pass
