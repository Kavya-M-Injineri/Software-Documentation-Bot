# DevDoc AI Documentation Bot

A **Retrieval-Augmented Generation (RAG)** documentation assistant built with React + FastAPI.

## Quick Start

### 1. Backend Setup

```powershell
# From project root
python -m venv backend\venv
backend\venv\Scripts\activate
pip install -r backend\requirements.txt

# Copy and configure env
copy backend\.env.example backend\.env
# Edit backend\.env and add your GOOGLE_API_KEY (from AI Studio)

# (Optional) Ingest guidelines and survey data into vector DB
python backend\ingest.py

# Start the backend
python -m uvicorn backend.main:app --reload --port 8000
```

### 2. Frontend Setup

```powershell
# In a new terminal
npm install   # or pnpm install
npm run dev
```

Visit **http://localhost:5173**

---

## Features

| Feature | Backed by |
|---|---|
| 💬 AI Chat | FastAPI + Google Gemini 2.0-Flash + FAISS |
| 🃏 Flashcards | FastAPI `/api/flashcards` |
| 🔖 Saved Answers | FastAPI `/api/saved-answers` (JSON file) |
| 📊 Analytics | FastAPI `/api/analytics` (live query tracking) |
| 🔐 Auth | FastAPI `/api/auth/login` + `/api/auth/signup` |

## Deployment

- **Frontend** → Deploy to [Vercel](https://vercel.com).
- **Backend** → Deploy to [Render](https://render.com). Set `GOOGLE_API_KEY` as an environment variable.

## Environment Variables

Create `backend/.env`:

```
GOOGLE_API_KEY=AIzaSy...
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret
```

## Project Structure

```
DevDoc AI Documentation Bot/
├── backend/
│   ├── main.py          # FastAPI server
│   ├── ingest.py        # Embed Guidelines.md into ChromaDB
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── render.yaml      # Render deployment config
│   └── vector_db/       # Auto-created after ingestion
├── guidelines/
│   └── Guidelines.md    # Knowledge source
├── src/
│   └── app/
│       ├── components/  # React pages
│       └── contexts/    # AuthContext
└── vite.config.ts       # Proxies /api → localhost:8000
```