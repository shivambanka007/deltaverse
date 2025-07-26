"""
Spend Analysis Service
Handles transaction categorization, insights generation, and spending analytics
"""

import re
from datetime import datetime, date, timedelta
from typing import List, Dict, Any, Optional
from collections import defaultdict, Counter

from ..models.spend_analysis_models import *
from ..models.financial_models import BankTransaction, TransactionType
from ..config.spend_analysis_config import CATEGORY_KEYWORDS, INSIGHTS_CONFIG, CONFIDENCE_SCORES
from .firestore_service import firestore_service


class SpendAnalysisService:
    """Service for analyzing spending patterns and generating insights"""

    def __init__(self):
        self.category_keywords = CATEGORY_KEYWORDS
        self.insights_config = INSIGHTS_CONFIG
        self.confidence_scores = CONFIDENCE_SCORES

    async def categorize_transaction(self, transaction: BankTransaction) -> CategorizedTransaction:
        """Categorize a single transaction using AI-like rules"""
        description = transaction.transaction_narration.lower()
        amount = abs(transaction.amount)
        
        # Determine category based on keywords
        category = SpendCategory.MISCELLANEOUS
        confidence = self.confidence_scores["default"]
        
        for cat, keywords in self.category_keywords.items():
            if any(keyword in description for keyword in keywords):
                category = cat
                confidence = self.confidence_scores["keyword_match"]
                break
        
        # Special handling for income
        if transaction.transaction_type == TransactionType.CREDIT and amount > self.insights_config["income_detection_threshold"]:
            category = SpendCategory.INCOME
            confidence = self.confidence_scores["income_detection"]
        
        # Extract merchant name
        merchant = self._extract_merchant_name(description)
        
        return CategorizedTransaction(
            transaction_id=f"{transaction.transaction_date}_{hash(description)}",
            transaction_date=transaction.transaction_date,
            amount=amount,
            description=transaction.transaction_narration,
            category=category,
            merchant=merchant,
            confidence_score=confidence
        )

    def _extract_merchant_name(self, description: str) -> Optional[str]:
        """Extract merchant name from transaction description"""
        # Simple merchant extraction logic
        words = description.split()
        if len(words) > 0:
            return words[0].title()
        return None

    async def generate_monthly_summary(self, user_id: str, year: int, month: int) -> MonthlySpendingSummary:
        """Generate monthly spending summary"""
        # Get user's bank portfolio
        bank_portfolio = await firestore_service.get_bank_portfolio(user_id)
        if not bank_portfolio:
            return self._empty_monthly_summary(year, month)

        # Categorize all transactions for the month
        categorized_transactions = []
        total_spending = 0
        total_income = 0
        category_totals = defaultdict(float)
        merchant_totals = defaultdict(float)
        daily_spending = defaultdict(float)

        for account in bank_portfolio.accounts:
            for transaction in account.transactions:
                if (transaction.transaction_date.year == year and 
                    transaction.transaction_date.month == month):
                    
                    categorized = await self.categorize_transaction(transaction)
                    categorized_transactions.append(categorized)
                    
                    if categorized.category == SpendCategory.INCOME:
                        total_income += categorized.amount
                    else:
                        total_spending += categorized.amount
                        category_totals[categorized.category.value] += categorized.amount
                        if categorized.merchant:
                            merchant_totals[categorized.merchant] += categorized.amount
                    
                    day_key = categorized.transaction_date.strftime("%Y-%m-%d")
                    daily_spending[day_key] += categorized.amount

        # Generate category summaries
        top_categories = []
        for category, amount in sorted(category_totals.items(), key=lambda x: x[1], reverse=True)[:5]:
            top_categories.append(CategorySummary(
                category=SpendCategory(category),
                total_amount=amount,
                transaction_count=sum(1 for t in categorized_transactions if t.category.value == category),
                average_transaction=amount / max(1, sum(1 for t in categorized_transactions if t.category.value == category)),
                percentage_of_total=(amount / total_spending * 100) if total_spending > 0 else 0,
                trend=SpendingTrend.STABLE,
                month_over_month_change=0.0
            ))

        # Generate insights
        insights = await self._generate_insights(categorized_transactions, category_totals, total_spending)

        return MonthlySpendingSummary(
            year=year,
            month=month,
            total_spending=total_spending,
            total_income=total_income,
            net_cashflow=total_income - total_spending,
            top_categories=top_categories,
            category_breakdown=dict(category_totals),
            daily_spending=dict(daily_spending),
            insights=insights
        )

    async def _generate_insights(self, transactions: List[CategorizedTransaction], 
                                category_totals: Dict[str, float], total_spending: float) -> List[SpendingInsight]:
        """Generate AI insights from spending data"""
        insights = []
        
        # High spending category insight
        if category_totals:
            top_category = max(category_totals.items(), key=lambda x: x[1])
            if top_category[1] > total_spending * self.insights_config["overspending_threshold"]:
                insights.append(SpendingInsight(
                    type=InsightType.OVERSPENDING,
                    title=f"High {top_category[0].replace('CATEGORY_', '').title()} Spending",
                    description=f"You spent ₹{top_category[1]:,.0f} on {top_category[0].replace('CATEGORY_', '').lower()}, which is {top_category[1]/total_spending*100:.1f}% of your total spending.",
                    severity=InsightSeverity.MEDIUM,
                    category=SpendCategory(top_category[0]),
                    amount_impact=top_category[1]
                ))
        
        # Savings opportunity
        food_spending = category_totals.get(SpendCategory.FOOD.value, 0)
        if food_spending > self.insights_config["high_food_spending_threshold"]:
            insights.append(SpendingInsight(
                type=InsightType.SAVINGS_OPPORTUNITY,
                title="Food Spending Optimization",
                description=f"You spent ₹{food_spending:,.0f} on food. Consider cooking more at home to save ₹{food_spending*self.insights_config['savings_opportunity_percentage']:,.0f} monthly.",
                severity=InsightSeverity.LOW,
                category=SpendCategory.FOOD,
                amount_impact=food_spending * self.insights_config['savings_opportunity_percentage']
            ))
        
        # Positive cashflow insight
        net_cashflow = sum(t.amount for t in transactions if t.category == SpendCategory.INCOME) - total_spending
        if net_cashflow > 0:
            insights.append(SpendingInsight(
                type=InsightType.POSITIVE_TREND,
                title="Positive Cash Flow",
                description=f"Great job! You saved ₹{net_cashflow:,.0f} this month. Consider investing this surplus.",
                severity=InsightSeverity.INFO,
                amount_impact=net_cashflow
            ))
        
        return insights

    def _empty_monthly_summary(self, year: int, month: int) -> MonthlySpendingSummary:
        """Return empty monthly summary"""
        return MonthlySpendingSummary(
            year=year,
            month=month,
            total_spending=0,
            total_income=0,
            net_cashflow=0
        )

    async def get_spend_analysis_report(self, user_id: str) -> SpendAnalysisReport:
        """Generate complete spend analysis report"""
        current_date = datetime.now()
        current_month_summary = await self.generate_monthly_summary(
            user_id, current_date.year, current_date.month
        )
        
        # Get previous month for comparison
        prev_month = current_date.replace(day=1) - timedelta(days=1)
        prev_month_summary = await self.generate_monthly_summary(
            user_id, prev_month.year, prev_month.month
        )
        
        return SpendAnalysisReport(
            user_id=user_id,
            current_month_summary=current_month_summary,
            previous_months=[prev_month_summary],
            categorized_transactions=current_month_summary.top_categories,
            top_spending_categories=current_month_summary.top_categories,
            insights=current_month_summary.insights
        )


# Global service instance
spend_analysis_service = SpendAnalysisService()