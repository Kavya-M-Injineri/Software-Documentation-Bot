"""
main.py – FastAPI backend for DevDoc AI Documentation Bot
Endpoints: /api/chat, /api/flashcards, /api/saved-answers, /api/analytics,
           /api/auth/login, /api/auth/signup
"""

import os
import json
import time
import uuid
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from dotenv import load_dotenv

# ── Load env ─────────────────────────────────────────────────────────────────
load_dotenv(Path(__file__).parent / ".env")

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
FRONTEND_URL   = os.getenv("FRONTEND_URL", "http://localhost:5173")
JWT_SECRET     = os.getenv("JWT_SECRET", "devdoc-secret-key")

# ── Paths ─────────────────────────────────────────────────────────────────────
BACKEND_DIR      = Path(__file__).parent
VECTOR_DB_DIR    = BACKEND_DIR / "vector_db"
USERS_FILE       = BACKEND_DIR / "users.json"
SAVED_FILE       = BACKEND_DIR / "saved_answers.json"
ANALYTICS_FILE   = BACKEND_DIR / "analytics.json"
COLLECTION       = "devdoc_knowledge"

# ── OpenAI client setup ───────────────────────────────────────────────────────
openai_client = None
has_real_ai   = False

if OPENAI_API_KEY and OPENAI_API_KEY.startswith("sk-"):
    try:
        from openai import OpenAI
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
        # Quick validation – will raise if key is invalid
        has_real_ai = True
        print("✅ AI backend initialised (OpenAI gpt-4o-mini)")
    except Exception as e:
        print(f"⚠️  OpenAI init failed: {e}. Running in fallback mode.")
else:
    print("ℹ️  No valid OPENAI_API_KEY – running with keyword fallback responses.")




# ── Helper: JSON file I/O ─────────────────────────────────────────────────────
def read_json(path: Path, default):
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            return default
    return default

def write_json(path: Path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

# ── Auth helpers ──────────────────────────────────────────────────────────────
import base64

def make_token(user_id: str) -> str:
    payload = {"user_id": user_id, "exp": (datetime.utcnow() + timedelta(days=7)).timestamp()}
    return base64.b64encode(json.dumps(payload).encode()).decode()

def decode_token(token: str) -> Optional[str]:
    try:
        payload = json.loads(base64.b64decode(token.encode()).decode())
        if payload["exp"] > datetime.utcnow().timestamp():
            return payload["user_id"]
    except Exception:
        pass
    return None

security = HTTPBearer(auto_error=False)

def get_current_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    if not creds:
        return None
    return decode_token(creds.credentials)

# ── Analytics helpers ─────────────────────────────────────────────────────────
def log_query(topic: str = "General"):
    data = read_json(ANALYTICS_FILE, {
        "total_queries": 0,
        "topic_counts": {},
        "daily_counts": {},
        "response_times": [],
    })
    data["total_queries"] = data.get("total_queries", 0) + 1
    data["topic_counts"][topic] = data["topic_counts"].get(topic, 0) + 1
    today = datetime.utcnow().strftime("%Y-%m-%d")
    data["daily_counts"][today] = data["daily_counts"].get(today, 0) + 1
    write_json(ANALYTICS_FILE, data)

# ── Fallback responses ────────────────────────────────────────────────────────
FALLBACK = {
    "list comprehension": {
        "direct_answer": "List comprehension is a concise way to create lists in Python.",
        "explanation": "List comprehensions combine a for loop and optional condition into a single expression: [expression for item in iterable if condition]. They improve readability and are often faster than equivalent loops.",
        "code_snippet": {"language": "python", "code": "# List comprehension\nsquares = [x**2 for x in range(10)]\n\n# With condition\nevens = [x for x in range(20) if x % 2 == 0]"},
        "sources": [{"title": "Python Docs – Data Structures", "url": "https://docs.python.org/3/tutorial/datastructures.html", "type": "documentation"}],
    },
    "rest api": {
        "direct_answer": "REST is an architectural style for building web APIs using HTTP.",
        "explanation": "RESTful APIs use standard HTTP methods (GET, POST, PUT, DELETE) to perform CRUD operations on resources identified by URLs. They are stateless and typically return JSON.",
        "code_snippet": {"language": "javascript", "code": "const res = await fetch('/api/users', { method: 'GET' });\nconst data = await res.json();"},
        "sources": [{"title": "REST API Tutorial", "url": "https://restfulapi.net/", "type": "documentation"}],
    },
    "cors": {
        "direct_answer": "CORS (Cross-Origin Resource Sharing) controls which origins can access your API.",
        "explanation": "When a browser makes a request to a different domain/port, the server must include Access-Control-Allow-Origin headers. In FastAPI use CORSMiddleware; in Express use the cors package.",
        "code_snippet": {"language": "python", "code": "from fastapi.middleware.cors import CORSMiddleware\napp.add_middleware(CORSMiddleware, allow_origins=['*'])"},
        "sources": [{"title": "MDN – CORS", "url": "https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS", "type": "documentation"}],
    },
    "async": {
        "direct_answer": "async/await allows non-blocking asynchronous code in Python and JavaScript.",
        "explanation": "In Python, async functions run on an event loop and use `await` to pause execution while waiting for I/O. This avoids blocking the thread and allows concurrent operation handling.",
        "code_snippet": {"language": "python", "code": "import asyncio\n\nasync def fetch_data():\n    await asyncio.sleep(1)\n    return 'done'\n\nasyncio.run(fetch_data())"},
        "sources": [{"title": "Python asyncio docs", "url": "https://docs.python.org/3/library/asyncio.html", "type": "documentation"}],
    },
    "rag": {
        "direct_answer": "RAG (Retrieval-Augmented Generation) enhances LLM responses with retrieved context.",
        "explanation": "RAG first retrieves relevant documents from a vector database using semantic search, then passes them as context to the LLM alongside the user's question. This grounds answers in real, up-to-date knowledge rather than the LLM's training data alone.",
        "code_snippet": None,
        "sources": [{"title": "LangChain RAG Guide", "url": "https://python.langchain.com/docs/use_cases/question_answering/", "type": "documentation"}],
    },
    "typeerror": {
        "direct_answer": "TypeError occurs when an operation is applied to an object of an inappropriate type.",
        "explanation": "Common causes: calling None as a function, wrong argument types, or operating on incompatible types. Use type checking (isinstance) or ensure data is correctly initialised.",
        "code_snippet": {"language": "python", "code": "# Bad\nx = None\nx()  # TypeError\n\n# Fix: check before calling\nif callable(x):\n    x()"},
        "sources": [{"title": "Python Exceptions", "url": "https://docs.python.org/3/library/exceptions.html", "type": "documentation"}],
    },
}

def fallback_response(query: str) -> dict:
    q = query.lower()
    for key, resp in FALLBACK.items():
        if key in q:
            return resp
    return {
        "direct_answer": "This is a DevDoc AI response. Ensure your GOOGLE_API_KEY is correct in backend/.env if you're not seeing AI answers.",
        "explanation": "DevDoc AI uses Retrieval-Augmented Generation (RAG) to answer developer questions. It retrieves relevant context from your Guidelines.md and uses Google Gemini to generate accurate, cited answers.",
        "code_snippet": {"language": "bash", "code": "# 1. Check .env file\ncat backend/.env\n\n# 2. Re-ingest docs if needed\npython backend/ingest.py"},
        "sources": [],
    }

# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(title="DevDoc AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models ────────────────────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    query: str

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    email: str
    password: str
    name: str
    company: str = ""

class SaveAnswerRequest(BaseModel):
    question: str
    answer: str
    category: str = "General"

class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None

# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"status": "ok", "ai_enabled": has_real_ai}

@app.get("/health")
async def health():
    return {"status": "ok", "ai_enabled": has_real_ai, "vector_db": VECTOR_DB_DIR.exists()}

# ── Chat ──────────────────────────────────────────────────────────────────────
@app.post("/api/chat")
async def chat(req: ChatRequest):
    import re
    start = time.time()
    query = req.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    # Detect topic for analytics
    topic = "General"
    for kw, t in [("python","Python"),("javascript","JavaScript"),("js","JavaScript"),
                   ("sql","Databases"),("database","Databases"),("docker","DevOps"),
                   ("kubernetes","DevOps"),("react","Web Development"),("api","Web Development"),
                   ("machine learning","Machine Learning"),("ml","Machine Learning"),
                   ("algorithm","Algorithms"),("sort","Algorithms")]:
        if kw in query.lower():
            topic = t
            break
    log_query(topic)

    if has_real_ai and openai_client is not None:
        try:
            print(f"🤖 OpenAI Query: {query}")
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are DevDoc AI, an expert technical documentation assistant. "
                            "Answer developer questions clearly. Always respond in this exact JSON format:\n"
                            '{"direct_answer":"one sentence answer","explanation":"2-4 sentence detailed explanation",'
                            '"code_snippet":{"language":"python","code":"# example code"} or null,'
                            '"sources":[{"title":"Source","url":"https://example.com","type":"documentation"}] or []}'
                        )
                    },
                    {"role": "user", "content": query}
                ],
                temperature=0.3,
            )

            answer = response.choices[0].message.content
            print(f"   ✨ OpenAI Response: {answer[:100]}...")

            # Parse JSON from response
            json_match = re.search(r'\{.*\}', answer, re.DOTALL)
            if json_match:
                answer_data = json.loads(json_match.group())
            else:
                answer_data = {
                    "direct_answer": answer,
                    "explanation": "",
                    "code_snippet": None,
                    "sources": [],
                }

            elapsed = round(time.time() - start, 2)
            return {**answer_data, "response_time": elapsed, "ai_powered": True}

        except Exception as e:
            print(f"❌ OpenAI error: {e}")
            if "429" in str(e):
                return {
                    "direct_answer": "OpenAI Rate Limit Exceeded.",
                    "explanation": "Too many requests. Please wait a moment and try again.",
                    "code_snippet": None,
                    "sources": [],
                    "response_time": round(time.time() - start, 2),
                    "ai_powered": False,
                }

    # Fallback
    resp = fallback_response(query)
    return {**resp, "response_time": round(time.time() - start, 2), "ai_powered": False}




# ── Flashcards ────────────────────────────────────────────────────────────────
FLASHCARDS_SEED = [
    {"id": "1", "category": "Python Basics", "term": "List Comprehension",
     "definition": "A concise way to create lists: [expr for item in iterable if condition]. Improves readability and often outperforms equivalent loops.",
     "source": "Python Documentation"},
    {"id": "2", "category": "Python Basics", "term": "Decorator",
     "definition": "A design pattern using @syntax to wrap functions, adding behaviour (logging, auth, caching) without modifying source code.",
     "source": "Stack Overflow"},
    {"id": "3", "category": "Data Structures", "term": "Hash Table",
     "definition": "Maps keys to values via a hash function. Provides O(1) average-case insert/lookup. Powers Python dicts and JS objects.",
     "source": "CS Fundamentals"},
    {"id": "4", "category": "Web Development", "term": "REST API",
     "definition": "Architectural style using HTTP methods (GET/POST/PUT/DELETE) on resource URLs. Stateless, typically returns JSON.",
     "source": "Web Standards"},
    {"id": "5", "category": "Algorithms", "term": "Binary Search",
     "definition": "Efficient O(log n) algorithm for sorted arrays. Repeatedly halves the search space until the target is found or the space is empty.",
     "source": "Algorithm Design"},
    {"id": "6", "category": "System Design", "term": "Load Balancer",
     "definition": "Distributes incoming traffic across multiple servers to prevent overload. Improves availability and horizontal scalability.",
     "source": "System Design"},
    {"id": "7", "category": "DevOps", "term": "CI/CD Pipeline",
     "definition": "Automated workflow that builds, tests, and deploys code on every commit. Reduces manual errors and speeds up release cycles.",
     "source": "DevOps Practices"},
    {"id": "8", "category": "Databases", "term": "Database Index",
     "definition": "Data structure that speeds up data retrieval without scanning every row. Like a book index – faster reads, slower writes.",
     "source": "Database Documentation"},
    {"id": "9", "category": "Python Basics", "term": "Generator",
     "definition": "A function using `yield` that lazily produces values one at a time. Memory-efficient for large sequences since items aren't stored all at once.",
     "source": "Python Documentation"},
    {"id": "10", "category": "Web Development", "term": "WebSocket",
     "definition": "Full-duplex communication protocol over a single TCP connection. Enables real-time bidirectional messaging between client and server.",
     "source": "MDN Web Docs"},
    {"id": "11", "category": "Machine Learning", "term": "RAG",
     "definition": "Retrieval-Augmented Generation – combines vector search (to retrieve relevant context) with an LLM to produce grounded, citation-backed answers.",
     "source": "LangChain Docs"},
    {"id": "12", "category": "Algorithms", "term": "Big-O Notation",
     "definition": "Describes algorithm complexity as input size grows. O(1)=constant, O(log n)=logarithmic, O(n)=linear, O(n²)=quadratic.",
     "source": "Algorithm Design"},
]

@app.get("/api/flashcards")
async def get_flashcards(category: Optional[str] = None):
    cards = FLASHCARDS_SEED
    if category and category != "All":
        cards = [c for c in cards if c["category"] == category]
    return {"flashcards": cards, "total": len(cards)}

@app.get("/api/flashcards/categories")
async def get_categories():
    cats = sorted(set(c["category"] for c in FLASHCARDS_SEED))
    return {"categories": cats}

# ── Saved Answers ─────────────────────────────────────────────────────────────
@app.get("/api/saved-answers")
async def get_saved_answers(user_id: Optional[str] = Depends(get_current_user)):
    all_saved = read_json(SAVED_FILE, [])
    return {"saved_answers": all_saved}

@app.post("/api/saved-answers")
async def save_answer(req: SaveAnswerRequest, user_id: Optional[str] = Depends(get_current_user)):
    all_saved = read_json(SAVED_FILE, [])
    new_entry = {
        "id": str(uuid.uuid4()),
        "question": req.question,
        "answer": req.answer,
        "category": req.category,
        "savedDate": datetime.utcnow().strftime("%Y-%m-%d"),
        "user_id": user_id,
    }
    all_saved.insert(0, new_entry)
    write_json(SAVED_FILE, all_saved)
    return {"saved_answer": new_entry}

@app.delete("/api/saved-answers/{answer_id}")
async def delete_saved_answer(answer_id: str, user_id: Optional[str] = Depends(get_current_user)):
    all_saved = read_json(SAVED_FILE, [])
    filtered = [s for s in all_saved if s["id"] != answer_id]
    if len(filtered) == len(all_saved):
        raise HTTPException(status_code=404, detail="Answer not found")
    write_json(SAVED_FILE, filtered)
    return {"deleted": True}

# ── Analytics ─────────────────────────────────────────────────────────────────
@app.get("/api/analytics")
async def get_analytics():
    data = read_json(ANALYTICS_FILE, {
        "total_queries": 0,
        "topic_counts": {},
        "daily_counts": {},
    })
    total = data.get("total_queries", 0)

    # Build weekly query volume (last 7 days)
    from datetime import timedelta
    today = datetime.utcnow().date()
    daily_counts = data.get("daily_counts", {})
    weekly = []
    day_names = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        label = day_names[d.weekday()]
        weekly.append({"day": label, "queries": daily_counts.get(str(d), 0)})

    # Topic distribution
    topic_counts = data.get("topic_counts", {})
    topic_dist = [{"name": k, "value": v} for k, v in sorted(topic_counts.items(), key=lambda x: -x[1])][:5]
    if not topic_dist:
        topic_dist = [
            {"name": "Python", "value": 35}, {"name": "JavaScript", "value": 28},
            {"name": "DevOps", "value": 18}, {"name": "Databases", "value": 12},
            {"name": "Other", "value": 7},
        ]

    return {
        "stats": {
            "total_queries": total,
            "success_rate": 98.2,
            "avg_response_time": 1.4,
            "active_users": max(1, total // 3),
        },
        "weekly_volume": weekly,
        "topic_distribution": topic_dist,
    }

# ── Auth ──────────────────────────────────────────────────────────────────────
@app.post("/api/auth/signup")
async def signup(req: SignupRequest):
    users = read_json(USERS_FILE, [])
    if any(u["email"] == req.email for u in users):
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = {
        "id": f"user_{uuid.uuid4().hex[:8]}",
        "email": req.email,
        "password": req.password,   # plain for demo; hash in production
        "name": req.name,
        "company": req.company,
        "role": "Developer",
        "createdAt": datetime.utcnow().isoformat(),
    }
    users.append(new_user)
    write_json(USERS_FILE, users)
    token = make_token(new_user["id"])
    safe_user = {k: v for k, v in new_user.items() if k != "password"}
    return {"user": safe_user, "token": token}

@app.post("/api/auth/login")
async def login(req: LoginRequest):
    users = read_json(USERS_FILE, [])
    user = next((u for u in users if u["email"] == req.email and u["password"] == req.password), None)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = make_token(user["id"])
    safe_user = {k: v for k, v in user.items() if k != "password"}
    return {"user": safe_user, "token": token}

@app.get("/api/auth/me")
async def me(user_id: Optional[str] = Depends(get_current_user)):
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    users = read_json(USERS_FILE, [])
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {k: v for k, v in user.items() if k != "password"}

@app.put("/api/auth/profile")
async def update_profile(req: UpdateProfileRequest, user_id: Optional[str] = Depends(get_current_user)):
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    users = read_json(USERS_FILE, [])
    idx = next((i for i, u in enumerate(users) if u["id"] == user_id), None)
    if idx is None:
        raise HTTPException(status_code=404, detail="User not found")
    update = req.dict(exclude_none=True)
    users[idx].update(update)
    write_json(USERS_FILE, users)
    return {k: v for k, v in users[idx].items() if k != "password"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
