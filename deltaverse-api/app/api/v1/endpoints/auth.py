"""
Authentication endpoints for Firebase integration.
Handles mobile OTP, Google login, and combined authentication flows.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import Dict, Any
import logging
from datetime import datetime

from app.models.auth import (
    PhoneOTPRequest,
    VerifyOTPRequest,
    GoogleLoginRequest,
    GoogleOTPLoginRequest,
    AuthResponse,
    TempAuthResponse,
    SuccessResponse,
    ErrorResponse,
    UserInfo
)
from app.services.firebase_auth import firebase_auth_service
from app.services.jwt_service import jwt_service
from app.services.user_service import user_service
from app.middleware.auth import get_current_user, verify_temp_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/send-otp",
    response_model=SuccessResponse,
    summary="Send OTP to mobile number",
    description="Initiates OTP sending process via Firebase. The actual OTP is sent by Firebase on the client side."
)
async def send_mobile_otp(request: PhoneOTPRequest):
    """
    Send OTP to mobile number via Firebase.

    Note: Firebase handles OTP sending on the client side.
    This endpoint validates the request and can log the attempt.
    """
    try:
        # Validate phone number format
        if not request.phone_number.startswith('+'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number must be in international format (+1234567890)")

        logger.info("OTP request initiated for phone: {request.phone_number}")

        return SuccessResponse(
            message="OTP sending initiated. Please check your phone for the verification code.",
            data={
                "phone_number": request.phone_number})

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error in send_mobile_otp: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initiate OTP sending"
        )


@router.post(
    "/verify-otp",
    response_model=AuthResponse,
    summary="Verify OTP and authenticate user",
    description="Verifies the OTP code and returns authentication tokens."
)
async def verify_mobile_otp(request: VerifyOTPRequest):
    """
    Verify OTP and authenticate user.

    The client should have already verified the OTP with Firebase and received an ID token.
    This endpoint verifies the ID token and creates our application session.
    """
    try:
        # Verify the Firebase ID token
        decoded_token = firebase_auth_service.verify_id_token(request.id_token)

        # Create user info from decoded token
        user_info = UserInfo(
            uid=decoded_token['uid'],
            email=decoded_token.get('email'),
            phone_number=decoded_token.get('phone_number'),
            name=decoded_token.get('name'),
            picture=decoded_token.get('picture'),
            provider="phone",
            email_verified=decoded_token.get('email_verified', False),
            created_at=datetime.utcnow()
        )

        # Create or update user in Firestore
        user_data = await user_service.create_or_update_user(user_info)

        # Generate access token
        access_token = jwt_service.create_access_token(user_info)

        logger.info(
            "Phone OTP verification successful for user: {user_info.uid}"
        )

        return AuthResponse(
            access_token=access_token,
            user_info=user_info,
            expires_in=jwt_service.access_token_expire_minutes * 60,
            user_data=user_data
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error in verify_mobile_otp: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify OTP"
        )


@router.post(
    "/google-login",
    response_model=AuthResponse,
    summary="Google Sign-In authentication",
    description="Authenticates user with Google ID token and returns application tokens."
)
async def google_login(request: GoogleLoginRequest):
    """
    Authenticate user with Google ID token.

    The client should have already authenticated with Google and received an ID token.
    This endpoint verifies the token and creates our application session.
    """
    try:
        # Verify the Google ID token
        decoded_token = firebase_auth_service.verify_id_token(request.id_token)

        # Create user info from decoded token
        user_info = UserInfo(
            uid=decoded_token['uid'],
            email=decoded_token.get('email'),
            phone_number=decoded_token.get('phone_number'),
            name=decoded_token.get('name'),
            picture=decoded_token.get('picture'),
            provider="google",
            email_verified=decoded_token.get('email_verified', False),
            created_at=datetime.utcnow()
        )

        # Create or update user in Firestore
        user_data = await user_service.create_or_update_user(user_info)

        # Generate access token
        access_token = jwt_service.create_access_token(user_info)

        logger.info("Google login successful for user: {user_info.uid}")

        return AuthResponse(
            access_token=access_token,
            user_info=user_info,
            expires_in=jwt_service.access_token_expire_minutes * 60,
            user_data=user_data
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error in google_login: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to authenticate with Google"
        )


@router.get(
    "/me",
    response_model=Dict[str, Any],
    summary="Get current user info",
    description="Returns the current authenticated user's information and profile."
)
async def get_current_user_info(
        current_user: UserInfo = Depends(get_current_user)):
    """Get current user information from Firestore."""
    try:
        # Get complete user data from Firestore
        user_data = await user_service.get_user(current_user.uid)

        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return {
            "user_info": current_user.dict(),
            "profile": user_data.get('profile', {}),
            "preferences": user_data.get('preferences', {}),
            "stats": user_data.get('stats', {})
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "Error getting user info for {}: {}".format(
                current_user.uid, str(e)
            )
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user information"
        )


@router.post(
    "/profile",
    response_model=Dict[str, Any],
    summary="Update user profile",
    description="Update the user's financial profile information."
)
async def update_user_profile(
    profile_data: Dict[str, Any],
    current_user: UserInfo = Depends(get_current_user)
):
    """Update user's financial profile."""
    try:
        updated_user = await user_service.update_user_profile(current_user.uid, profile_data)

        logger.info("Profile updated for user: {current_user.uid}")

        return {
            "message": "Profile updated successfully",
            "profile": updated_user.get('profile', {}),
            "updated_at": updated_user.get('updated_at')
        }

    except Exception as e:
        logger.error(
            "Error updating profile for {}: {}".format(
                current_user.uid, str(e)
            )
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )


@router.get(
    "/config",
    response_model=Dict[str, Any],
    summary="Get app configuration",
    description="Get application configuration including categories and settings."
)
async def get_app_config():
    """Get application configuration from Firestore."""
    try:
        config = await user_service.get_app_config()
        categories = await user_service.get_categories()

        return {
            "config": config,
            "categories": categories
        }

    except Exception as e:
        logger.error("Error getting app config: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get app configuration"
        )


@router.get(
    "/market-data",
    response_model=Dict[str, Any],
    summary="Get market data",
    description="Get current market data including indices, currencies, and commodities."
)
async def get_market_data():
    """Get current market data from Firestore."""
    try:
        market_data = await user_service.get_market_data()

        return market_data

    except Exception as e:
        logger.error("Error getting market data: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get market data"
        )


@router.post(
    "/logout",
    response_model=SuccessResponse,
    summary="Logout user",
    description="Logout the current user (client should discard the token)."
)
async def logout(current_user: UserInfo = Depends(get_current_user)):
    """
    Logout user.

    Note: Since we're using stateless JWT tokens, the client should discard the token.
    In a production environment, you might want to implement token blacklisting.
    """
    logger.info("User logged out: {current_user.uid}")

    return SuccessResponse(
        message="Successfully logged out",
        data={"uid": current_user.uid}
    )
