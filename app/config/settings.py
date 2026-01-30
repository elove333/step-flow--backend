"""Application settings."""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings."""
    
    # API Settings
    app_name: str = "Step-Flow Backend"
    app_version: str = "1.0.0"
    port: int = 8000
    
    # Database Settings
    mongodb_uri: str = "mongodb://localhost:27017"
    database_name: str = "stepflow"
    
    # AI Engine Settings
    ai_engine_url: str = "http://localhost:5000"
    ai_engine_timeout: int = 30
    
    # CORS Settings
    allowed_origins: str = "*"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
