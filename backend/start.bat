@echo off
echo Starting DevDoc AI Backend...
cd /d "%~dp0.."
python -m uvicorn backend.main:app --reload --port 8000
