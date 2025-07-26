"""
User Service for DeltaVerse AI Finance Advisor
Handles user data management with Firestore integration.
"""

import os
import firebase_admin
from firebase_admin import firestore
from typing import Optional, Dict, Any, List
import logging
from datetime import datetime
from app.models.auth import UserInfo

logger = logging.getLogger(__name__)


class UserService:
    """User service for managing user data in Firestore."""

    def __init__(self):
        """Initialize UserService with lazy Firebase connection"""
        self._db = None
        self.users_collection = 'users'
        self.transactions_collection = 'transactions'
        self.goals_collection = 'financial_goals'
        
    @property
    def db(self):
        """Lazy initialization of Firestore client"""
        if self._db is None:
            # Only initialize if not in testing mode
            if os.getenv("TESTING") == "true":
                from unittest.mock import Mock
                self._db = Mock()
            else:
                self._db = firestore.client()
        return self._db

    async def create_or_update_user(
            self, user_info: UserInfo) -> Dict[str, Any]:
        """Create or update user in Firestore."""
        try:
            user_ref = self.db.collection(
                self.users_collection).document(
                user_info.uid)

            # Check if user exists
            user_doc = user_ref.get()

            user_data = {
                'uid': user_info.uid,
                'email': user_info.email,
                'phone_number': user_info.phone_number,
                'name': user_info.name,
                'picture': user_info.picture,
                'provider': user_info.provider,
                'email_verified': user_info.email_verified,
                'updated_at': datetime.utcnow(),
            }

            if user_doc.exists:
                # Update existing user
                user_ref.update(user_data)
                logger.info(f"Updated user: {user_info.uid}")
                return {**user_doc.to_dict(), **user_data}
            else:
                # Create new user with additional fields
                user_data.update({
                    'created_at': datetime.utcnow(),
                    'profile': {
                        'financial_profile_completed': False,
                        'risk_tolerance': None,
                        'monthly_income': None,
                        'monthly_expenses': None,
                        'investment_experience': None,
                        'financial_goals': []
                    },
                    'preferences': {
                        'currency': 'USD',
                        'language': 'en',
                        'notifications': {
                            'email': True,
                            'push': True,
                            'sms': False
                        },
                        'ai_recommendations': True
                    },
                    'stats': {
                        'total_transactions': 0,
                        'total_goals': 0,
                        'goals_achieved': 0,
                        'last_active': datetime.utcnow()
                    }
                })

                user_ref.set(user_data)
                logger.info(f"Created new user: {user_info.uid}")
                return user_data

        except Exception as e:
            logger.error(
                f"Error creating/updating user {user_info.uid}: {str(e)}")
            raise

    async def get_user(self, uid: str) -> Optional[Dict[str, Any]]:
        """Get user by UID from Firestore."""
        try:
            user_ref = self.db.collection(self.users_collection).document(uid)
            user_doc = user_ref.get()

            if user_doc.exists:
                return user_doc.to_dict()
            return None

        except Exception as e:
            logger.error(f"Error getting user {uid}: {str(e)}")
            raise

    async def update_user_profile(
            self, uid: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user's financial profile."""
        try:
            user_ref = self.db.collection(self.users_collection).document(uid)

            update_data = {
                'profile': profile_data,
                'updated_at': datetime.utcnow()
            }

            user_ref.update(update_data)

            # Get updated user data
            updated_user = user_ref.get().to_dict()
            logger.info(f"Updated profile for user: {uid}")
            return updated_user

        except Exception as e:
            logger.error(f"Error updating profile for user {uid}: {str(e)}")
            raise

    async def add_transaction(
            self, uid: str, transaction_data: Dict[str, Any]) -> str:
        """Add a transaction for the user."""
        try:
            transaction_data.update({
                'user_id': uid,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            })

            # Add transaction to transactions collection
            transaction_ref = self.db.collection(
                self.transactions_collection).add(transaction_data)
            transaction_id = transaction_ref[1].id

            # Update user stats
            user_ref = self.db.collection(self.users_collection).document(uid)
            user_ref.update({
                'stats.total_transactions': firestore.Increment(1),
                'stats.last_active': datetime.utcnow()
            })

            logger.info(f"Added transaction {transaction_id} for user: {uid}")
            return transaction_id

        except Exception as e:
            logger.error(f"Error adding transaction for user {uid}: {str(e)}")
            raise

    async def get_user_transactions(
            self, uid: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get user's transactions."""
        try:
            transactions_ref = (
                self.db.collection(
                    self.transactions_collection) .where(
                    'user_id',
                    '==',
                    uid) .order_by(
                    'created_at',
                    direction=firestore.Query.DESCENDING) .limit(limit))

            transactions = []
            for doc in transactions_ref.stream():
                transaction_data = doc.to_dict()
                transaction_data['id'] = doc.id
                transactions.append(transaction_data)

            return transactions

        except Exception as e:
            logger.error(
                f"Error getting transactions for user {uid}: {str(e)}")
            raise

    async def create_financial_goal(
            self, uid: str, goal_data: Dict[str, Any]) -> str:
        """Create a financial goal for the user."""
        try:
            goal_data.update({
                'user_id': uid,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                'status': 'active',
                'progress': 0.0
            })

            # Add goal to goals collection
            goal_ref = self.db.collection(self.goals_collection).add(goal_data)
            goal_id = goal_ref[1].id

            # Update user stats
            user_ref = self.db.collection(self.users_collection).document(uid)
            user_ref.update({
                'stats.total_goals': firestore.Increment(1),
                'stats.last_active': datetime.utcnow()
            })

            logger.info(f"Created goal {goal_id} for user: {uid}")
            return goal_id

        except Exception as e:
            logger.error(f"Error creating goal for user {uid}: {str(e)}")
            raise

    async def get_user_goals(self, uid: str) -> List[Dict[str, Any]]:
        """Get user's financial goals."""
        try:
            goals_ref = (
                self.db.collection(
                    self.goals_collection) .where(
                    'user_id',
                    '==',
                    uid) .order_by(
                    'created_at',
                    direction=firestore.Query.DESCENDING))

            goals = []
            for doc in goals_ref.stream():
                goal_data = doc.to_dict()
                goal_data['id'] = doc.id
                goals.append(goal_data)

            return goals

        except Exception as e:
            logger.error(f"Error getting goals for user {uid}: {str(e)}")
            raise

    async def get_app_config(self) -> Dict[str, Any]:
        """Get app configuration from Firestore."""
        try:
            config_ref = self.db.collection('app_config').document('settings')
            config_doc = config_ref.get()

            if config_doc.exists:
                return config_doc.to_dict()
            return {}

        except Exception as e:
            logger.error(f"Error getting app config: {str(e)}")
            raise

    async def get_categories(self) -> Dict[str, Any]:
        """Get transaction categories from Firestore."""
        try:
            categories_ref = self.db.collection(
                'app_config').document('categories')
            categories_doc = categories_ref.get()

            if categories_doc.exists:
                return categories_doc.to_dict()
            return {}

        except Exception as e:
            logger.error(f"Error getting categories: {str(e)}")
            raise

    async def get_market_data(self) -> Dict[str, Any]:
        """Get current market data from Firestore."""
        try:
            market_ref = self.db.collection('market_data').document('current')
            market_doc = market_ref.get()

            if market_doc.exists:
                return market_doc.to_dict()
            return {}

        except Exception as e:
            logger.error(f"Error getting market data: {str(e)}")
            raise


# Global instance
user_service = UserService()
