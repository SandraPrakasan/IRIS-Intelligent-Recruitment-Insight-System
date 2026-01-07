import sys
import os

# Add backend to path so we can import
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from backend.src.extraction.fallback_extractor import extract_fallback

test_cases = [
    "+91 9876543210",          # India
    "+919876543210",           # India No Space
    "9876543210",              # India Local
    "+1 212-555-0199",         # US
    "+44 7911 123456",         # UK Mobile
    "+971 50 1234567",         # UAE
    "+61 412 345 678",         # Australia
    "+49 151 12345678",        # Germany
    "+33 6 12 34 56 78",       # France
    "+81 90-1234-5678",        # Japan
    "Phone: +91 98765-43210",  # In text
    "Call me at 123-456-7890", # US Local in text
    "No phone number here"
]


print("Testing extract_fallback Phone Extraction:")
with open("test_output.txt", "w", encoding="utf-8") as f:
    for t in test_cases:
        result = extract_fallback(t)
        output_line = f"'{t}' -> {result.get('phone')}"
        print(output_line)
        f.write(output_line + "\n")

