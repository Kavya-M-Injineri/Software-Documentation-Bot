import os
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv("backend/.env")
api_key = os.environ.get("GOOGLE_API_KEY")

try:
    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=api_key)
    res = llm.invoke("Hello, how are you?")
    print(f"Success! Response: {res.content}")
except Exception as e:
    print(f"Error testing chat: {e}")
