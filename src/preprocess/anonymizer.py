import re
from transformers import pipeline
from src.preprocess.cleaner import postprocess_extracted_text

# Load Hugging Face NER pipeline once
ner_pipeline = pipeline(
    "token-classification",
    model="dslim/distilbert-NER",
    aggregation_strategy="simple"
)

def remove_pii(text: str) -> str:
    entities = ner_pipeline(text)
    # Collect spans for PER and LOC entities
    spans = []
    for ent in entities:
        label = ent.get("entity_group") or ent.get("entity")
        if label in {"PER", "LOC"}:
            spans.append({
                "start": ent["start"],
                "end": ent["end"],
                "label": label
            })

    # Merge overlapping or adjacent spans for same labels
    merged_spans = []
    for span in sorted(spans, key=lambda s: s["start"]):
        if merged_spans and span["start"] <= merged_spans[-1]["end"]:
            # Extend the previous span
            merged_spans[-1]["end"] = max(span["end"], merged_spans[-1]["end"])
        else:
            merged_spans.append(span)

    # Replace from back to avoid shifting indices
    for span in reversed(merged_spans):
        placeholder = f" [{span['label']}] "
        text = text[:span["start"]] + placeholder + text[span["end"]:]

    # Regex masking for emails and phones
    text = re.sub(r"\s*([.@])\s*", r"\1", text)  # fix broken emails
    text = re.sub(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", "[email]", text)
    text = re.sub(r"\b\d{10}\b", "[phone]", text)
    text = re.sub(r"\+?\d{1,3}[-.\s]?\d{3,}[-.\s]?\d{3,}", "[phone]", text)

    return postprocess_extracted_text(text)
