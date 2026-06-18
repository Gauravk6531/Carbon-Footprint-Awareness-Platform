"""FastAPI application factory and middleware configuration."""

import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.gemini_ai import GeminiClient
from app.rate_limit import chat_rate_limiter, client_ip
from app.routers import calculator, chat, pledges, what_if

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app.main")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    application = FastAPI(
        title="EcoMind AI",
        description="AI-powered Carbon Footprint Awareness Platform",
        version="1.0.0",
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )

    @application.middleware("http")
    async def rate_limit_chat(request: Request, call_next):
        """Apply rate limiting to chat endpoint to prevent API abuse."""
        if request.url.path == "/api/chat" and request.method == "POST":
            chat_rate_limiter.check(client_ip(request))
        return await call_next(request)

    @application.middleware("http")
    async def add_security_headers(request: Request, call_next):
        """Add standard security headers to all responses."""
        response = await call_next(request)
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "connect-src 'self' http://localhost:* https://carbon-footprint-awareness-platform-art3.onrender.com; "
            "img-src 'self' data:; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "media-src 'self' data:;"
        )
        return response

    try:
        application.state.gemini_client = GeminiClient()
    except ValueError:
        logger.warning("GEMINI_API_KEY environment variable is not set. Chat features will be limited.")
        application.state.gemini_client = None

    @application.get("/health")
    def health_check():
        """Health check endpoint."""
        return {
            "status": "ok",
            "app": "EcoMind AI",
            "version": "1.0.0",
            "gemini_available": application.state.gemini_client is not None,
        }

    application.include_router(calculator.router)
    application.include_router(chat.router)
    application.include_router(what_if.router)
    application.include_router(pledges.router)

    @application.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        """Custom HTTP exception handler — never leaks stack traces."""
        return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})

    return application


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
