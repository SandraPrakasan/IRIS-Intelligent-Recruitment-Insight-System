# src/preprocess/__init__.py

from .cleaner import clean_text

# Note: do not import `anonymizer` at package import time because it
# brings heavy dependencies (transformers / torch). Import it lazily
# where needed to avoid import-time failures on systems without
# working GPU/CUDA or where torch import can fail.
