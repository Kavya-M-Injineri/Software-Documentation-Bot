"""
DevDoc AI – FastAPI Backend
Startup script for Windows
"""
import subprocess
import sys
from pathlib import Path

if __name__ == "__main__":
    backend_dir = Path(__file__).parent
    subprocess.run(
        [sys.executable, "-m", "uvicorn", "backend.main:app", "--reload", "--port", "8000"],
        cwd=backend_dir.parent,
    )
