"""
Configuration for EcoMind AI application.
Loads environment variables with proper defaults.
"""

import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Application configuration.
    
    All values are read from environment variables.
    See .env.example for template.
    """
    
    # API Configuration
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./carbon_db.sqlite")
    
    # Environment
    environment: str = os.getenv("ENVIRONMENT", "development")
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # CORS
    cors_origins: list = ["http://localhost:5173", "http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    def validate_api_key(self) -> bool:
        """Check if Gemini API key is configured."""
        return bool(self.gemini_api_key)

# Create settings instance
settings = Settings()

# Validate on startup
if not settings.validate_api_key():
    import logging
    logger = logging.getLogger(__name__)
    logger.warning("⚠️  GEMINI_API_KEY not set. Chat features will be limited.")
