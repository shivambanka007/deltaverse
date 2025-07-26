"""
Firebase Authentication Middleware
Verifies Firebase ID tokens and extracts user information
"""

from fastapi import Depends, HTTPException, Header, Request
from firebase_admin import auth
import logging
from typing import Optional, Dict, Any
import json

logger = logging.getLogger(__name__)

class FirebaseAuthMiddleware:
    """Firebase authentication middleware for FastAPI"""
    
    def __init__(self):
        self.excluded_paths = {
            "/health",
            "/docs",
            "/openapi.json",
            "/redoc",
            "/api/v1/fi/scenarios",  # Public endpoint for scenario listing
        }
    
    async def verify_firebase_token(self, authorization: str = Header(None)) -> str:
        """
        Verify Firebase ID token and return Firebase user ID
        
        Args:
            authorization: Authorization header with Bearer token
            
        Returns:
            str: Firebase user ID (uid)
            
        Raises:
            HTTPException: If token is invalid or missing
        """
        if not authorization:
            raise HTTPException(
                status_code=401, 
                detail="Missing Authorization header"
            )
        
        if not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=401, 
                detail="Invalid Authorization header format. Expected: Bearer <token>"
            )
        
        id_token = authorization.split("Bearer ")[1].strip()
        
        if not id_token:
            raise HTTPException(
                status_code=401, 
                detail="Missing Firebase ID token"
            )
        
        try:
            # Verify the ID token with Firebase Admin SDK
            decoded_token = auth.verify_id_token(id_token)
            firebase_user_id = decoded_token.get('uid')
            
            if not firebase_user_id:
                raise HTTPException(
                    status_code=401, 
                    detail="Invalid token: missing user ID"
                )
            
            logger.info(f"Authenticated Firebase user: {firebase_user_id}")
            return firebase_user_id
            
        except auth.InvalidIdTokenError as e:
            logger.error(f"Invalid Firebase ID token: {e}")
            raise HTTPException(
                status_code=401, 
                detail="Invalid Firebase ID token"
            )
        except auth.ExpiredIdTokenError as e:
            logger.error(f"Expired Firebase ID token: {e}")
            raise HTTPException(
                status_code=401, 
                detail="Expired Firebase ID token. Please sign in again."
            )
        except Exception as e:
            logger.error(f"Firebase token verification error: {e}")
            raise HTTPException(
                status_code=401, 
                detail="Authentication failed"
            )
    
    async def get_user_info(self, authorization: str = Header(None)) -> Dict[str, Any]:
        """
        Get complete user information from Firebase token
        
        Returns:
            Dict containing user information
        """
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Missing or invalid authorization")
        
        id_token = authorization.split("Bearer ")[1].strip()
        
        try:
            decoded_token = auth.verify_id_token(id_token)
            
            user_info = {
                "firebase_user_id": decoded_token.get('uid'),
                "email": decoded_token.get('email'),
                "email_verified": decoded_token.get('email_verified', False),
                "name": decoded_token.get('name'),
                "picture": decoded_token.get('picture'),
                "auth_time": decoded_token.get('auth_time'),
                "iss": decoded_token.get('iss'),
                "aud": decoded_token.get('aud'),
                "exp": decoded_token.get('exp'),
                "iat": decoded_token.get('iat')
            }
            
            return user_info
            
        except Exception as e:
            logger.error(f"Error getting user info: {e}")
            raise HTTPException(status_code=401, detail="Failed to get user information")
    
    def is_excluded_path(self, path: str) -> bool:
        """Check if path should be excluded from authentication"""
        return path in self.excluded_paths or path.startswith("/static/")

# Global middleware instance
firebase_auth = FirebaseAuthMiddleware()

# Dependency functions for FastAPI
async def verify_firebase_user(authorization: str = Header(None)) -> str:
    """FastAPI dependency to verify Firebase user and return user ID"""
    return await firebase_auth.verify_firebase_token(authorization)

async def get_current_user(authorization: str = Header(None)) -> Dict[str, Any]:
    """FastAPI dependency to get current user information"""
    return await firebase_auth.get_user_info(authorization)

# Optional authentication (for endpoints that work with or without auth)
async def optional_firebase_user(authorization: str = Header(None)) -> Optional[str]:
    """FastAPI dependency for optional authentication"""
    if not authorization:
        return None
    
    try:
        return await firebase_auth.verify_firebase_token(authorization)
    except HTTPException:
        return None

# Development/Testing bypass (remove in production)
async def dev_bypass_auth() -> str:
    """Development bypass for testing without Firebase tokens"""
    logger.warning("Using development authentication bypass!")
    return "dev_user_123"

def create_test_user_dependency(test_user_id: str = "test_user"):
    """Create a test user dependency for development"""
    async def test_user():
        logger.warning(f"Using test user: {test_user_id}")
        return test_user_id
    return test_user
