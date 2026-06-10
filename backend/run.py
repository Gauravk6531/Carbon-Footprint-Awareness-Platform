"""
Startup script for EcoMind AI backend.
"""

import sys
import os
from pathlib import Path

# Add project to path
sys.path.insert(0, str(Path(__file__).parent))

if __name__ == "__main__":
    import uvicorn
    
    # Load environment
    from dotenv import load_dotenv
    load_dotenv()
    
    # Verify Gemini API key
    if not os.getenv("GEMINI_API_KEY"):
        print("⚠️  WARNING: GEMINI_API_KEY not set. Chat features will be limited.")
        print("   Set it: export GEMINI_API_KEY='your-key'")
    
    print("🌱 Starting EcoMind AI Backend...")
    print("📡 Running on http://localhost:8000")
    print("📚 API docs: http://localhost:8000/docs")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
