"""
Firebase Authentication Service.
Handles Firebase Admin SDK initialization and token verification.
"""

import firebase_admin
from firebase_admin import credentials, auth
from typing import Optional, Dict, Any
import logging
import os
from app.core.config import settings

logger = logging.getLogger(__name__)


class FirebaseAuthService:
    """Firebase Authentication Service for token verification and user management."""

    _instance = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FirebaseAuthService, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not self._initialized:
            self._initialize_firebase()
            self._initialized = True

    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK."""
        try:
            if not firebase_admin._apps:
                # Check if service account key file exists
                if hasattr(
                        settings,
                        'firebase_service_account_path') and settings.firebase_service_account_path:
                    if os.path.exists(settings.firebase_service_account_path):
                        cred = credentials.Certificate(
                            settings.firebase_service_account_path)
                        firebase_admin.initialize_app(cred)
                        logger.info(
                            "Firebase initialized with service account file")
                    else:
                        logger.warning(
                            "Service account file not found: {settings.firebase_service_account_path}"
                        )
                        self._initialize_with_env_vars()
                else:
                    self._initialize_with_env_vars()
            else:
                logger.info("Firebase already initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {str(e)}")
            raise

    def _initialize_with_env_vars(self):
        """Initialize Firebase with environment variables."""
        try:
            # Initialize with environment variables
            firebase_config = {
                "type": "service_account",
                "project_id": settings.firebase_project_id,
                "private_key_id": settings.firebase_private_key_id,
                "private_key": settings.firebase_private_key.replace(
                    '\\n',
                    '\n'),
                "client_email": settings.firebase_client_email,
                "client_id": settings.firebase_client_id,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{settings.firebase_client_email}"
            }

            cred = credentials.Certificate(firebase_config)
            firebase_admin.initialize_app(cred)
            logger.info("Firebase initialized with environment variables")
        except Exception as e:
            logger.error(
                f"Failed to initialize Firebase with env vars: {str(e)}")
            # Fallback to default credentials (useful for GCP deployment)
            try:
                cred = credentials.ApplicationDefault()
                firebase_admin.initialize_app(cred)
                logger.info("Firebase initialized with default credentials")
            except Exception as default_error:
                logger.error(
                    f"Failed to initialize with default credentials: {str(default_error)}")
                raise

    def verify_id_token(self, id_token: str) -> Optional[Dict[str, Any]]:
        """
        Verify Firebase ID token and return decoded token.

        Args:
            id_token: Firebase ID token to verify

        Returns:
            Decoded token dictionary or None if invalid
        """
        try:
            decoded_token = auth.verify_id_token(id_token)
            logger.info(f"Token verified for user: {decoded_token.get('uid')}")
            return decoded_token
        except auth.InvalidIdTokenError:
            logger.warning("Invalid ID token provided")
            return None
        except auth.ExpiredIdTokenError:
            logger.warning("Expired ID token provided")
            return None
        except Exception as e:
            logger.error(f"Error verifying ID token: {str(e)}")
            return None

    def get_user(self, uid: str) -> Optional[auth.UserRecord]:
        """
        Get user record by UID.

        Args:
            uid: Firebase user UID

        Returns:
            UserRecord or None if not found
        """
        try:
            user = auth.get_user(uid)
            logger.info(f"User retrieved: {uid}")
            return user
        except auth.UserNotFoundError:
            logger.warning(f"User not found: {uid}")
            return None
        except Exception as e:
            logger.error(f"Error getting user {uid}: {str(e)}")
            return None

    def get_user_by_email(self, email: str) -> Optional[auth.UserRecord]:
        """
        Get user record by email.

        Args:
            email: User email address

        Returns:
            UserRecord or None if not found
        """
        try:
            user = auth.get_user_by_email(email)
            logger.info(f"User retrieved by email: {email}")
            return user
        except auth.UserNotFoundError:
            logger.warning(f"User not found by email: {email}")
            return None
        except Exception as e:
            logger.error(f"Error getting user by email {email}: {str(e)}")
            return None

    def get_user_by_phone(self,
                          phone_number: str) -> Optional[auth.UserRecord]:
        """
        Get user record by phone number.

        Args:
            phone_number: User phone number

        Returns:
            UserRecord or None if not found
        """
        try:
            user = auth.get_user_by_phone_number(phone_number)
            logger.info(f"User retrieved by phone: {phone_number}")
            return user
        except auth.UserNotFoundError:
            logger.warning(f"User not found by phone: {phone_number}")
            return None
        except Exception as e:
            logger.error(
                f"Error getting user by phone {phone_number}: {str(e)}")
            return None


# Singleton instance
firebase_auth_service = FirebaseAuthService()
