"""
Financial Data API Router
Handles all financial data endpoints for DeltaVerse
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List, Optional, Dict, Any
from datetime import datetime

from ..services.fi_mcp_client import FiMCPClient
from ..services.firestore_service import firestore_service
from ..models.financial_models import (
    UserFinancialProfile,
    UserProfile,
    NetWorthResponse,
    MFPortfolio,
    BankPortfolio,
    EquityPortfolio,
    EPFPortfolio,
    CreditPortfolio
)

router = APIRouter(prefix="/api/v1/financial", tags=["Financial Data"])

# ============================================================================
# USER PROFILE ENDPOINTS
# ============================================================================


@router.post("/users", response_model=Dict[str, str])
async def create_user_profile(profile: UserProfile):
    """Create a new user profile"""
    try:
        user_id = await firestore_service.create_user_profile(profile)
        return {
            "user_id": user_id,
            "message": "User profile created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/{user_id}", response_model=UserProfile)
async def get_user_profile(user_id: str):
    """Get user profile by ID"""
    try:
        profile = await firestore_service.get_user_profile(user_id)
        if not profile:
            raise HTTPException(
                status_code=404,
                detail="User profile not found")
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/users/{user_id}")
async def update_user_profile(user_id: str, updates: Dict[str, Any]):
    """Update user profile"""
    try:
        success = await firestore_service.update_user_profile(user_id, updates)
        if success:
            return {"message": "User profile updated successfully"}
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to update user profile")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# DATA SYNC ENDPOINTS
# ============================================================================


@router.post("/sync/{phone_number}")
async def sync_financial_data(
        phone_number: str,
        background_tasks: BackgroundTasks):
    """Sync financial data from Fi MCP server"""
    try:
        # Add background task to sync data
        background_tasks.add_task(sync_user_data_background, phone_number)

        return {
            "message": "Financial data sync initiated",
            "phone_number": phone_number,
            "status": "processing"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def sync_user_data_background(phone_number: str):
    """Background task to sync user financial data"""
    try:
        async with FiMCPClient() as client:
            # Fetch complete financial profile
            profile = await client.fetch_complete_financial_profile(phone_number)

            if profile:
                # Save to Firestore
                await firestore_service.save_financial_profile(profile)
                print(f"✅ Successfully synced data for user: {phone_number}")
            else:
                print(f"❌ Failed to sync data for user: {phone_number}")

    except Exception as e:
        print(f"❌ Error in background sync for {phone_number}: {str(e)}")


@router.get("/sync/{phone_number}/status")
async def get_sync_status(phone_number: str):
    """Get sync status for a user"""
    try:
        profile = await firestore_service.get_financial_profile(phone_number)

        if profile:
            return {
                "phone_number": phone_number,
                "last_sync": profile.last_sync,
                "data_completeness": profile.data_completeness,
                "status": "completed"
            }
        else:
            return {
                "phone_number": phone_number,
                "status": "not_found"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# NET WORTH ENDPOINTS
# ============================================================================


@router.get("/net-worth/{user_id}", response_model=NetWorthResponse)
async def get_net_worth(user_id: str):
    """Get user's net worth data"""
    try:
        net_worth = await firestore_service.get_net_worth(user_id)
        if not net_worth:
            raise HTTPException(
                status_code=404,
                detail="Net worth data not found")
        return net_worth
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/net-worth/{user_id}")
async def save_net_worth(user_id: str, net_worth: NetWorthResponse):
    """Save user's net worth data"""
    try:
        success = await firestore_service.save_net_worth(user_id, net_worth)
        if success:
            return {"message": "Net worth data saved successfully"}
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to save net worth data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# MUTUAL FUND ENDPOINTS
# ============================================================================


@router.get("/mutual-funds/{user_id}", response_model=MFPortfolio)
async def get_mf_portfolio(user_id: str):
    """Get user's mutual fund portfolio"""
    try:
        portfolio = await firestore_service.get_mf_portfolio(user_id)
        if not portfolio:
            raise HTTPException(status_code=404,
                                detail="Mutual fund portfolio not found")
        return portfolio
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mutual-funds/{user_id}")
async def save_mf_portfolio(user_id: str, portfolio: MFPortfolio):
    """Save user's mutual fund portfolio"""
    try:
        success = await firestore_service.save_mf_portfolio(user_id, portfolio)
        if success:
            return {"message": "Mutual fund portfolio saved successfully"}
        else:
            raise HTTPException(status_code=500,
                                detail="Failed to save mutual fund portfolio")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# BANKING ENDPOINTS
# ============================================================================


@router.get("/banking/{user_id}", response_model=BankPortfolio)
async def get_bank_portfolio(user_id: str):
    """Get user's banking portfolio"""
    try:
        portfolio = await firestore_service.get_bank_portfolio(user_id)
        if not portfolio:
            raise HTTPException(
                status_code=404,
                detail="Banking portfolio not found")
        return portfolio
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/banking/{user_id}")
async def save_bank_portfolio(user_id: str, portfolio: BankPortfolio):
    """Save user's banking portfolio"""
    try:
        success = await firestore_service.save_bank_portfolio(user_id, portfolio)
        if success:
            return {"message": "Banking portfolio saved successfully"}
        else:
            raise HTTPException(status_code=500,
                                detail="Failed to save banking portfolio")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# EQUITY ENDPOINTS
# ============================================================================


@router.get("/equities/{user_id}", response_model=EquityPortfolio)
async def get_equity_portfolio(user_id: str):
    """Get user's equity portfolio"""
    try:
        portfolio = await firestore_service.get_equity_portfolio(user_id)
        if not portfolio:
            raise HTTPException(
                status_code=404,
                detail="Equity portfolio not found")
        return portfolio
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/equities/{user_id}")
async def save_equity_portfolio(user_id: str, portfolio: EquityPortfolio):
    """Save user's equity portfolio"""
    try:
        success = await firestore_service.save_equity_portfolio(user_id, portfolio)
        if success:
            return {"message": "Equity portfolio saved successfully"}
        else:
            raise HTTPException(status_code=500,
                                detail="Failed to save equity portfolio")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# EPF ENDPOINTS
# ============================================================================


@router.get("/epf/{user_id}", response_model=EPFPortfolio)
async def get_epf_portfolio(user_id: str):
    """Get user's EPF portfolio"""
    try:
        portfolio = await firestore_service.get_epf_portfolio(user_id)
        if not portfolio:
            raise HTTPException(
                status_code=404,
                detail="EPF portfolio not found")
        return portfolio
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/epf/{user_id}")
async def save_epf_portfolio(user_id: str, portfolio: EPFPortfolio):
    """Save user's EPF portfolio"""
    try:
        success = await firestore_service.save_epf_portfolio(user_id, portfolio)
        if success:
            return {"message": "EPF portfolio saved successfully"}
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to save EPF portfolio")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# CREDIT REPORT ENDPOINTS
# ============================================================================


@router.get("/credit/{user_id}", response_model=CreditPortfolio)
async def get_credit_portfolio(user_id: str):
    """Get user's credit portfolio"""
    try:
        portfolio = await firestore_service.get_credit_portfolio(user_id)
        if not portfolio:
            raise HTTPException(
                status_code=404,
                detail="Credit portfolio not found")
        return portfolio
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/credit/{user_id}")
async def save_credit_portfolio(user_id: str, portfolio: CreditPortfolio):
    """Save user's credit portfolio"""
    try:
        success = await firestore_service.save_credit_portfolio(user_id, portfolio)
        if success:
            return {"message": "Credit portfolio saved successfully"}
        else:
            raise HTTPException(status_code=500,
                                detail="Failed to save credit portfolio")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# COMPREHENSIVE PROFILE ENDPOINTS
# ============================================================================


@router.get("/profile/{user_id}", response_model=UserFinancialProfile)
async def get_financial_profile(user_id: str):
    """Get complete user financial profile"""
    try:
        profile = await firestore_service.get_financial_profile(user_id)
        if not profile:
            raise HTTPException(
                status_code=404,
                detail="Financial profile not found")
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/profile/{user_id}")
async def save_financial_profile(user_id: str, profile: UserFinancialProfile):
    """Save complete user financial profile"""
    try:
        success = await firestore_service.save_financial_profile(profile)
        if success:
            return {"message": "Financial profile saved successfully"}
        else:
            raise HTTPException(status_code=500,
                                detail="Failed to save financial profile")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/profile/{user_id}/summary")
async def get_user_summary(user_id: str):
    """Get user financial summary"""
    try:
        summary = await firestore_service.get_user_summary(user_id)
        if not summary:
            raise HTTPException(
                status_code=404,
                detail="User summary not found")
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# ANALYTICS ENDPOINTS
# ============================================================================


@router.get("/analytics/net-worth-range")
async def get_users_by_net_worth_range(min_worth: float, max_worth: float):
    """Get users within a net worth range"""
    try:
        users = await firestore_service.get_users_by_net_worth_range(min_worth, max_worth)
        return {"users": users, "count": len(users)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/credit-score-range")
async def get_users_by_credit_score_range(min_score: int, max_score: int):
    """Get users within a credit score range"""
    try:
        users = await firestore_service.get_users_by_credit_score_range(min_score, max_score)
        return {"users": users, "count": len(users)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/all-profiles")
async def get_all_profiles(limit: int = 100):
    """Get all user financial profiles"""
    try:
        profiles = await firestore_service.get_all_user_profiles(limit)
        return {"profiles": profiles, "count": len(profiles)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# UTILITY ENDPOINTS
# ============================================================================


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        firestore_health = await firestore_service.health_check()

        fi_mcp_health = False
        async with FiMCPClient() as client:
            fi_mcp_health = await client.health_check()

        return {
            "status": "healthy" if firestore_health and fi_mcp_health else "unhealthy",
            "firestore": "connected" if firestore_health else "disconnected",
            "fi_mcp": "connected" if fi_mcp_health else "disconnected",
            "timestamp": datetime.utcnow()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/users/{user_id}")
async def delete_user_data(user_id: str):
    """Delete all financial data for a user"""
    try:
        success = await firestore_service.delete_user_data(user_id)
        if success:
            return {"message": "User data deleted successfully"}
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to delete user data")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# DEMO/TESTING ENDPOINTS
# ============================================================================


@router.post("/demo/populate-test-data")
async def populate_test_data():
    """Populate database with test data from Fi MCP mock server"""
    try:
        test_phone_numbers = [
            "2222222222",  # All assets connected
            "3333333333",  # Small MF portfolio
            "7777777777",  # Debt-heavy low performer
            "8888888888",  # SIP Samurai
            "1313131313",  # Balanced growth tracker
        ]

        async with FiMCPClient() as client:
            for phone_number in test_phone_numbers:
                try:
                    profile = await client.fetch_complete_financial_profile(phone_number)
                    if profile:
                        await firestore_service.save_financial_profile(profile)
                        print(f"✅ Populated data for {phone_number}")
                except Exception as e:
                    print(f"❌ Failed to populate data for {phone_number}: {str(e)}")

        return {
            "message": "Test data population completed",
            "phone_numbers": test_phone_numbers
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
