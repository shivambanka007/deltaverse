"""
Models package for Deltaverse API.
Contains Pydantic models for request/response validation.
"""

from .auth import (
    PhoneOTPRequest, 
    VerifyOTPRequest, 
    GoogleLoginRequest, 
    GoogleOTPLoginRequest, 
    UserInfo, 
    AuthResponse, 
    TempAuthResponse, 
    ErrorResponse as AuthErrorResponse, 
    SuccessResponse as AuthSuccessResponse
)
from .chat import (
    MessageRole, 
    ChatMessage, 
    ChatRequest, 
    ChatResponse, 
    ChatStreamChunk, 
    ConversationSummary, 
    ChatHealthCheck, 
    ErrorResponse as ChatErrorResponse
)
from .financial_health import (
    ScoreComponent, 
    Recommendation, 
    FinancialHealthScore
)
from .financial_health_history import (
    FinancialHealthHistory, 
    FinancialHealthDatabase
)
from .notifications import (
    PushMessage, 
    PushMessageResponse, 
    BulkPushMessage, 
    BulkPushMessageResponse
)

__all__ = [
    # Auth models
    "PhoneOTPRequest",
    "VerifyOTPRequest",
    "GoogleLoginRequest",
    "GoogleOTPLoginRequest",
    "UserInfo",
    "AuthResponse",
    "TempAuthResponse",
    "AuthErrorResponse",
    "AuthSuccessResponse",
    
    # Chat models
    "MessageRole",
    "ChatMessage",
    "ChatRequest",
    "ChatResponse",
    "ChatStreamChunk",
    "ConversationSummary",
    "ChatHealthCheck",
    "ChatErrorResponse",
    
    # Financial health models
    "ScoreComponent",
    "Recommendation",
    "FinancialHealthScore",
    
    # Financial health history models
    "FinancialHealthHistory",
    "FinancialHealthDatabase",
    
    # Notification models
    "PushMessage",
    "PushMessageResponse",
    "BulkPushMessage",
    "BulkPushMessageResponse",
]
