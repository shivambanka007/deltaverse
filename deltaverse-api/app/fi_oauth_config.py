"""
Fi Money OAuth Configuration
Production-ready OAuth 2.0 integration with Fi Money
"""

import os
import secrets
import hashlib
from typing import Optional

class FiOAuthSettings:
    """Fi Money OAuth Configuration"""
    
    def __init__(self):
        # Fi Money OAuth Credentials
        self.FI_MONEY_CLIENT_ID = os.getenv("FI_MONEY_CLIENT_ID", "deltaverse_client_id")
        self.FI_MONEY_CLIENT_SECRET = os.getenv("FI_MONEY_CLIENT_SECRET", "deltaverse_client_secret")
        
        # Fi Money API URLs
        self.FI_MONEY_BASE_URL = os.getenv("FI_MONEY_BASE_URL", "https://api.fi.money")
        self.FI_MONEY_OAUTH_URL = os.getenv("FI_MONEY_OAUTH_URL", "https://auth.fi.money/oauth/authorize")
        self.FI_MONEY_TOKEN_URL = os.getenv("FI_MONEY_TOKEN_URL", "https://api.fi.money/oauth/token")
        
        # Redirect URIs
        self.FI_MONEY_REDIRECT_URI = os.getenv("FI_MONEY_REDIRECT_URI", "http://localhost:3000/auth/fi/callback")
        
        # OAuth Scopes
        self.FI_MONEY_SCOPES = "read:accounts,read:transactions,read:investments,read:networth"
        
        # Security
        self.ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", "")
        
        # Session Management
        self.SESSION_SECRET_KEY = os.getenv("SESSION_SECRET_KEY", secrets.token_urlsafe(32))

# Global settings instance
fi_oauth_settings = FiOAuthSettings()

def generate_oauth_state() -> str:
    """Generate secure OAuth state parameter"""
    return secrets.token_urlsafe(32)

def generate_pkce_challenge() -> tuple[str, str]:
    """Generate PKCE code verifier and challenge for enhanced security"""
    code_verifier = secrets.token_urlsafe(32)
    code_challenge = hashlib.sha256(code_verifier.encode()).hexdigest()
    return code_verifier, code_challenge

def build_fi_oauth_url(state: str, code_challenge: Optional[str] = None) -> str:
    """Build Fi Money OAuth authorization URL"""
    params = {
        "client_id": fi_oauth_settings.FI_MONEY_CLIENT_ID,
        "redirect_uri": fi_oauth_settings.FI_MONEY_REDIRECT_URI,
        "response_type": "code",
        "scope": fi_oauth_settings.FI_MONEY_SCOPES,
        "state": state
    }
    
    # Add PKCE if provided
    if code_challenge:
        params["code_challenge"] = code_challenge
        params["code_challenge_method"] = "S256"
    
    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    return f"{fi_oauth_settings.FI_MONEY_OAUTH_URL}?{query_string}"

def validate_fi_oauth_config() -> bool:
    """Validate Fi Money OAuth configuration"""
    required_fields = [
        fi_oauth_settings.FI_MONEY_CLIENT_ID,
        fi_oauth_settings.FI_MONEY_CLIENT_SECRET,
        fi_oauth_settings.FI_MONEY_BASE_URL,
        fi_oauth_settings.FI_MONEY_OAUTH_URL,
        fi_oauth_settings.FI_MONEY_TOKEN_URL,
        fi_oauth_settings.FI_MONEY_REDIRECT_URI
    ]
    
    return all(field and field != "your_value_here" for field in required_fields)

# Export settings
__all__ = [
    "fi_oauth_settings",
    "generate_oauth_state", 
    "generate_pkce_challenge",
    "build_fi_oauth_url",
    "validate_fi_oauth_config"
]
