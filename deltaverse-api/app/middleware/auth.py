"""
Authentication middleware and dependencies.
Provides JWT token verification and user authentication for protected routes.
"""

from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import logging

from app.services.jwt_service import jwt_service
from app.models.auth import UserInfo

logger = logging.getLogger(__name__)

# HTTP Bearer token scheme
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> UserInfo:
    """
    Dependency to get current authenticated user from JWT token.

    Args:
        credentials: HTTP Bearer credentials

    Returns:
        UserInfo object for authenticated user

    Raises:
        HTTPException: If token is invalid or missing
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    user_info = jwt_service.get_user_from_token(token)

    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    logger.info(f"User authenticated: {user_info.uid}")
    return user_info


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[UserInfo]:
    """
    Optional dependency to get current user (doesn't raise exception if not authenticated).

    Args:
        credentials: HTTP Bearer credentials

    Returns:
        UserInfo object if authenticated, None otherwise
    """
    if not credentials:
        return None

    token = credentials.credentials
    user_info = jwt_service.get_user_from_token(token)

    if user_info:
        logger.info(f"User optionally authenticated: {user_info.uid}")

    return user_info


def verify_temp_token(
        token: str,
        purpose: str = "otp_verification") -> Optional[str]:
    """
    Verify temporary token and return user UID.

    Args:
        token: Temporary JWT token
        purpose: Expected purpose of the token

    Returns:
        User UID if token is valid, None otherwise
    """
    payload = jwt_service.verify_temp_token(token, purpose)
    if payload:
        return payload.get("uid")
    return None


class AuthenticationError(Exception):
    """Custom exception for authentication errors."""
    pass


class TokenExpiredError(AuthenticationError):
    """Exception raised when token has expired."""
    pass


class InvalidTokenError(AuthenticationError):
    """Exception raised when token is invalid."""
    pass
