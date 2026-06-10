import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application configuration from environment variables."""
    
    gemini_api_key: str = ""
    database_url: str = "sqlite:///./carbon_db.sqlite"
    environment: str = "development"
    debug: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = False
    
    def __init__(self, **data):
        super().__init__(**data)
        # Fallback to environment variable if not set
        if not self.gemini_api_key:
            self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")

settings = Settings()
