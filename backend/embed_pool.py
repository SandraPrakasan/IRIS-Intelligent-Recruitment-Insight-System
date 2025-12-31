"""
embed_pool.py

Generate pooled per-category embeddings from a dictionary of lists.
Saves a dict mapping category -> pooled CPU tensor to a .pt file.

Usage:
  python embed_pool.py --input-json entities.json --output pooled.pt

If no input JSON is provided, a small example dict is used.
"""

from __future__ import annotations

import argparse
import json
import os
import ast
import re
from typing import Dict, List, Optional

import torch
from sentence_transformers import SentenceTransformer


DEFAULT_MODEL = "BAAI/bge-large-en-v1.5"


def get_instruction_map() -> Dict[str, str]:
    return {
        "Hard_Skills": "Represent this skill:",
        "Experience": "Represent this experience:",
        "Education": "Represent this education item:",
        "Soft_Skills": "Represent this soft skill:",
        "Certifications": "Represent this certification:",
        "Summary": "Represent this summary:",
        "Projects": "Represent this project:",
        "Languages": "Represent this language proficiency:",
    }


def pooled_embeddings_from_dict(
    entities: Dict[str, List[str]],
    model_name: str = DEFAULT_MODEL,
    device: Optional[str] = None,
) -> Dict[str, torch.Tensor]:
    """
    For each category in `entities`, embed every item individually with a short
    instruction prompt and compute the mean (pooled) embedding vector.

    Returns a dict mapping category -> pooled torch.Tensor (CPU).
    """
    device = device or ("cuda" if torch.cuda.is_available() else "cpu")
    model = SentenceTransformer(model_name, device=device)
    emb_dim = model.get_sentence_embedding_dimension()
    instructions = get_instruction_map()

    pooled: Dict[str, torch.Tensor] = {}

    for category, items in entities.items():
        instruction = instructions.get(
            category, f"Represent this {category.replace('_', ' ').lower()}:"
        )

        if not items:
            pooled_vec = torch.zeros(emb_dim, dtype=torch.float32)
            pooled[category] = pooled_vec
            print(f"Category '{category}': empty list -> zero vector ({emb_dim} dim)")
            continue

        vectors: List[torch.Tensor] = []
        for item in items:
            text = f"{instruction} {item}"
            # embed each item individually
            vec = model.encode(text, convert_to_tensor=True)
            # ensure float tensor on device
            vec = vec.float()
            if vec.device.type != device and device == "cpu":
                vec = vec.cpu()
            vectors.append(vec)

        # stack and mean
        stacked = torch.stack([v.squeeze().cpu() for v in vectors], dim=0)
        pooled_vec = stacked.mean(dim=0)
        pooled[category] = pooled_vec
        print(f"Category '{category}': pooled {len(items)} vectors -> {pooled_vec.shape}")

    return pooled


def save_pooled(pooled: Dict[str, torch.Tensor], out_path: str) -> None:
    """Save the pooled dictionary to a .pt file using torch.save."""
    # ensure parent directory exists
    parent = os.path.dirname(out_path)
    if parent:
        os.makedirs(parent, exist_ok=True)

    torch.save(pooled, out_path)
    print(f"Saved pooled embeddings to: {out_path}")


def load_entities_from_json(path: str) -> Dict[str, List[str]]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, dict):
        raise ValueError("Input JSON must be a dict mapping category -> list[str].")
    return data


def load_entities_from_dir(path: str) -> Dict[str, List[str]]:
    """Load all .txt files in `path`, parse lines like `Key: [..]` and aggregate lists.

    Returns a dict category -> list[str] (deduplicated, preserving first-seen order).
    """
    entities: Dict[str, List[str]] = {}

    if not os.path.isdir(path):
        raise FileNotFoundError(f"Entities directory not found: {path}")

    for fname in sorted(os.listdir(path)):
        if not fname.lower().endswith(".txt"):
            continue
        full = os.path.join(path, fname)
        with open(full, "r", encoding="utf-8") as f:
            for raw in f:
                line = raw.strip()
                if not line:
                    continue
                if ":" not in line:
                    continue
                key, val = line.split(":", 1)
                key = key.strip()
                val = val.strip()
                parsed = None
                try:
                    parsed = ast.literal_eval(val)
                except Exception:
                    m = re.search(r"\[(.*)\]", val)
                    if m:
                        inner = m.group(1)
                        parts = [p.strip().strip("'\"") for p in inner.split(",") if p.strip()]
                        parsed = parts
                    else:
                        parsed = [val.strip().strip("'\"")]

                if not isinstance(parsed, (list, tuple)):
                    parsed = [str(parsed)]

                entities.setdefault(key, [])
                entities[key].extend([str(x) for x in parsed])

    # Deduplicate while preserving order per category
    deduped: Dict[str, List[str]] = {}
    for k, items in entities.items():
        seen = set()
        out = []
        for it in items:
            if it not in seen and it != "":
                seen.add(it)
                out.append(it)
        deduped[k] = out
    return deduped


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Pool per-category embeddings.")
    p.add_argument("--input-json", type=str, default=None, help="Path to JSON file with entities dict.")
    p.add_argument("--entities-dir", type=str, default="data/resumes/entities", help="Directory containing per-resume entity .txt files.")
    p.add_argument("--output", type=str, default="data/resumes/embeddings/pooled_embeddings.pt", help="Output .pt file path.")
    p.add_argument("--model", type=str, default=DEFAULT_MODEL, help="SentenceTransformer model name.")
    p.add_argument("--device", type=str, default=None, help="Device to run on (e.g. cpu or cuda). Auto-detect if omitted.")
    return p.parse_args()


if __name__ == "__main__":
    args = parse_args()

    # Priority: explicit JSON -> entities directory -> example dict
    if args.input_json:
        entities_dict = load_entities_from_json(args.input_json)
    elif args.entities_dir:
        entities_dict = load_entities_from_dir(args.entities_dir)
    else:
        print("No input JSON provided and no entities directory specified")

    pooled = pooled_embeddings_from_dict(entities_dict, model_name=args.model, device=args.device)
    save_pooled(pooled, args.output)
