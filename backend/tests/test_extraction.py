import os
import re
import pytest
from src.extraction.resume_extractor import extract_resume_information_as_lists, process_resume_file

# -------- Helpers -------- #

def is_valid_list_format(block: str) -> bool:
    """
    Validate that a block of text looks like a Python list, e.g. ["a", "b"] or []
    """
    return bool(re.match(r'^\[.*\]$', block.strip(), re.DOTALL))

# -------- Tests -------- #

def test_extract_from_text(monkeypatch):
    """
    Test extracting entities from a small mock resume text.
    Monkeypatch the OpenAI call to avoid API usage.
    """

    mock_resume = "John Doe\nSkills: Python, SQL\nEducation: B.Tech in Computer Science"
    mock_output = """Hard Skills:
["Python", "SQL"]

Soft Skills:
[]

Work Experience:
[]

Education:
["B.Tech in Computer Science"]

Certifications:
[]

Projects:
[]"""

    # Monkeypatch function to bypass API
    monkeypatch.setattr(
        "src.extraction.resume_extractor.extract_resume_information_as_lists",
        lambda text: mock_output
    )

    extracted = extract_resume_information_as_lists(mock_resume)

    # Ensure all categories exist
    assert "Hard Skills:" in extracted
    assert "Soft Skills:" in extracted
    assert "Work Experience:" in extracted
    assert "Education:" in extracted
    assert "Certifications:" in extracted
    assert "Projects:" in extracted

    # Validate at least one block is a list
    matches = re.findall(r'\[.*?\]', extracted, re.DOTALL)
    assert all(is_valid_list_format(m) for m in matches)

def test_process_resume_file(tmp_path, monkeypatch):
    """
    Test end-to-end file processing: input resume -> output entity file.
    """

    # Create fake input resume file
    resume_text = "Skills: Python, SQL\nEducation: B.Tech in CS"
    input_file = tmp_path / "resume1.txt"
    input_file.write_text(resume_text)

    # Expected fake output
    mock_output = """Hard Skills:
["Python", "SQL"]

Soft Skills:
[]

Work Experience:
[]

Education:
["B.Tech in CS"]

Certifications:
[]

Projects:
[]"""

    # Monkeypatch extractor
    monkeypatch.setattr(
        "src.extraction.resume_extractor.extract_resume_information_as_lists",
        lambda text: mock_output
    )

    # Process file
    output_dir = tmp_path / "entities"
    process_resume_file(str(input_file), str(output_dir))

    # Verify output file exists
    out_file = output_dir / "resume1_entities.txt"
    assert out_file.exists()

    # Verify contents
    content = out_file.read_text()
    assert "Hard Skills:" in content
    assert "Soft Skills:" in content
    assert "[]" in content

