"""
Fi MCP Authentication Service
Handles user authentication flow for Fi MCP server
Author: Principal Backend Engineer with 15+ years experience
"""

import asyncio
import logging
import uuid
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import aiohttp
from urllib.parse import urlencode

from ..config.fi_mcp_config import fi_mcp_settings

logger = logging.getLogger(__name__)

class FiMCPAuthService:
    """
    Professional Fi MCP Authentication Service
    Handles the complete authentication flow for Fi MCP integration
    """
    
    def __init__(self):
        self.base_url = fi_mcp_settings.FI_MCP_BASE_URL
        self.sessions: Dict[str, Dict[str, Any]] = {}  # In-memory session storage
        
    async def initiate_authentication(self, firebase_uid: str) -> Dict[str, Any]:
        """
        Initiate authentication flow for a Firebase user
        
        Args:
            firebase_uid: Firebase user ID (from JWT token)
            
        Returns:
            Authentication initiation response with login URL
        """
        try:
            # Generate unique session ID linked to Firebase user
            session_id = f"firebase_{firebase_uid}_{uuid.uuid4().hex[:8]}"
            
            # Store session info with Firebase user mapping
            self.sessions[session_id] = {
                "firebase_uid": firebase_uid,
                "status": "pending",
                "created_at": datetime.now(),
                "expires_at": datetime.now() + timedelta(minutes=10),
                "phone_number": None,
                "fi_session_id": None
            }
            
            if fi_mcp_settings.is_using_dev_server:
                # Development flow - direct to mock web page
                login_url = f"{self.base_url}/mockWebPage?sessionId={session_id}"
                
                return {
                    "success": True,
                    "session_id": session_id,
                    "login_url": login_url,
                    "auth_type": "development",
                    "firebase_uid": firebase_uid,
                    "instructions": {
                        "step1": "Click the login URL to open authentication page",
                        "step2": "Enter any test phone number (e.g., 2222222222)",
                        "step3": "Enter any OTP (not validated in dev mode)",
                        "step4": "Complete authentication and return to app"
                    },
                    "test_phone_numbers": fi_mcp_settings.test_phone_numbers[:5]  # Show first 5
                }
            else:
                # Production flow - would integrate with real Fi Money auth
                return await self._initiate_production_auth(session_id, firebase_uid)
                
        except Exception as e:
            logger.error(f"Failed to initiate authentication for Firebase user {firebase_uid}: {str(e)}")
            return {
                "success": False,
                "error": f"Authentication initiation failed: {str(e)}"
            }
    
    async def _initiate_production_auth(self, session_id: str, user_id: str) -> Dict[str, Any]:
        """
        Initiate production authentication flow
        This would integrate with Fi Money's real authentication system
        """
        # TODO: Implement production authentication flow
        # This would involve:
        # 1. Register with Fi Money auth service
        # 2. Get authentication URL
        # 3. Handle OTP flow
        # 4. Validate with Fi Money servers
        
        return {
            "success": False,
            "error": "Production authentication not yet implemented",
            "note": "Use development environment for testing"
        }
    
    async def handle_authentication_callback(
        self, 
        session_id: str, 
        phone_number: str, 
        otp: str = None
    ) -> Dict[str, Any]:
        """
        Handle authentication callback from Fi MCP login page
        
        Args:
            session_id: Session ID from authentication flow
            phone_number: User's phone number
            otp: OTP code (optional for dev mode)
            
        Returns:
            Authentication result
        """
        try:
            # Check if session exists
            if session_id not in self.sessions:
                return {
                    "success": False,
                    "error": "Invalid or expired session"
                }
            
            session = self.sessions[session_id]
            
            # Check if session is expired
            if datetime.now() > session["expires_at"]:
                del self.sessions[session_id]
                return {
                    "success": False,
                    "error": "Session expired"
                }
            
            if fi_mcp_settings.is_using_dev_server:
                # Development authentication
                return await self._handle_dev_auth_callback(session_id, phone_number, otp)
            else:
                # Production authentication
                return await self._handle_prod_auth_callback(session_id, phone_number, otp)
                
        except Exception as e:
            logger.error(f"Authentication callback failed for session {session_id}: {str(e)}")
            return {
                "success": False,
                "error": f"Authentication failed: {str(e)}"
            }
    
    async def _handle_dev_auth_callback(
        self, 
        session_id: str, 
        phone_number: str, 
        otp: str = None
    ) -> Dict[str, Any]:
        """Handle development authentication callback"""
        try:
            session = self.sessions[session_id]
            
            # Validate phone number is in test data
            if phone_number not in fi_mcp_settings.test_phone_numbers:
                return {
                    "success": False,
                    "error": f"Phone number {phone_number} not available in test data",
                    "available_numbers": fi_mcp_settings.test_phone_numbers[:5]
                }
            
            # In dev mode, any OTP is accepted
            # Update session
            session.update({
                "status": "authenticated",
                "phone_number": phone_number,
                "fi_session_id": f"fi_session_{phone_number}_{uuid.uuid4().hex[:8]}",
                "authenticated_at": datetime.now(),
                "scenario": fi_mcp_settings.get_test_scenario_description(phone_number)
            })
            
            logger.info(f"User authenticated successfully: {session['user_id']} -> {phone_number}")
            
            return {
                "success": True,
                "session_id": session_id,
                "phone_number": phone_number,
                "scenario": session["scenario"],
                "message": "Authentication successful",
                "expires_at": session["expires_at"].isoformat()
            }
            
        except Exception as e:
            logger.error(f"Dev authentication callback failed: {str(e)}")
            return {
                "success": False,
                "error": f"Development authentication failed: {str(e)}"
            }
    
    async def _handle_prod_auth_callback(
        self, 
        session_id: str, 
        phone_number: str, 
        otp: str
    ) -> Dict[str, Any]:
        """Handle production authentication callback"""
        # TODO: Implement production OTP validation
        # This would involve:
        # 1. Validate OTP with Fi Money servers
        # 2. Get user authentication token
        # 3. Store authenticated session
        
        return {
            "success": False,
            "error": "Production authentication not yet implemented"
        }
    
    def get_user_context(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user context for MCP calls
        
        Args:
            session_id: Session ID
            
        Returns:
            User context for MCP tool calls
        """
        if session_id not in self.sessions:
            return None
            
        session = self.sessions[session_id]
        
        if session["status"] != "authenticated":
            return None
            
        if datetime.now() > session["expires_at"]:
            del self.sessions[session_id]
            return None
        
        return {
            "session_id": session_id,
            "fi_session_id": session["fi_session_id"],
            "phone_number": session["phone_number"],
            "firebase_uid": session["firebase_uid"],
            "authenticated_at": session["authenticated_at"].isoformat()
        }
    
    def get_fi_session_by_firebase_uid(self, firebase_uid: str) -> Optional[Dict[str, Any]]:
        """
        Get Fi MCP session for a Firebase user
        
        Args:
            firebase_uid: Firebase user ID
            
        Returns:
            Fi MCP session context or None
        """
        # Find active session for this Firebase user
        for session_id, session in self.sessions.items():
            if (session.get("firebase_uid") == firebase_uid and 
                session["status"] == "authenticated" and
                datetime.now() <= session["expires_at"]):
                
                return self.get_user_context(session_id)
        
        return None
    
    def is_firebase_user_authenticated(self, firebase_uid: str) -> bool:
        """
        Check if Firebase user has Fi MCP authentication
        
        Args:
            firebase_uid: Firebase user ID
            
        Returns:
            True if user has active Fi MCP session
        """
        return self.get_fi_session_by_firebase_uid(firebase_uid) is not None
    
    def is_user_authenticated(self, session_id: str) -> bool:
        """
        Check if user is authenticated
        
        Args:
            session_id: Session ID
            
        Returns:
            True if user is authenticated
        """
        return self.get_user_context(session_id) is not None
    
    async def logout_user(self, session_id: str) -> Dict[str, Any]:
        """
        Logout user and clear session
        
        Args:
            session_id: Session ID
            
        Returns:
            Logout result
        """
        try:
            if session_id in self.sessions:
                user_id = self.sessions[session_id]["user_id"]
                del self.sessions[session_id]
                
                logger.info(f"User logged out: {user_id}")
                
                return {
                    "success": True,
                    "message": "Logged out successfully"
                }
            else:
                return {
                    "success": False,
                    "error": "Session not found"
                }
                
        except Exception as e:
            logger.error(f"Logout failed for session {session_id}: {str(e)}")
            return {
                "success": False,
                "error": f"Logout failed: {str(e)}"
            }
    
    def get_session_info(self, session_id: str) -> Optional[Dict[str, Any]]:
        """
        Get session information
        
        Args:
            session_id: Session ID
            
        Returns:
            Session information
        """
        if session_id not in self.sessions:
            return None
            
        session = self.sessions[session_id].copy()
        
        # Remove sensitive information
        if "fi_session_id" in session:
            session["fi_session_id"] = "***masked***"
            
        return session
    
    def cleanup_expired_sessions(self):
        """Clean up expired sessions"""
        try:
            current_time = datetime.now()
            expired_sessions = [
                session_id for session_id, session in self.sessions.items()
                if current_time > session["expires_at"]
            ]
            
            for session_id in expired_sessions:
                del self.sessions[session_id]
                
            if expired_sessions:
                logger.info(f"Cleaned up {len(expired_sessions)} expired sessions")
                
        except Exception as e:
            logger.error(f"Session cleanup failed: {str(e)}")


# Global service instance
_fi_mcp_auth_service: Optional[FiMCPAuthService] = None

def get_fi_mcp_auth_service() -> FiMCPAuthService:
    """
    Get global Fi MCP authentication service instance
    
    Returns:
        FiMCPAuthService instance
    """
    global _fi_mcp_auth_service
    if _fi_mcp_auth_service is None:
        _fi_mcp_auth_service = FiMCPAuthService()
    return _fi_mcp_auth_service
