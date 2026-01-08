
import re

PHONE_REGEX = r"(?:\+?(\d{1,3}))?[-. (]*(\d{2,5})[-. )]*(\d{2,5})[-. ]*(\d{2,5})(?:[-. ]*(\d{1,4}))?"

test_cases = [
    # Should match
    "+919876543210",
    "+91-9876543210",
    "9876543210", 
    "123-456-7890",
    "+1 (123) 456-7890", # Parentheses not handled currently
    "09876543210",
    "+91 98765 43210", # Space not handled
    "Phone: +91 9876543210",
]

print(f"Regex: {PHONE_REGEX}\n")

for text in test_cases:
    print(f"Testing: '{text}'")
    
    # Using the logic from regex_pii.py
    phone_matches = re.finditer(PHONE_REGEX, text)
    found = None
    for match in phone_matches:
        p = match.group(0)
        # Check length of digits
        if len(re.sub(r"\D", "", p)) >= 10:
            found = p.strip()
            print(f"  ✅ Match: {found}")
            break
            
    if not found:
        print("  ❌ No valid match found")
