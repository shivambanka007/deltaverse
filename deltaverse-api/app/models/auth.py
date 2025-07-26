"""
Authentication models for Firebase integration.
Defines request/response models for mobile OTP and Google login.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime


class PhoneOTPRequest(BaseModel):
    """Request model for sending OTP to phone number."""
    phone_number: str = Field(...,
                              description="Phone number in international format (+1234567890)")
    recaptcha_token: Optional[str] = Field(
        None, description="reCAPTCHA token for verification")


class VerifyOTPRequest(BaseModel):
    """Request model for verifying OTP code."""
    id_token: str = Field(...,
                          description="Firebase ID token after OTP verification")


class GoogleLoginRequest(BaseModel):
    """Request model for Google authentication."""
    id_token: str = Field(...,
                          description="Google ID token from Firebase Auth")


class GoogleOTPLoginRequest(BaseModel):
    """Request model for Google login with additional OTP verification."""
    id_token: str = Field(...,
                          description="Google ID token from Firebase Auth")
    phone_number: Optional[str] = Field(
        None, description="Phone number for OTP verification")


class UserInfo(BaseModel):
    """User information model."""
    uid: str
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None
    provider: str
    email_verified: Optional[bool] = None
    created_at: Optional[datetime] = None


class AuthResponse(BaseModel):
    """Response model for successful authentication."""
    access_token: str
    token_type: str = "bearer"
    user_info: UserInfo
    expires_in: int = 3600
    user_data: Optional[Dict[str, Any]] = None


class TempAuthResponse(BaseModel):
    """Response model for temporary authentication requiring OTP."""
    message: str
    temp_token: str
    phone_number: Optional[str] = None
    requires_otp: bool = True
    expires_in: int = 600  # 10 minutes


class ErrorResponse(BaseModel):
    """Error response model."""
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None


class SuccessResponse(BaseModel):
    """Generic success response model."""
    message: str
    status: str = "success"
    data: Optional[Dict[str, Any]] = None
