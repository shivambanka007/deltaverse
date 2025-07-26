"""
Services package for Deltaverse API.
Contains business logic and external service integrations.
"""

# Import services with error handling to prevent startup failures
try:
    from .jwt_service import JWTService
except ImportError as e:
    print(f"Warning: Could not import JWTService: {e}")
    JWTService = None

try:
    from .user_service import UserService
except ImportError as e:
    print(f"Warning: Could not import UserService: {e}")
    UserService = None

try:
    from .gemini_service import gemini_service
except ImportError as e:
    print(f"Warning: Could not import gemini_service: {e}")
    gemini_service = None

# Only export successfully imported services
__all__ = []
if JWTService:
    __all__.append("JWTService")
if UserService:
    __all__.append("UserService")
if gemini_service:
    __all__.append("gemini_service")
