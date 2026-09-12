"""
RoadSafe India 360 - Production Web Runner
Honors $PORT and $HOST environment variables provided by cloud hosting platforms
(Render, Railway, Fly.io, Hugging Face Spaces, Koyeb).
"""

import os
import uvicorn
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("ENVIRONMENT", "production").lower() == "development"

    print(f"[*] Starting RoadSafe India 360 production server on {host}:{port}")
    uvicorn.run("backend.app.main:app", host=host, port=port, reload=reload)
