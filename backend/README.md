# EcoMind AI Backend

This is the FastAPI backend for EcoMind AI, a carbon footprint awareness platform powered by AI.

## Quick Start

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GEMINI_API_KEY="your-key-here"

# Run tests
pytest tests/

# Start server
python run.py
```

Server runs on http://localhost:8000
API docs available at http://localhost:8000/docs

## Architecture

- **FastAPI**: Modern async web framework
- **SQLAlchemy**: Database ORM
- **Gemini AI**: Natural language processing
- **Carbon Engine**: Deterministic emission calculations

## Key Modules

- `main.py`: API endpoints
- `carbon_engine.py`: Calculation logic
- `gemini_ai.py`: AI integration
- `database.py`: Data models
- `models.py`: Request/response schemas

See main README for full documentation.
