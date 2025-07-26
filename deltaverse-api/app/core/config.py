"""Configuration management for the API."""

import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings."""
    
    # Environment
    environment: str = os.getenv("ENVIRONMENT", "development")
    debug: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # API Settings
    api_v1_prefix: str = "/api/v1"
    
    # Server Settings
    host: str = "0.0.0.0"
    port: int = int(os.getenv("PORT", "8002"))
    
    # Fi-MCP Settings
    fi_mcp_url: str = os.getenv(
        "FI_MCP_URL",
        "http://localhost:8080" if environment == "development" else "https://fi-mcp-dev-1029461078184.us-central1.run.app"
    )
    
    # CORS Settings
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "https://opportune-scope-466406-p6.web.app",
        "https://opportune-scope-466406-p6.firebaseapp.com"
    ]
    
    # JWT Settings
    jwt_secret: str = os.getenv("JWT_SECRET", "development-secret-key")
    jwt_algorithm: str = "HS256"
    jwt_expiration: int = 30  # minutes
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()
