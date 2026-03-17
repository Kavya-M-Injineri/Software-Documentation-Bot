# DevDoc AI — RAG Documentation Assistant
......................................
A full-stack **Retrieval-Augmented Generation (RAG)** documentation chatbot. Users ask questions, and the system retrieves semantically relevant content from an embedded knowledge base before generating grounded answers via Google Gemini — eliminating hallucinations on domain-specific docs.

---

## Highlights

- Built a **RAG pipeline** using FAISS vector search + Google Gemini 2.0 Flash — ingests Markdown docs via `ingest.py`, embeds into a local vector DB, and retrieves relevant chunks at query time before LLM generation
- Implemented **JWT authentication** with signup/login endpoints, protected routes, and a React AuthContext for frontend session management
- Designed **live query analytics** tracking via a dedicated `/api/analytics` endpoint, persisting usage patterns without a heavy database
- Built **flashcard generation** and **saved answers** features on top of the same RAG backend, reusing retrieval infrastructure for multiple learning modes
- Configured **production deployment** with a `Dockerfile`, `render.yaml` for Render (backend), and Vercel-ready frontend with Vite proxy for seamless local/prod API routing

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, TypeScript |
| Backend | FastAPI, Uvicorn |
| LLM | Google Gemini 2.0 Flash |
| Vector DB | FAISS |
| Auth | JWT (python-jose) |
| Deployment | Render (backend), Vercel (frontend) |

---

## Architecture

```
Guidelines.md
    └── ingest.py          ← Embeds docs into FAISS vector DB
            └── vector_db/

User Query (React)
    └── /api/chat          ← Semantic search → top-k chunks → Gemini prompt
    └── /api/flashcards    ← RAG-generated flashcards
    └── /api/saved-answers ← Persisted Q&A (JSON store)
    └── /api/analytics     ← Live query tracking
    └── /api/auth/*        ← JWT signup / login
```

---

## Setup

### Prerequisites
- Python 3.10+, Node.js v18+
- Google Gemini API Key → [AI Studio](https://aistudio.google.com)

### Backend

```bash
python -m venv backend\venv
backend\venv\Scripts\activate
pip install -r backend\requirements.txt

copy backend\.env.example backend\.env
# Add GOOGLE_API_KEY, JWT_SECRET, FRONTEND_URL

python backend\ingest.py        # Embed docs into FAISS vector DB
python -m uvicorn backend.main:app --reload --port 8000
```

### Frontend

```bash
npm install
npm run dev
# Visit http://localhost:5173
# Vite proxies /api → localhost:8000
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register new user |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `POST` | `/api/chat` | RAG query → Gemini response |
| `GET` | `/api/flashcards` | Generate flashcards from docs |
| `GET/POST` | `/api/saved-answers` | Save and retrieve answers |
| `GET` | `/api/analytics` | Query usage stats |

---

## Environment Variables

```bash
GOOGLE_API_KEY=AIzaSy...
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret
```

---

## Deployment

- **Backend** → Render (`render.yaml` included) — set `GOOGLE_API_KEY` as env var
- **Frontend** → Vercel — set `VITE_API_URL` to your Render backend URL

---

## Project Structure

```
├── backend/
│   ├── main.py          # FastAPI app — all routes
│   ├── ingest.py        # Doc embedding pipeline → FAISS
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── render.yaml      # Render deployment config
│   └── vector_db/       # Auto-generated after ingestion
├── guidelines/
│   └── Guidelines.md    # Primary knowledge source
└── src/
    └── app/
        ├── components/  # Chat, Flashcards, Analytics UI
        └── contexts/    # AuthContext (JWT session)
```
