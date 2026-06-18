"""Shared FastAPI dependencies."""

from typing import Optional

from fastapi import Request

from app.gemini_ai import GeminiClient


def get_gemini_client(request: Request) -> Optional[GeminiClient]:
    """Return the Gemini client stored on application state."""
    return request.app.state.gemini_client
