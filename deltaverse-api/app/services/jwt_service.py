"""
JWT Token Service.
Handles creation and verification of JWT tokens for application authentication.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
import logging

from core.config import settings
from models.auth import UserInfo

logger = logging.getLogger(__name__)


class JWTService:
    """JWT Token Service for creating and verifying tokens."""

    def __init__(self):
        self.secret_key = settings.jwt_secret_key
        self.algorithm = settings.jwt_algorithm
        self.access_token_expire_minutes = settings.jwt_access_token_expire_minutes
        self.temp_token_expire_minutes = settings.jwt_temp_token_expire_minutes

    def create_access_token(self, user_info: UserInfo) -> str:
        """
        Create JWT access token for authenticated user.

        Args:
            user_info: User information to encode in token

        Returns:
            JWT access token string
        """
        try:
            now = datetime.utcnow()
            expire = now + timedelta(minutes=self.access_token_expire_minutes)

            payload = {
                "user_info": user_info.model_dump(),
                "token_type": "access",
                "exp": int(expire.timestamp()),
                "iat": int(now.timestamp()),
                "sub": user_info.uid
            }

            token = jwt.encode(
                payload,
                self.secret_key,
                algorithm=self.algorithm)
            logger.info(f"Access token created for user: {user_info.uid}")
            return token

        except Exception as e:
            logger.error(f"Error creating access token: {str(e)}")
            raise

    def create_temp_token(
            self,
            uid: str,
            purpose: str = "otp_verification") -> str:
        """
        Create temporary JWT token for OTP verification or similar purposes.

        Args:
            uid: User UID
            purpose: Purpose of the temporary token

        Returns:
            JWT temporary token string
        """
        try:
            now = datetime.utcnow()
            expire = now + timedelta(minutes=self.temp_token_expire_minutes)

            payload = {
                "uid": uid,
                "token_type": "temp",
                "purpose": purpose,
                "exp": int(expire.timestamp()),
                "iat": int(now.timestamp()),
                "sub": uid
            }

            token = jwt.encode(
                payload,
                self.secret_key,
                algorithm=self.algorithm)
            logger.info(
                f"Temporary token created for user: {uid}, purpose: {purpose}")
            return token

        except Exception as e:
            logger.error(f"Error creating temporary token: {str(e)}")
            raise

    def verify_access_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Verify and decode JWT access token.

        Args:
            token: JWT token to verify

        Returns:
            Decoded token payload or None if invalid
        """
        try:
            payload = jwt.decode(
                token, self.secret_key, algorithms=[
                    self.algorithm])

            # Check if it's an access token
            if payload.get("token_type") != "access":
                logger.warning("Token is not an access token")
                return None

            # Check expiration (JWT library handles this automatically, but we
            # can add extra validation)
            exp = payload.get("exp")
            if exp and exp < int(datetime.utcnow().timestamp()):
                logger.warning("Token has expired")
                return None

            logger.info(
                f"Access token verified for user: {payload.get('sub')}")
            return payload

        except JWTError as e:
            logger.warning(f"JWT verification failed: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error verifying access token: {str(e)}")
            return None

    def verify_temp_token(
            self, token: str, expected_purpose: str = None) -> Optional[Dict[str, Any]]:
        """
        Verify and decode JWT temporary token.

        Args:
            token: JWT token to verify
            expected_purpose: Expected purpose of the token

        Returns:
            Decoded token payload or None if invalid
        """
        try:
            payload = jwt.decode(
                token, self.secret_key, algorithms=[
                    self.algorithm])

            # Check if it's a temporary token
            if payload.get("token_type") != "temp":
                logger.warning("Token is not a temporary token")
                return None

            # Check purpose if specified
            if expected_purpose and payload.get("purpose") != expected_purpose:
                logger.warning(
                    f"Token purpose mismatch. Expected: {expected_purpose}, Got: {payload.get('purpose')}")
                return None

            # Check expiration
            exp = payload.get("exp")
            if exp and exp < int(datetime.utcnow().timestamp()):
                logger.warning("Temporary token has expired")
                return None

            logger.info(
                f"Temporary token verified for user: {payload.get('sub')}")
            return payload

        except JWTError as e:
            logger.warning(f"JWT verification failed: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error verifying temporary token: {str(e)}")
            return None

    def get_user_from_token(self, token: str) -> Optional[UserInfo]:
        """
        Extract user information from access token.

        Args:
            token: JWT access token

        Returns:
            UserInfo object or None if invalid
        """
        try:
            payload = self.verify_access_token(token)
            if not payload:
                return None

            user_data = payload.get("user_info")
            if not user_data:
                logger.warning("No user info found in token")
                return None

            return UserInfo(**user_data)

        except Exception as e:
            logger.error(f"Error extracting user from token: {str(e)}")
            return None


# Singleton instance
jwt_service = JWTService()
