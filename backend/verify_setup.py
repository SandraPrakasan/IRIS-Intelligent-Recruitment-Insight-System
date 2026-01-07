
try:
    print("📦 Imports check...")
    import sentence_transformers
    from sentence_transformers import SentenceTransformer
    import torch
    print(f"✅ sentence-transformers version: {sentence_transformers.__version__}")
    print(f"✅ torch version: {torch.__version__}")
    
    print("\n🚀 Attempting to load BGE-M3 model (this might trigger download)...")
    # Using 'cpu' to allow it to run on any environment for this test
    # but the actual code uses cuda if available
    model = SentenceTransformer('BAAI/bge-m3', device='cpu')
    print("✅ Model loaded successfully!")
    
    test_text = "This is a test resume sentence."
    embedding = model.encode(test_text)
    print(f"✅ Generated embedding shape: {embedding.shape}")
    
    if embedding.shape[0] == 1024:
        print("✅ SUCCESS: Embedding dimension is 1024.")
    else:
        print(f"❌ ERROR: Expected 1024 dimensions, got {embedding.shape[0]}")
        
except ImportError as e:
    print(f"❌ Missing Dependency: {e}")
    print("Run: pip install -r requirements.txt")
except Exception as e:
    print(f"❌ Error: {e}")
