"""
Application configuration from environment variables.
"""

import os
from pydantic_settings import BaseSettings
from pydantic import ConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    model_config = ConfigDict(env_file=".env", case_sensitive=False)

    gemini_api_key: str = ""
    database_url: str = "sqlite:///./carbon_db.sqlite"
    environment: str = "development"
    debug: bool = False

    def __init__(self, **data):
        super().__init__(**data)
        # Fallback to OS environment if pydantic-settings didn't pick it up
        if not self.gemini_api_key:
            self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")


settings = Settings()
