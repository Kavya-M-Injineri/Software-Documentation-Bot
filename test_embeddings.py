import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv

load_dotenv("backend/.env")
api_key = os.environ.get("GOOGLE_API_KEY")

try:
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001", google_api_key=api_key)
    vector = embeddings.embed_query("hello world")
    print(f"Success! Vector length: {len(vector)}")
except Exception as e:
    print(f"Error testing embeddings: {e}")
