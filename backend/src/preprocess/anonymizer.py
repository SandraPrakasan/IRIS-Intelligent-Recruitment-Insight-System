import re
from transformers import pipeline
from src.preprocess.cleaner import postprocess_extracted_text

# Load Hugging Face NER pipeline once
ner_pipeline = pipeline(
    "token-classification",
    model="dslim/distilbert-NER",
    aggregation_strategy="simple"
)

def extract_name_and_mask(text: str) -> dict:
    """
    Runs NER to:
    1. Extract the candidate's name (heuristic: first PER entity).
    2. Mask ALL Name (PER) entities in the text.
    
    Returns:
    {
        "masked_text": str,
        "candidate_name": str or None
    }
    """
    # 1. Run NER
    entities = ner_pipeline(text)
    spans = []
    candidate_name = None
    
    # 2. Collect Spans
    for ent in entities:
        label = ent.get("entity_group") or ent.get("entity")
        if label in {"PER"}: # Only mask PER
            spans.append({
                "start": ent["start"],
                "end": ent["end"],
                "label": label,
                "word": ent.get("word", text[ent["start"]:ent["end"]]) 
            })
            
            # Heuristic: The earliest PER entity is likely the candidate name
            if not candidate_name:
                candidate_name = text[ent["start"]:ent["end"]].strip()

    # 3. Merge overlapping or adjacent spans
    merged_spans = []
    for span in sorted(spans, key=lambda s: s["start"]):
        if merged_spans and span["start"] <= merged_spans[-1]["end"] + 1:
            merged_spans[-1]["end"] = max(span["end"], merged_spans[-1]["end"])
        else:
            merged_spans.append(span)

    # 4. Refine Candidate Name from merged spans
    # first_per_span = next((s for s in merged_spans if s["label"] == "PER"), None)
    # if first_per_span:
    #     candidate_name = text[first_per_span["start"]:first_per_span["end"]]
    
    # WE DO NOT EXTRACT NAMES ANYMORE, ONLY MASK THEM.
    candidate_name = None 

    # 5. Mask Text (Apply placeholders)
    # Replace from back to avoid shifting indices
    masked_text = text
    for span in reversed(merged_spans):
        placeholder = f"[{span['label']}]"
        masked_text = masked_text[:span["start"]] + placeholder + masked_text[span["end"]:]

    return {
        "masked_text": postprocess_extracted_text(masked_text),
        "candidate_name": candidate_name # Will be None
    }

def remove_pii(text: str) -> str:
    """Deprecated wrapper. Use extract_name_and_mask instead."""
    return extract_name_and_mask(text)["masked_text"]
