"""
Application configuration from environment variables.
"""

import os
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_FILE_PATH = os.path.join(BASE_DIR, ".env")

class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=ENV_FILE_PATH, case_sensitive=False)

    gemini_api_key: str = ""
    database_url: str = "sqlite:///./carbon_db.sqlite"
    environment: str = "development"
    debug: bool = False

    def __init__(self, **data):
        super().__init__(**data)
        # Fallback to OS environment if pydantic-settings didn't pick it up
        if not self.gemini_api_key:
            self.gemini_api_key = os.getenv("GEMINI_API_KEY", "")
        # Strip literal quotes that might be parsed incorrectly
        if self.gemini_api_key:
            self.gemini_api_key = self.gemini_api_key.strip('"').strip("'")

settings = Settings()
