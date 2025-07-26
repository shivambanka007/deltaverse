"""
Firestore Service for Financial Data Management
Handles CRUD operations for Fi MCP data models
"""

import asyncio
from datetime import datetime
from typing import List, Optional, Dict, Any
from google.cloud import firestore
from google.cloud.firestore_v1.base_query import FieldFilter

from ..models.financial_models import (
    UserFinancialProfile,
    UserProfile,
    NetWorthResponse,
    MFPortfolio,
    BankPortfolio,
    EquityPortfolio,
    EPFPortfolio,
    CreditPortfolio,
    FirestoreCollections
)


class FirestoreFinancialService:
    """Service for managing financial data in Firestore"""

    def __init__(self):
        self.db = firestore.Client()
        self.collections = FirestoreCollections()

    # ========================================================================
    # USER PROFILE OPERATIONS
    # ========================================================================

    async def create_user_profile(self, profile: UserProfile) -> str:
        """Create a new user profile"""
        try:
            doc_ref = self.db.collection(
                self.collections.USER_PROFILES).document(
                profile.user_id)
            doc_ref.set(profile.dict())
            return profile.user_id
        except Exception as e:
            raise Exception(f"Failed to create user profile: {str(e)}")

    async def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """Get user profile by ID"""
        try:
            doc_ref = self.db.collection(
                self.collections.USER_PROFILES).document(user_id)
            doc = doc_ref.get()

            if doc.exists:
                return UserProfile(**doc.to_dict())
            return None
        except Exception as e:
            raise Exception(f"Failed to get user profile: {str(e)}")

    async def update_user_profile(
            self, user_id: str, updates: Dict[str, Any]) -> bool:
        """Update user profile"""
        try:
            doc_ref = self.db.collection(
                self.collections.USER_PROFILES).document(user_id)
            updates['updated_at'] = datetime.utcnow()
            doc_ref.update(updates)
            return True
        except Exception as e:
            raise Exception(f"Failed to update user profile: {str(e)}")

    # ========================================================================
    # NET WORTH OPERATIONS
    # ========================================================================

    async def save_net_worth(
            self,
            user_id: str,
            net_worth: NetWorthResponse) -> bool:
        """Save user's net worth data"""
        try:
            doc_ref = self.db.collection(
                self.collections.NET_WORTH).document(user_id)
            data = net_worth.dict()
            data['user_id'] = user_id
            data['last_updated'] = datetime.utcnow()
            doc_ref.set(data)
            return True
        except Exception as e:
            raise Exception(f"Failed to save net worth: {str(e)}")

    async def get_net_worth(self, user_id: str) -> Optional[NetWorthResponse]:
        """Get user's net worth data"""
        try:
            doc_ref = self.db.collection(
                self.collections.NET_WORTH).document(user_id)
            doc = doc_ref.get()

            if doc.exists:
                data = doc.to_dict()
                return NetWorthResponse(**data)
            return None
        except Exception as e:
            raise Exception(f"Failed to get net worth: {str(e)}")

    # ========================================================================
    # MUTUAL FUND OPERATIONS
    # ========================================================================

    async def save_mf_portfolio(
            self,
            user_id: str,
            portfolio: MFPortfolio) -> bool:
        """Save user's mutual fund portfolio"""
        try:
            doc_ref = self.db.collection(
                self.collections.MUTUAL_FUNDS).document(user_id)
            data = portfolio.dict()
            data['last_updated'] = datetime.utcnow()
            doc_ref.set(data)
            return True
        except Exception as e:
            raise Exception(f"Failed to save MF portfolio: {str(e)}")

    async def get_mf_portfolio(self, user_id: str) -> Optional[MFPortfolio]:
        """Get user's mutual fund portfolio"""
        try:
            doc_ref = self.db.collection(
                self.collections.MUTUAL_FUNDS).document(user_id)
            doc = doc_ref.get()

            if doc.exists:
                return MFPortfolio(**doc.to_dict())
            return None
        except Exception as e:
            raise Exception(f"Failed to get MF portfolio: {str(e)}")

    # ========================================================================
    # BANK ACCOUNT OPERATIONS
    # ========================================================================

    async def save_bank_portfolio(
            self,
            user_id: str,
            portfolio: BankPortfolio) -> bool:
        """Save user's banking portfolio"""
        try:
            doc_ref = self.db.collection(
                self.collections.BANK_ACCOUNTS).document(user_id)
            data = portfolio.dict()
            data['last_updated'] = datetime.utcnow()
            doc_ref.set(data)
            return True
        except Exception as e:
            raise Exception(f"Failed to save bank portfolio: {str(e)}")

    async def get_bank_portfolio(
            self, user_id: str) -> Optional[BankPortfolio]:
        """Get user's banking portfolio"""
        try:
            doc_ref = self.db.collection(
                self.collections.BANK_ACCOUNTS).document(user_id)
            doc = doc_ref.get()

            if doc.exists:
                return BankPortfolio(**doc.to_dict())
            return None
        except Exception as e:
            raise Exception(f"Failed to get bank portfolio: {str(e)}")

    # ========================================================================
    # EQUITY PORTFOLIO OPERATIONS
    # ========================================================================

    async def save_equity_portfolio(
            self,
            user_id: str,
            portfolio: EquityPortfolio) -> bool:
        """Save user's equity portfolio"""
        try:
            doc_ref = self.db.collection(
                self.collections.EQUITY_PORTFOLIOS).document(user_id)
            data = portfolio.dict()
            data['last_updated'] = datetime.utcnow()
            doc_ref.set(data)
            return True
        except Exception as e:
            raise Exception(f"Failed to save equity portfolio: {str(e)}")

    async def get_equity_portfolio(
            self, user_id: str) -> Optional[EquityPortfolio]:
        """Get user's equity portfolio"""
        try:
            doc_ref = self.db.collection(
                self.collections.EQUITY_PORTFOLIOS).document(user_id)
            doc = doc_ref.get()

            if doc.exists:
                return EquityPortfolio(**doc.to_dict())
            return None
        except Exception as e:
            raise Exception(f"Failed to get equity portfolio: {str(e)}")

    # ========================================================================
    # EPF OPERATIONS
    # ========================================================================

    async def save_epf_portfolio(
            self,
            user_id: str,
            portfolio: EPFPortfolio) -> bool:
        """Save user's EPF portfolio"""
        try:
            doc_ref = self.db.collection(
                self.collections.EPF_ACCOUNTS).document(user_id)
            data = portfolio.dict()
            data['last_updated'] = datetime.utcnow()
            doc_ref.set(data)
            return True
        except Exception as e:
            raise Exception(f"Failed to save EPF portfolio: {str(e)}")

    async def get_epf_portfolio(self, user_id: str) -> Optional[EPFPortfolio]:
        """Get user's EPF portfolio"""
        try:
            doc_ref = self.db.collection(
                self.collections.EPF_ACCOUNTS).document(user_id)
            doc = doc_ref.get()

            if doc.exists:
                return EPFPortfolio(**doc.to_dict())
            return None
        except Exception as e:
            raise Exception(f"Failed to get EPF portfolio: {str(e)}")

    # ========================================================================
    # CREDIT REPORT OPERATIONS
    # ========================================================================

    async def save_credit_portfolio(
            self,
            user_id: str,
            portfolio: CreditPortfolio) -> bool:
        """Save user's credit portfolio"""
        try:
            doc_ref = self.db.collection(
                self.collections.CREDIT_REPORTS).document(user_id)
            data = portfolio.dict()
            data['last_updated'] = datetime.utcnow()
            doc_ref.set(data)
            return True
        except Exception as e:
            raise Exception(f"Failed to save credit portfolio: {str(e)}")

    async def get_credit_portfolio(
            self, user_id: str) -> Optional[CreditPortfolio]:
        """Get user's credit portfolio"""
        try:
            doc_ref = self.db.collection(
                self.collections.CREDIT_REPORTS).document(user_id)
            doc = doc_ref.get()

            if doc.exists:
                return CreditPortfolio(**doc.to_dict())
            return None
        except Exception as e:
            raise Exception(f"Failed to get credit portfolio: {str(e)}")

    # ========================================================================
    # COMPREHENSIVE FINANCIAL PROFILE OPERATIONS
    # ========================================================================

    async def save_financial_profile(
            self, profile: UserFinancialProfile) -> bool:
        """Save complete user financial profile"""
        try:
            # Calculate aggregates before saving
            profile.calculate_aggregates()
            profile.data_completeness = profile.get_data_completeness()

            doc_ref = self.db.collection(
                self.collections.FINANCIAL_PROFILES).document(
                profile.user_id)
            data = profile.dict()
            data['last_sync'] = datetime.utcnow()
            doc_ref.set(data)
            return True
        except Exception as e:
            raise Exception(f"Failed to save financial profile: {str(e)}")

    async def get_financial_profile(
            self, user_id: str) -> Optional[UserFinancialProfile]:
        """Get complete user financial profile"""
        try:
            doc_ref = self.db.collection(
                self.collections.FINANCIAL_PROFILES).document(user_id)
            doc = doc_ref.get()

            if doc.exists:
                return UserFinancialProfile(**doc.to_dict())
            return None
        except Exception as e:
            raise Exception(f"Failed to get financial profile: {str(e)}")

    async def get_all_user_profiles(
            self, limit: int = 100) -> List[UserFinancialProfile]:
        """Get all user financial profiles"""
        try:
            docs = self.db.collection(
                self.collections.FINANCIAL_PROFILES).limit(limit).stream()
            profiles = []

            for doc in docs:
                profiles.append(UserFinancialProfile(**doc.to_dict()))

            return profiles
        except Exception as e:
            raise Exception(f"Failed to get all profiles: {str(e)}")

    # ========================================================================
    # ANALYTICS AND AGGREGATION OPERATIONS
    # ========================================================================

    async def get_user_summary(self, user_id: str) -> Dict[str, Any]:
        """Get user financial summary"""
        try:
            profile = await self.get_financial_profile(user_id)
            if not profile:
                return {}

            return {
                "user_id": user_id,
                "total_net_worth": profile.total_net_worth,
                "total_assets": profile.total_assets,
                "total_liabilities": profile.total_liabilities,
                "credit_score": profile.credit_score,
                "data_completeness": profile.data_completeness,
                "last_sync": profile.last_sync,
                "portfolio_breakdown": {
                    "mutual_funds": profile.mutual_funds.total_current_value if profile.mutual_funds else 0,
                    "banking": profile.banking.total_balance if profile.banking else 0,
                    "equities": profile.equities.total_current_value if profile.equities else 0,
                    "epf": profile.epf.total_balance if profile.epf else 0,
                }}
        except Exception as e:
            raise Exception(f"Failed to get user summary: {str(e)}")

    async def get_users_by_net_worth_range(
            self, min_worth: float, max_worth: float) -> List[str]:
        """Get users within a net worth range"""
        try:
            query = self.db.collection(
                self.collections.FINANCIAL_PROFILES).where(
                filter=FieldFilter(
                    "total_net_worth",
                    ">=",
                    min_worth)).where(
                filter=FieldFilter(
                    "total_net_worth",
                    "<=",
                    max_worth))

            docs = query.stream()
            return [doc.id for doc in docs]
        except Exception as e:
            raise Exception(
                f"Failed to get users by net worth range: {
                    str(e)}")

    async def get_users_by_credit_score_range(
            self, min_score: int, max_score: int) -> List[str]:
        """Get users within a credit score range"""
        try:
            query = self.db.collection(
                self.collections.FINANCIAL_PROFILES).where(
                filter=FieldFilter(
                    "credit_score",
                    ">=",
                    min_score)).where(
                filter=FieldFilter(
                    "credit_score",
                    "<=",
                    max_score))

            docs = query.stream()
            return [doc.id for doc in docs]
        except Exception as e:
            raise Exception(
                f"Failed to get users by credit score range: {
                    str(e)}")

    # ========================================================================
    # BATCH OPERATIONS
    # ========================================================================

    async def batch_save_financial_data(
            self, user_id: str, data: Dict[str, Any]) -> bool:
        """Save all financial data for a user in a batch operation"""
        try:
            batch = self.db.batch()

            # Save each component if present
            if 'net_worth' in data:
                doc_ref = self.db.collection(
                    self.collections.NET_WORTH).document(user_id)
                batch.set(doc_ref,
                          {**data['net_worth'],
                           'user_id': user_id,
                           'last_updated': datetime.utcnow()})

            if 'mutual_funds' in data:
                doc_ref = self.db.collection(
                    self.collections.MUTUAL_FUNDS).document(user_id)
                batch.set(
                    doc_ref, {
                        **data['mutual_funds'], 'last_updated': datetime.utcnow()})

            if 'banking' in data:
                doc_ref = self.db.collection(
                    self.collections.BANK_ACCOUNTS).document(user_id)
                batch.set(
                    doc_ref, {
                        **data['banking'], 'last_updated': datetime.utcnow()})

            if 'equities' in data:
                doc_ref = self.db.collection(
                    self.collections.EQUITY_PORTFOLIOS).document(user_id)
                batch.set(
                    doc_ref, {
                        **data['equities'], 'last_updated': datetime.utcnow()})

            if 'epf' in data:
                doc_ref = self.db.collection(
                    self.collections.EPF_ACCOUNTS).document(user_id)
                batch.set(
                    doc_ref, {
                        **data['epf'], 'last_updated': datetime.utcnow()})

            if 'credit' in data:
                doc_ref = self.db.collection(
                    self.collections.CREDIT_REPORTS).document(user_id)
                batch.set(
                    doc_ref, {
                        **data['credit'], 'last_updated': datetime.utcnow()})

            # Commit batch
            batch.commit()
            return True
        except Exception as e:
            raise Exception(f"Failed to batch save financial data: {str(e)}")

    # ========================================================================
    # UTILITY METHODS
    # ========================================================================

    async def delete_user_data(self, user_id: str) -> bool:
        """Delete all financial data for a user"""
        try:
            batch = self.db.batch()

            collections = [
                self.collections.USER_PROFILES,
                self.collections.NET_WORTH,
                self.collections.MUTUAL_FUNDS,
                self.collections.BANK_ACCOUNTS,
                self.collections.EQUITY_PORTFOLIOS,
                self.collections.EPF_ACCOUNTS,
                self.collections.CREDIT_REPORTS,
                self.collections.FINANCIAL_PROFILES
            ]

            for collection in collections:
                doc_ref = self.db.collection(collection).document(user_id)
                batch.delete(doc_ref)

            batch.commit()
            return True
        except Exception as e:
            raise Exception(f"Failed to delete user data: {str(e)}")

    async def health_check(self) -> bool:
        """Check Firestore connection health"""
        try:
            # Try to read from a test collection
            test_ref = self.db.collection('health_check').document('test')
            test_ref.set({'timestamp': datetime.utcnow()})
            return True
        except Exception:
            return False


# Global service instance
firestore_service = FirestoreFinancialService()
