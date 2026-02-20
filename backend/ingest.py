"""
ingest.py – Indexes Guidelines.md + survey CSV files into FAISS.
Optimized for Gemini Free Tier (strict rate limits).
"""

import os
import csv
import random
import time
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
ROOT           = Path(__file__).parent.parent
GUIDELINES_DIR = ROOT / "guidelines"
DATA_DIR       = ROOT / "data"
VECTOR_DB_DIR  = Path(__file__).parent / "vector_db"
MAX_ROWS       = 200   # further reduced for free tier stability


def load_csv_as_documents(csv_path: Path, max_rows: int = MAX_ROWS) -> list:
    from langchain_core.documents import Document
    rows = []
    with open(csv_path, encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    total = len(rows)
    if total > max_rows:
        rows = random.sample(rows, max_rows)
    docs = []
    for i, row in enumerate(rows):
        text_parts = []
        for col, val in row.items():
            val_str = "; ".join(val) if isinstance(val, list) else str(val or "")
            val_str = val_str.strip()
            if val_str and val_str.upper() != "NA":
                text_parts.append(f"{col}: {val_str}")
        text = "\n".join(text_parts)
        if text.strip():
            docs.append(Document(
                page_content=text,
                metadata={"source": csv_path.name, "row": i, "type": "survey"},
            ))
    print(f"  📊 {csv_path.name}: {len(docs)} documents created")
    return docs


def ingest():
    if not GOOGLE_API_KEY:
        print("⚠️  No GOOGLE_API_KEY found.")
        return
    
    from langchain_community.document_loaders import TextLoader, DirectoryLoader
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain_google_genai import GoogleGenerativeAIEmbeddings
    from langchain_community.vectorstores import FAISS

    all_docs = []
    if GUIDELINES_DIR.exists():
        loader = DirectoryLoader(str(GUIDELINES_DIR), glob="**/*.md", loader_cls=TextLoader, loader_kwargs={"encoding": "utf-8"})
        all_docs.extend(loader.load())
    
    # Just Guideline for fast verify
    if not all_docs:
        print("⚠️  No docs.")
        return

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(all_docs)
    print(f"✂️  {len(chunks)} chunks to embed")

    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=GOOGLE_API_KEY,
        transport="rest",   # use stable v1 REST API, not gRPC v1beta
    )
    
    batch_size = 10 
    wait_time = 15  # 15s between batches
    vectorstore = None

    print(f"🔄 Starting incremental embedding (Batch Size: {batch_size}, Delay: {wait_time}s)...")

    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        success = False
        retries = 0
        
        while not success and retries < 5:
            try:
                if vectorstore is None:
                    vectorstore = FAISS.from_documents(batch, embeddings)
                else:
                    vectorstore.add_documents(batch)
                success = True
                print(f"   ✅ {min(i + batch_size, len(chunks))}/{len(chunks)} embedded.")
            except Exception as e:
                retries += 1
                if "429" in str(e):
                    backoff = 30 * retries
                    print(f"   ⚠️  Rate limit (429). Retrying in {backoff}s (Attempt {retries}/5)...")
                    time.sleep(backoff)
                else:
                    print(f"   ❌ Error: {e}")
                    raise e
        
        if not success:
            print(f"   💥 Failed to embed batch starting at {i} after {retries} retries.")
            break

        # Periodic save to avoid losing all progress
        if i % 100 == 0 or i + batch_size >= len(chunks):
            VECTOR_DB_DIR.mkdir(parents=True, exist_ok=True)
            vectorstore.save_local(str(VECTOR_DB_DIR))
            # print("      (Progress saved to disk)")

        if i + batch_size < len(chunks):
            time.sleep(wait_time)

    print(f"✅ Ingestion complete! Store at: {VECTOR_DB_DIR}")


if __name__ == "__main__":
    ingest()
