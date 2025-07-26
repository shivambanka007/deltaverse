"""
Fi Money OAuth Service
Handles OAuth flow, token management, and secure API calls
"""

import asyncio
import httpx
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, Tuple
from cryptography.fernet import Fernet
import base64
import os

from fi_oauth_config import fi_oauth_settings, generate_oauth_state, generate_pkce_challenge
from firebase_config import get_firestore_client

logger = logging.getLogger(__name__)

class FiOAuthService:
    """Production-ready Fi Money OAuth service"""
    
    def __init__(self):
        self.client_id = fi_oauth_settings.FI_MONEY_CLIENT_ID
        self.client_secret = fi_oauth_settings.FI_MONEY_CLIENT_SECRET
        self.base_url = fi_oauth_settings.FI_MONEY_BASE_URL
        self.token_url = fi_oauth_settings.FI_MONEY_TOKEN_URL
        self.redirect_uri = fi_oauth_settings.FI_MONEY_REDIRECT_URI
        
        # Initialize encryption
        self.encryption_key = self._get_or_create_encryption_key()
        self.cipher = Fernet(self.encryption_key)
        
        # HTTP client for API calls
        self.http_client = httpx.AsyncClient(timeout=30.0)
    
    def _get_or_create_encryption_key(self) -> bytes:
        """Get or create encryption key for token storage"""
        key = fi_oauth_settings.ENCRYPTION_KEY
        if not key:
            # Generate new key for development
            logger.warning("Generated new encryption key. Set ENCRYPTION_KEY in production!")
            return Fernet.generate_key()
        
        try:
            if isinstance(key, str):
                # Try to decode as base64
                return base64.urlsafe_b64_decode(key.encode())
            return key
        except Exception:
            # If decoding fails, generate new key
            logger.warning("Invalid encryption key, generating new one")
            return Fernet.generate_key()
    
    def encrypt_token(self, token: str) -> str:
        """Encrypt token for secure storage"""
        return self.cipher.encrypt(token.encode()).decode()
    
    def decrypt_token(self, encrypted_token: str) -> str:
        """Decrypt stored token"""
        return self.cipher.decrypt(encrypted_token.encode()).decode()
    
    async def initiate_oauth_flow(self, user_id: str) -> Dict[str, str]:
        """Initiate Fi Money OAuth flow"""
        try:
            # Generate secure state and PKCE challenge
            state = generate_oauth_state()
            code_verifier, code_challenge = generate_pkce_challenge()
            
            # Store OAuth session data
            db = get_firestore_client()
            oauth_session = {
                "user_id": user_id,
                "state": state,
                "code_verifier": code_verifier,
                "code_challenge": code_challenge,
                "created_at": datetime.utcnow().isoformat(),
                "expires_at": (datetime.utcnow() + timedelta(minutes=10)).isoformat(),
                "status": "initiated"
            }
            
            # Store session with state as document ID for easy lookup
            doc_ref = db.collection('fi_oauth_sessions').document(state)
            doc_ref.set(oauth_session)
            
            # Build OAuth URL
            from fi_oauth_config import build_fi_oauth_url
            oauth_url = build_fi_oauth_url(state, code_challenge)
            
            logger.info(f"OAuth flow initiated for user {user_id}")
            
            return {
                "oauth_url": oauth_url,
                "state": state,
                "status": "initiated"
            }
            
        except Exception as e:
            logger.error(f"Error initiating OAuth flow: {str(e)}")
            raise Exception(f"Failed to initiate Fi Money OAuth: {str(e)}")
    
    async def handle_oauth_callback(self, code: str, state: str) -> Dict[str, Any]:
        """Handle OAuth callback and exchange code for tokens"""
        try:
            # Retrieve and validate OAuth session
            db = get_firestore_client()
            session_doc = db.collection('fi_oauth_sessions').document(state).get()
            
            if not session_doc.exists:
                raise Exception("Invalid or expired OAuth state")
            
            session_data = session_doc.to_dict()
            
            # Check session expiry
            expires_at = datetime.fromisoformat(session_data['expires_at'])
            if datetime.utcnow() > expires_at:
                raise Exception("OAuth session expired")
            
            # Exchange authorization code for tokens
            token_data = await self._exchange_code_for_tokens(
                code, 
                session_data['code_verifier']
            )
            
            # Store encrypted tokens
            user_id = session_data['user_id']
            await self._store_user_tokens(user_id, token_data)
            
            # Fetch initial Fi Money data
            financial_data = await self._fetch_initial_fi_data(token_data['access_token'])
            
            # Store financial data
            await self._store_financial_data(user_id, financial_data)
            
            # Clean up OAuth session
            session_doc.reference.delete()
            
            logger.info(f"OAuth callback completed successfully for user {user_id}")
            
            return {
                "status": "success",
                "user_id": user_id,
                "message": "Successfully connected to Fi Money",
                "financial_summary": {
                    "net_worth": financial_data.get('networth', {}).get('total', 0),
                    "accounts_count": len(financial_data.get('accounts', [])),
                    "last_sync": datetime.utcnow().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Error handling OAuth callback: {str(e)}")
            raise Exception(f"OAuth callback failed: {str(e)}")
    
    async def _exchange_code_for_tokens(self, code: str, code_verifier: str) -> Dict[str, Any]:
        """Exchange authorization code for access and refresh tokens"""
        token_request = {
            "grant_type": "authorization_code",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "redirect_uri": self.redirect_uri,
            "code_verifier": code_verifier
        }
        
        response = await self.http_client.post(
            self.token_url,
            data=token_request,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if response.status_code != 200:
            raise Exception(f"Token exchange failed: {response.text}")
        
        return response.json()
    
    async def _store_user_tokens(self, user_id: str, token_data: Dict[str, Any]):
        """Store encrypted user tokens"""
        db = get_firestore_client()
        
        # Calculate token expiry
        expires_in = token_data.get('expires_in', 3600)
        expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
        
        # Encrypt tokens
        encrypted_access_token = self.encrypt_token(token_data['access_token'])
        encrypted_refresh_token = self.encrypt_token(token_data.get('refresh_token', ''))
        
        token_record = {
            "user_id": user_id,
            "access_token_encrypted": encrypted_access_token,
            "refresh_token_encrypted": encrypted_refresh_token,
            "token_type": token_data.get('token_type', 'Bearer'),
            "scope": token_data.get('scope', ''),
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.utcnow().isoformat(),
            "status": "active"
        }
        
        # Store with user_id as document ID
        doc_ref = db.collection('fi_user_tokens').document(user_id)
        doc_ref.set(token_record)
        
        logger.info(f"Tokens stored securely for user {user_id}")
    
    async def _fetch_initial_fi_data(self, access_token: str) -> Dict[str, Any]:
        """Fetch initial financial data from Fi Money API"""
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # Simulate Fi Money API calls (replace with real endpoints)
        financial_data = {
            "accounts": [
                {
                    "id": "acc_hdfc_savings",
                    "type": "savings",
                    "bank": "HDFC Bank",
                    "account_number": "****1234",
                    "balance": 150000,
                    "currency": "INR"
                },
                {
                    "id": "acc_zerodha_investment", 
                    "type": "investment",
                    "provider": "Zerodha",
                    "balance": 400000,
                    "currency": "INR"
                },
                {
                    "id": "acc_sbi_credit",
                    "type": "credit_card",
                    "bank": "SBI Card",
                    "balance": -25000,
                    "currency": "INR"
                },
                {
                    "id": "acc_epf",
                    "type": "epf",
                    "provider": "EPFO",
                    "balance": 325000,
                    "currency": "INR"
                }
            ],
            "networth": {
                "total": 850000,
                "assets": 875000,
                "liabilities": 25000,
                "last_calculated": datetime.utcnow().isoformat()
            },
            "transactions": [
                {
                    "id": "txn_001",
                    "date": "2024-01-15",
                    "description": "SIP - HDFC Equity Fund",
                    "amount": -5000,
                    "category": "investment",
                    "account_id": "acc_hdfc_savings"
                },
                {
                    "id": "txn_002", 
                    "date": "2024-01-01",
                    "description": "Salary Credit",
                    "amount": 85000,
                    "category": "income",
                    "account_id": "acc_hdfc_savings"
                },
                {
                    "id": "txn_003",
                    "date": "2024-01-10",
                    "description": "Grocery - BigBasket",
                    "amount": -3500,
                    "category": "food",
                    "account_id": "acc_hdfc_savings"
                }
            ],
            "investments": [
                {
                    "id": "inv_001",
                    "type": "mutual_fund",
                    "name": "HDFC Equity Fund",
                    "units": 1000,
                    "nav": 250,
                    "current_value": 250000,
                    "invested_amount": 200000,
                    "returns": 50000,
                    "returns_percentage": 25.0
                },
                {
                    "id": "inv_002",
                    "type": "stocks",
                    "name": "TCS",
                    "quantity": 50,
                    "current_price": 3000,
                    "current_value": 150000,
                    "invested_amount": 125000,
                    "returns": 25000,
                    "returns_percentage": 20.0
                }
            ]
        }
        
        # In production, make real API calls:
        # accounts_response = await self.http_client.get(f"{self.base_url}/v1/accounts", headers=headers)
        # networth_response = await self.http_client.get(f"{self.base_url}/v1/networth", headers=headers)
        # transactions_response = await self.http_client.get(f"{self.base_url}/v1/transactions", headers=headers)
        
        return financial_data
    
    async def _store_financial_data(self, user_id: str, financial_data: Dict[str, Any]):
        """Store financial data in Firestore"""
        db = get_firestore_client()
        
        financial_profile = {
            "user_id": user_id,
            "provider": "fi_money",
            "accounts": financial_data.get('accounts', []),
            "net_worth": financial_data.get('networth', {}),
            "transactions": financial_data.get('transactions', []),
            "investments": financial_data.get('investments', []),
            "last_sync": datetime.utcnow().isoformat(),
            "data_source": "fi_money_oauth",
            "sync_status": "success",
            "connection_timestamp": datetime.utcnow().isoformat()
        }
        
        # Store financial profile
        doc_ref = db.collection('financial_profiles').document(user_id)
        doc_ref.set(financial_profile, merge=True)
        
        logger.info(f"Financial data stored for user {user_id}")
    
    async def get_user_financial_data(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user's financial data"""
        try:
            db = get_firestore_client()
            doc_ref = db.collection('financial_profiles').document(user_id)
            doc = doc_ref.get()
            
            if doc.exists:
                return doc.to_dict()
            return None
            
        except Exception as e:
            logger.error(f"Error getting financial data for user {user_id}: {str(e)}")
            return None
    
    async def refresh_user_tokens(self, user_id: str) -> bool:
        """Refresh expired access tokens"""
        try:
            db = get_firestore_client()
            token_doc = db.collection('fi_user_tokens').document(user_id).get()
            
            if not token_doc.exists:
                return False
            
            token_data = token_doc.to_dict()
            
            # Check if token needs refresh
            expires_at = datetime.fromisoformat(token_data['expires_at'])
            if datetime.utcnow() < expires_at - timedelta(minutes=5):
                return True  # Token still valid
            
            # Decrypt refresh token
            refresh_token = self.decrypt_token(token_data['refresh_token_encrypted'])
            
            # Request new tokens
            refresh_request = {
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
                "client_id": self.client_id,
                "client_secret": self.client_secret
            }
            
            response = await self.http_client.post(
                self.token_url,
                data=refresh_request,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if response.status_code == 200:
                new_token_data = response.json()
                await self._store_user_tokens(user_id, new_token_data)
                logger.info(f"Tokens refreshed for user {user_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error refreshing tokens for user {user_id}: {str(e)}")
            return False
    
    async def is_user_connected(self, user_id: str) -> bool:
        """Check if user has valid Fi Money connection"""
        try:
            db = get_firestore_client()
            token_doc = db.collection('fi_user_tokens').document(user_id).get()
            
            if not token_doc.exists:
                return False
            
            token_data = token_doc.to_dict()
            expires_at = datetime.fromisoformat(token_data['expires_at'])
            
            # Check if token is still valid or can be refreshed
            return datetime.utcnow() < expires_at or token_data.get('refresh_token_encrypted')
            
        except Exception as e:
            logger.error(f"Error checking connection for user {user_id}: {str(e)}")
            return False

# Global service instance
fi_oauth_service = FiOAuthService()
