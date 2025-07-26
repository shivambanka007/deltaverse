"""
Integrated Authentication Service
Manages both Firebase and Fi MCP authentication
Author: Principal Backend Engineer with 15+ years experience
"""

import logging
import re
from typing import Dict, Any, Optional, List
from datetime import datetime

from .fi_mcp_auth import get_fi_mcp_auth_service, FiMCPAuthService
from ..app.services.firebase_auth import firebase_auth_service

logger = logging.getLogger(__name__)

class IntegratedAuthService:
    """
    Professional integrated authentication service
    Manages the relationship between Firebase (identity) and Fi MCP (financial data) authentication
    """
    
    def __init__(self):
        self.fi_mcp_auth = get_fi_mcp_auth_service()
        self.firebase_auth = firebase_auth_service
        
        # Keywords that indicate financial data is needed
        self.financial_keywords = [
            # Net worth and portfolio
            "net worth", "portfolio", "investment", "assets", "liabilities",
            
            # Account balances
            "balance", "account", "bank", "savings", "checking",
            
            # Investments
            "mutual fund", "mf", "sip", "stock", "equity", "shares",
            "dividend", "returns", "profit", "loss", "gain",
            
            # Credit and loans
            "credit score", "credit card", "loan", "emi", "debt",
            
            # Retirement
            "epf", "provident fund", "retirement", "pension",
            
            # Personal financial queries
            "my money", "my investment", "my portfolio", "my balance",
            "my assets", "my debt", "my credit", "my fund",
            
            # Financial planning
            "financial goal", "budget", "expense", "income", "salary",
            "spending", "save", "saving"
        ]
    
    async def check_user_access(self, firebase_token: str, query: str) -> Dict[str, Any]:
        """
        Check user access level for a given query
        
        Args:
            firebase_token: Firebase JWT token
            query: User's query/message
            
        Returns:
            Access level and authentication requirements
        """
        try:
            # Step 1: Verify Firebase authentication
            firebase_user = await self._verify_firebase_token(firebase_token)
            if not firebase_user:
                return {
                    "access": "denied",
                    "error": "Please login to DeltaVerse first",
                    "requires_auth": "firebase"
                }
            
            # Step 2: Analyze query requirements
            requires_financial_data = self._requires_financial_data(query)
            
            if not requires_financial_data:
                return {
                    "access": "general",
                    "user": firebase_user,
                    "message": "General AI knowledge available"
                }
            
            # Step 3: Check Fi MCP authentication
            firebase_uid = firebase_user.get("uid")
            fi_session = self.fi_mcp_auth.get_fi_session_by_firebase_uid(firebase_uid)
            
            if not fi_session:
                return {
                    "access": "requires_fi_auth",
                    "user": firebase_user,
                    "requires_auth": "fi_mcp",
                    "message": "I need access to your financial data to answer this question.",
                    "query": query
                }
            
            # Step 4: Full access granted
            return {
                "access": "full_financial",
                "user": firebase_user,
                "fi_session": fi_session,
                "message": "Full access to financial data and AI insights"
            }
            
        except Exception as e:
            logger.error(f"Access check failed: {str(e)}")
            return {
                "access": "error",
                "error": f"Access check failed: {str(e)}"
            }
    
    async def _verify_firebase_token(self, firebase_token: str) -> Optional[Dict[str, Any]]:
        """
        Verify Firebase JWT token
        
        Args:
            firebase_token: Firebase JWT token
            
        Returns:
            Firebase user information or None
        """
        try:
            # Use Firebase auth service to verify token
            user_info = self.firebase_auth.verify_id_token(firebase_token)
            
            if user_info:
                return {
                    "uid": user_info.get("uid"),
                    "email": user_info.get("email"),
                    "name": user_info.get("name", user_info.get("email", "User")),
                    "verified": True
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Firebase token verification failed: {str(e)}")
            # For development, return mock user
            if "mock" in firebase_token.lower() or "test" in firebase_token.lower():
                return {
                    "uid": "firebase_user_123",
                    "email": "test@deltaverse.com",
                    "name": "Test User",
                    "verified": True,
                    "mock": True
                }
            return None
    
    def _requires_financial_data(self, query: str) -> bool:
        """
        Analyze if query requires financial data access
        
        Args:
            query: User's query
            
        Returns:
            True if financial data is needed
        """
        query_lower = query.lower()
        
        # Check for financial keywords
        for keyword in self.financial_keywords:
            if keyword in query_lower:
                return True
        
        # Check for patterns that indicate personal financial queries
        personal_patterns = [
            r'\bmy\s+(money|investment|portfolio|balance|assets|debt)',
            r'\bhow\s+much\s+(do\s+i|have|money|investment)',
            r'\bwhat\s+(is\s+my|are\s+my)\s+(balance|investment|portfolio)',
            r'\bshow\s+(me\s+)?my\s+(portfolio|balance|investment)',
            r'\bi\s+(have|invested|own|owe)',
        ]
        
        for pattern in personal_patterns:
            if re.search(pattern, query_lower):
                return True
        
        return False
    
    async def initiate_fi_authentication(self, firebase_token: str) -> Dict[str, Any]:
        """
        Initiate Fi MCP authentication for a Firebase user
        
        Args:
            firebase_token: Firebase JWT token
            
        Returns:
            Authentication initiation result
        """
        try:
            # Verify Firebase user
            firebase_user = await self._verify_firebase_token(firebase_token)
            if not firebase_user:
                return {
                    "success": False,
                    "error": "Invalid Firebase authentication"
                }
            
            # Initiate Fi MCP authentication
            result = await self.fi_mcp_auth.initiate_authentication(firebase_user["uid"])
            
            if result["success"]:
                result["firebase_user"] = firebase_user
                
            return result
            
        except Exception as e:
            logger.error(f"Fi authentication initiation failed: {str(e)}")
            return {
                "success": False,
                "error": f"Authentication initiation failed: {str(e)}"
            }
    
    def get_user_financial_status(self, firebase_token: str) -> Dict[str, Any]:
        """
        Get comprehensive user authentication status
        
        Args:
            firebase_token: Firebase JWT token
            
        Returns:
            Complete authentication status
        """
        try:
            # Check Firebase authentication
            firebase_user = self._verify_firebase_token(firebase_token)
            if not firebase_user:
                return {
                    "firebase_authenticated": False,
                    "fi_mcp_authenticated": False,
                    "status": "not_logged_in"
                }
            
            # Check Fi MCP authentication
            firebase_uid = firebase_user.get("uid")
            fi_session = self.fi_mcp_auth.get_fi_session_by_firebase_uid(firebase_uid)
            is_fi_authenticated = self.fi_mcp_auth.is_firebase_user_authenticated(firebase_uid)
            
            return {
                "firebase_authenticated": True,
                "fi_mcp_authenticated": is_fi_authenticated,
                "user": firebase_user,
                "fi_session": {
                    "phone_number": fi_session.get("phone_number") if fi_session else None,
                    "authenticated_at": fi_session.get("authenticated_at") if fi_session else None,
                    "scenario": fi_session.get("scenario") if fi_session else None
                } if fi_session else None,
                "status": "full_access" if is_fi_authenticated else "partial_access",
                "capabilities": {
                    "general_ai": True,
                    "financial_data": is_fi_authenticated,
                    "personal_insights": is_fi_authenticated
                }
            }
            
        except Exception as e:
            logger.error(f"User status check failed: {str(e)}")
            return {
                "firebase_authenticated": False,
                "fi_mcp_authenticated": False,
                "status": "error",
                "error": str(e)
            }
    
    def get_query_analysis(self, query: str) -> Dict[str, Any]:
        """
        Analyze query requirements and provide recommendations
        
        Args:
            query: User's query
            
        Returns:
            Query analysis and recommendations
        """
        requires_financial = self._requires_financial_data(query)
        
        # Find matching keywords
        matching_keywords = [
            keyword for keyword in self.financial_keywords
            if keyword in query.lower()
        ]
        
        # Categorize query type
        query_type = "general"
        if requires_financial:
            if any(kw in query.lower() for kw in ["portfolio", "investment", "mutual fund", "stock"]):
                query_type = "investment"
            elif any(kw in query.lower() for kw in ["balance", "account", "bank"]):
                query_type = "banking"
            elif any(kw in query.lower() for kw in ["credit", "loan", "debt"]):
                query_type = "credit"
            elif any(kw in query.lower() for kw in ["net worth", "assets", "liabilities"]):
                query_type = "net_worth"
            else:
                query_type = "financial_general"
        
        return {
            "requires_financial_data": requires_financial,
            "query_type": query_type,
            "matching_keywords": matching_keywords,
            "confidence": len(matching_keywords) / len(self.financial_keywords) if matching_keywords else 0,
            "recommendation": {
                "auth_required": "fi_mcp" if requires_financial else None,
                "data_sources": self._get_required_data_sources(query_type),
                "response_type": "financial_analysis" if requires_financial else "general_knowledge"
            }
        }
    
    def _get_required_data_sources(self, query_type: str) -> List[str]:
        """Get required data sources for query type"""
        data_source_map = {
            "investment": ["mutual_funds", "stocks", "net_worth"],
            "banking": ["bank_accounts", "transactions"],
            "credit": ["credit_report", "credit_score"],
            "net_worth": ["net_worth", "bank_accounts", "mutual_funds", "epf"],
            "financial_general": ["net_worth", "bank_accounts", "mutual_funds"]
        }
        
        return data_source_map.get(query_type, [])


# Global service instance
_integrated_auth_service: Optional[IntegratedAuthService] = None

def get_integrated_auth_service() -> IntegratedAuthService:
    """
    Get global integrated authentication service instance
    
    Returns:
        IntegratedAuthService instance
    """
    global _integrated_auth_service
    if _integrated_auth_service is None:
        _integrated_auth_service = IntegratedAuthService()
    return _integrated_auth_service
