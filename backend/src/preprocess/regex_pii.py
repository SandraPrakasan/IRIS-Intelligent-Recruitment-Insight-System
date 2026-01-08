import re

# Regex Constants
EMAIL_REGEX = r"[\w\.-]+@[\w\.-]+\.\w+"
# Robust Regex for International & Indian formats
# Matches:
# +91 98765 43210
# +91-98765-43210
# 9876543210
# 0987-654-3210
# (0)9876543210
PHONE_REGEX = r"(?:\+?(\d{1,3}))?[-. (]*(\d{2,5})[-. )]*(\d{2,5})[-. ]*(\d{2,5})(?:[-. ]*(\d{1,4}))?"
URL_REGEX = r"https?://[^\s,)\"']+"

def extract_contact_info_regex(text: str) -> dict:
    """
    Extracts Phone, Email, and Links (LinkedIn, GitHub, Portfolio) using Regex.
    Returns a dictionary suitable for merging into the final profile payload.
    """
    
    # 1. Email
    email_match = re.search(EMAIL_REGEX, text)
    email = email_match.group(0) if email_match else None
    
    # 2. Phone
    # Find all matches and pick the longest/most likely one
    phone_matches = re.finditer(PHONE_REGEX, text)
    phone = None
    # Heuristic: Pick the first valid-looking match that is at least 10 chars
    for match in phone_matches:
        p = match.group(0)
        if len(re.sub(r"\D", "", p)) >= 10:
            phone = p.strip()
            break

    # 3. Links
    links = re.findall(URL_REGEX, text)
    
    linkedin = next((l for l in links if "linkedin.com" in l), None)
    github = next((l for l in links if "github.com" in l), None)
    
    # Portfolio is any other link that isn't specific social media
    # Excluding common junk like google.com or fonts.googleapis if they appear
    exclude_domains = ["linkedin.com", "github.com", "google.com", "facebook.com", "twitter.com", "instagram.com"]
    portfolio = None
    for l in links:
        if not any(d in l for d in exclude_domains):
            portfolio = l
            break

    return {
        "email": email, # While auth handles this, extracting it doesn't hurt
        "phone": phone,
        "linkedin": linkedin,
        "github": github,
        "portfolio": portfolio
    }

def mask_contact_info_regex(text: str) -> str:
    """
    Replaces Phone, Email, and Links with [REDACTED] placeholders
    to prevent PII leakage to LLMs.
    """
    
    # Mask Emails
    text = re.sub(EMAIL_REGEX, "[EMAIL_REDACTED]", text)
    
    # Mask Phone Numbers
    # Using a slightly more aggressive regex for masking to catch variants
    text = re.sub(PHONE_REGEX, "[PHONE_REDACTED]", text)
    
    # Mask Links
    # We mask ALL links to be safe, or just the specific ones? 
    # User said extract specific ones. 
    # Safer to mask all URLs to prevent "portfolio" leaking personal domain names.
    text = re.sub(URL_REGEX, "[LINK_REDACTED]", text)
    
    return text
