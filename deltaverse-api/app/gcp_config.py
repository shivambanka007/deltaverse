"""
Unified Google Cloud Platform authentication configuration.
Provides consistent authentication for Firestore, Pub/Sub, and other GCP services.
"""

import os
import json
import logging
from typing import Optional, Dict, Any
from google.oauth2 import service_account
from google.auth import credentials as auth_credentials

logger = logging.getLogger(__name__)

class GCPAuthConfig:
    """Centralized GCP authentication configuration."""
    
    def __init__(self):
        self.project_id = os.getenv("GCP_PROJECT_ID", "opportune-scope-466406-p6")
        self.credentials = None
        self._initialize_credentials()
    
    def _initialize_credentials(self) -> None:
        """Initialize GCP credentials using the same method as Firebase."""
        try:
            # Try multiple service account file locations (same as firebase_config.py)
            possible_paths = [
                # Environment-based filename
                os.path.join(os.path.dirname(__file__), f"{self.project_id}-firebase-adminsdk-fbsvc-584369e1bd.json"),
                # Generic filename
                os.path.join(os.path.dirname(__file__), "firebase-service-account.json"),
                # Original filename (fallback)
                os.path.join(os.path.dirname(__file__), "opportune-scope-466406-p6-firebase-adminsdk-fbsvc-584369e1bd.json"),
                # Environment variable path
                os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")
            ]
            
            cred_path = None
            for path in possible_paths:
                if path and os.path.exists(path):
                    cred_path = path
                    break
            
            if not cred_path:
                logger.error(f"GCP service account file not found. Tried paths: {possible_paths}")
                raise FileNotFoundError(
                    f"GCP service account file not found. Tried paths: {possible_paths}"
                )
            
            logger.info(f"Using GCP service account: {cred_path}")
            
            # Load credentials from service account file
            if cred_path.startswith('{'):
                # JSON string (for environment variables)
                cred_dict = json.loads(cred_path)
                self.credentials = service_account.Credentials.from_service_account_info(cred_dict)
            else:
                # File path
                self.credentials = service_account.Credentials.from_service_account_file(cred_path)
            
            logger.info("✅ GCP credentials initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize GCP credentials: {e}")
            self.credentials = None
    
    def get_credentials(self) -> Optional[auth_credentials.Credentials]:
        """Get GCP credentials for authentication."""
        return self.credentials
    
    def get_project_id(self) -> str:
        """Get GCP project ID."""
        return self.project_id
    
    def is_authenticated(self) -> bool:
        """Check if GCP authentication is properly configured."""
        return self.credentials is not None
    
    def get_credentials_info(self) -> Dict[str, Any]:
        """Get information about the current credentials."""
        if not self.credentials:
            return {
                "authenticated": False,
                "project_id": self.project_id,
                "service_account_email": None,
                "error": "Credentials not initialized"
            }
        
        try:
            return {
                "authenticated": True,
                "project_id": self.project_id,
                "service_account_email": getattr(self.credentials, 'service_account_email', 'unknown'),
                "token_uri": getattr(self.credentials, 'token_uri', 'unknown')
            }
        except Exception as e:
            return {
                "authenticated": False,
                "project_id": self.project_id,
                "service_account_email": None,
                "error": str(e)
            }

# Global instance
_gcp_auth_config = None

def get_gcp_auth_config() -> GCPAuthConfig:
    """Get the global GCP authentication configuration instance."""
    global _gcp_auth_config
    if _gcp_auth_config is None:
        _gcp_auth_config = GCPAuthConfig()
    return _gcp_auth_config

def get_gcp_credentials() -> Optional[auth_credentials.Credentials]:
    """Convenience function to get GCP credentials."""
    return get_gcp_auth_config().get_credentials()

def get_gcp_project_id() -> str:
    """Convenience function to get GCP project ID."""
    return get_gcp_auth_config().get_project_id()

def is_gcp_authenticated() -> bool:
    """Convenience function to check if GCP is authenticated."""
    return get_gcp_auth_config().is_authenticated()
