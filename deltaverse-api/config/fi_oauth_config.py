from typing import Optional
from pydantic_settings import BaseSettings

class FiOAuthSettings(BaseSettings):
    client_id: str = "test-client-id"
    client_secret: str = "test-client-secret"
    redirect_uri: str = "http://localhost:3000/callback"
    auth_url: str = "http://localhost:8080/auth"
    token_url: str = "http://localhost:8080/token"

fi_oauth_settings = FiOAuthSettings()

def validate_fi_oauth_config() -> bool:
    """Validate Fi OAuth configuration"""
    return bool(fi_oauth_settings.client_id and fi_oauth_settings.client_secret)
