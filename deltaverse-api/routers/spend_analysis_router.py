"""
Spend Analysis API Router
Handles spend analysis endpoints for DeltaVerse
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel

# Import AI analyzer and mock client
try:
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.dirname(__file__)))
    from services.ai_spend_analyzer import ai_spend_analyzer
    from services.fi_mcp_client import fi_mcp_client
    AI_AVAILABLE = True
except ImportError:
    AI_AVAILABLE = False
    print("AI analyzer not available, using mock data")

# Standalone models for spend analysis
class SpendSummary(BaseModel):
    total_spending: float = 0
    total_income: float = 0
    net_cashflow: float = 0
    top_categories: list = []
    insights: list = []

class SpendInsight(BaseModel):
    title: str
    description: str
    severity: str = "info"
    amount_impact: float = 0

router = APIRouter(prefix="/api/v1/spend-analysis", tags=["Spend Analysis"])


@router.get("/report/{user_id}")
async def get_spend_analysis_report(user_id: str):
    """Get complete spend analysis report for user with AI analysis"""
    try:
        # Get transaction data from fi-mcp bank transactions
        data_source = "hardcoded"
        if AI_AVAILABLE:
            try:
                async with fi_mcp_client as client:
                    bank_portfolio = await client.fetch_bank_transactions(user_id)
                    if bank_portfolio and bank_portfolio.accounts:
                        # Convert fi-mcp bank transactions to spend analysis format
                        mock_transactions = []
                        for account in bank_portfolio.accounts:
                            for txn in account.transactions:
                                mock_transactions.append({
                                    "description": txn.transaction_narration,
                                    "amount": float(txn.transaction_amount),
                                    "date": txn.transaction_date.strftime("%Y-%m-%d"),
                                    "type": txn.transaction_type
                                })
                        data_source = "fi-mcp"
                    else:
                        # Fallback to hardcoded mock data
                        mock_transactions = [
                            {"description": "Swiggy Food Order", "amount": -450, "date": "2025-01-20"},
                            {"description": "Salary Credit", "amount": 85000, "date": "2025-01-01"}
                        ]
            except Exception as e:
                print(f"Error fetching fi-mcp data: {e}")
                mock_transactions = [
                    {"description": "Swiggy Food Order", "amount": -450, "date": "2025-01-20"},
                    {"description": "Salary Credit", "amount": 85000, "date": "2025-01-01"}
                ]
        else:
            mock_transactions = [
                {"description": "Swiggy Food Order", "amount": -450, "date": "2025-01-20"},
                {"description": "Uber Ride", "amount": -280, "date": "2025-01-20"}
            ]
        
        if AI_AVAILABLE:
            # Use AI analyzer for real insights
            ai_analysis = ai_spend_analyzer.analyze_spending_patterns(mock_transactions)
            insights = ai_analysis["insights"]
            categorized_transactions = ai_analysis["categorized_transactions"]
            ai_confidence = ai_analysis["ai_confidence"]
        else:
            # Fallback to mock insights
            insights = [
                {
                    "title": "High Food Spending",
                    "description": "You spent ₹18,500 on food this month, which is 35% of your total spending.",
                    "severity": "SEVERITY_MEDIUM",
                    "amount_impact": 5500
                }
            ]
            categorized_transactions = mock_transactions
            ai_confidence = 0.75
        
        # Calculate category breakdown from AI analysis
        category_totals = {}
        total_spending = 0
        
        for txn in categorized_transactions:
            if txn.get("category", "CATEGORY_MISCELLANEOUS") != "CATEGORY_INCOME":
                amount = abs(float(txn.get("amount", 0)))
                category = txn.get("category", "CATEGORY_MISCELLANEOUS")
                category_totals[category] = category_totals.get(category, 0) + amount
                total_spending += amount
        
        # Build top categories
        top_categories = []
        for category, amount in sorted(category_totals.items(), key=lambda x: x[1], reverse=True)[:5]:
            top_categories.append({
                "category": category,
                "total_amount": amount,
                "transaction_count": sum(1 for txn in categorized_transactions if txn.get("category") == category),
                "percentage_of_total": (amount / total_spending * 100) if total_spending > 0 else 0,
                "trend": "TREND_STABLE",
                "month_over_month_change": 0.0
            })
        
        return {
            "user_id": user_id,
            "current_month_summary": {
                "year": datetime.now().year,
                "month": datetime.now().month,
                "total_spending": total_spending,
                "total_income": 85000,
                "net_cashflow": 85000 - total_spending,
                "top_categories": top_categories,
                "insights": insights
            },
            "insights": insights,
            "ai_confidence": ai_confidence,
            "ai_enabled": AI_AVAILABLE,
            "data_source": data_source,
            "last_updated": datetime.utcnow()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/monthly/{user_id}")
async def get_monthly_summary(user_id: str, year: int = None, month: int = None):
    """Get monthly spending summary"""
    try:
        if not year or not month:
            current_date = datetime.now()
            year = current_date.year
            month = current_date.month
        
        return {
            "year": year,
            "month": month,
            "total_spending": 52340,
            "total_income": 85000,
            "net_cashflow": 32660,
            "top_categories": [
                {
                    "category": "CATEGORY_FOOD",
                    "total_amount": 18500,
                    "transaction_count": 45,
                    "average_transaction": 411,
                    "percentage_of_total": 35.3,
                    "trend": "TREND_STABLE",
                    "month_over_month_change": 2.1
                }
            ],
            "category_breakdown": {
                "CATEGORY_FOOD": 18500,
                "CATEGORY_TRANSPORTATION": 12000,
                "CATEGORY_UTILITIES": 8500
            },
            "daily_spending": {
                "2025-01-20": 1200,
                "2025-01-21": 850,
                "2025-01-22": 2100
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/insights/{user_id}")
async def get_spending_insights(user_id: str):
    """Get AI-generated spending insights"""
    try:
        mock_insights = [
            {
                "title": "High Food Spending",
                "description": "You spent ₹18,500 on food this month, which is 35% of your total spending.",
                "severity": "SEVERITY_MEDIUM",
                "type": "INSIGHT_OVERSPENDING",
                "amount_impact": 5500
            },
            {
                "title": "Positive Cash Flow",
                "description": "Great job! You saved ₹32,660 this month. Consider investing this surplus.",
                "severity": "SEVERITY_INFO",
                "type": "INSIGHT_POSITIVE_TREND",
                "amount_impact": 32660
            }
        ]
        return {
            "insights": mock_insights,
            "count": len(mock_insights)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories/{user_id}")
async def get_category_breakdown(user_id: str):
    """Get spending breakdown by category"""
    try:
        return {
            "categories": [
                {
                    "category": "CATEGORY_FOOD",
                    "total_amount": 18500,
                    "transaction_count": 45,
                    "percentage_of_total": 35.3
                },
                {
                    "category": "CATEGORY_TRANSPORTATION",
                    "total_amount": 12000,
                    "transaction_count": 28,
                    "percentage_of_total": 22.9
                }
            ],
            "breakdown": {
                "CATEGORY_FOOD": 18500,
                "CATEGORY_TRANSPORTATION": 12000,
                "CATEGORY_UTILITIES": 8500
            },
            "total_spending": 52340
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trends/{user_id}")
async def get_spending_trends(user_id: str):
    """Get spending trends over time"""
    try:
        current_date = datetime.now()
        trends = []
        
        # Mock trend data for last 3 months
        for i in range(3):
            month_date = current_date.replace(day=1) - timedelta(days=30 * i)
            trends.append({
                "month": f"{month_date.year}-{month_date.month:02d}",
                "total_spending": 52340 - (i * 2000),
                "total_income": 85000,
                "net_cashflow": 32660 + (i * 2000)
            })
        
        return {"trends": trends}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check for spend analysis service"""
    return {
        "status": "healthy",
        "service": "spend_analysis",
        "timestamp": datetime.utcnow()
    }