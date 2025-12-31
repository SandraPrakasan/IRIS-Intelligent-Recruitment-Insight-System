import re

def extract_fallback(text: str) -> dict:
    """
    A dumb Regex-based fallback extractor if Gemini fails.
    Extracts basic info like Email, Phone, Links, and keyword-matched Skills.
    """
    
    # 1. Email (Basic)
    email_params = r"[\w\.-]+@[\w\.-]+\.\w+"
    email_match = re.search(email_params, text)
    email = email_match.group(0) if email_match else None
    
    # 2. Phone (Very Basic - catches 10-12 digit numbers)
    phone_match = re.search(r"(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}", text)
    phone = phone_match.group(0) if phone_match else None

    # 3. Links (LinkedIn / GitHub / Portfolio)
    links = re.findall(r"https?://[^\s]+", text)
    linkedin = next((l for l in links if "linkedin.com" in l), None)
    github = next((l for l in links if "github.com" in l), None)
    portfolio = next((l for l in links if l not in [linkedin, github]), None)

    # 4. Keyword Matching for Skills (Static List)
    COMMON_SKILLS = [
        "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "SQL", "NoSQL",
        "React", "Angular", "Vue", "Node.js", "Django", "Flask", "FastAPI",
        "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Git", "CI/CD",
        "Machine Learning", "Deep Learning", "NLP", "Pandas", "NumPy", "TensorFlow", "PyTorch"
    ]
    
    found_skills = [skill for skill in COMMON_SKILLS if re.search(r"\b" + re.escape(skill) + r"\b", text, re.IGNORECASE)]

    # 5. Construct Payload (Matches Schema)
    return {
        "headline": None,
        "summary": text[:500] + "..." if len(text) > 500 else text, # Fallback summary is just first 500 chars
        "skills": found_skills,
        "technical_skills": found_skills, # Duplicate for safety
        "education": [],
        "work_experience": [],
        "certifications": [],
        "languages": [],
        "experience_years": None,
        # Extra fields specific to Supabase Ingest (mapped later)
        # "email": email, # Backend doesn't use extracted email usually (uses auth), but good to have
        "phone": phone,
        "linkedin": linkedin,
        "github": github,
        "portfolio": portfolio
    }
