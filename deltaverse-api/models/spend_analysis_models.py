"""
Spend Analysis Models for DeltaVerse
Handles categorization, trends, and insights for user spending
"""

from datetime import datetime, date
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field
from enum import Enum


class SpendCategory(str, Enum):
    """Spending categories for transaction classification"""
    HOUSING = "CATEGORY_HOUSING"
    TRANSPORTATION = "CATEGORY_TRANSPORTATION"
    FOOD = "CATEGORY_FOOD"
    UTILITIES = "CATEGORY_UTILITIES"
    HEALTHCARE = "CATEGORY_HEALTHCARE"
    INSURANCE = "CATEGORY_INSURANCE"
    ENTERTAINMENT = "CATEGORY_ENTERTAINMENT"
    SHOPPING = "CATEGORY_SHOPPING"
    EDUCATION = "CATEGORY_EDUCATION"
    PERSONAL_CARE = "CATEGORY_PERSONAL_CARE"
    TRAVEL = "CATEGORY_TRAVEL"
    INVESTMENTS = "CATEGORY_INVESTMENTS"
    DEBT_PAYMENTS = "CATEGORY_DEBT_PAYMENTS"
    GIFTS_DONATIONS = "CATEGORY_GIFTS_DONATIONS"
    TAXES = "CATEGORY_TAXES"
    MISCELLANEOUS = "CATEGORY_MISCELLANEOUS"
    INCOME = "CATEGORY_INCOME"


class SpendSubCategory(str, Enum):
    """Sub-categories for more detailed classification"""
    # Housing
    RENT = "SUBCATEGORY_RENT"
    MORTGAGE = "SUBCATEGORY_MORTGAGE"
    PROPERTY_TAX = "SUBCATEGORY_PROPERTY_TAX"
    HOME_MAINTENANCE = "SUBCATEGORY_HOME_MAINTENANCE"
    HOME_IMPROVEMENT = "SUBCATEGORY_HOME_IMPROVEMENT"
    
    # Transportation
    FUEL = "SUBCATEGORY_FUEL"
    PUBLIC_TRANSIT = "SUBCATEGORY_PUBLIC_TRANSIT"
    CAR_MAINTENANCE = "SUBCATEGORY_CAR_MAINTENANCE"
    CAR_INSURANCE = "SUBCATEGORY_CAR_INSURANCE"
    RIDE_SHARING = "SUBCATEGORY_RIDE_SHARING"
    
    # Food
    GROCERIES = "SUBCATEGORY_GROCERIES"
    RESTAURANTS = "SUBCATEGORY_RESTAURANTS"
    FOOD_DELIVERY = "SUBCATEGORY_FOOD_DELIVERY"
    COFFEE_SHOPS = "SUBCATEGORY_COFFEE_SHOPS"
    
    # Utilities
    ELECTRICITY = "SUBCATEGORY_ELECTRICITY"
    WATER = "SUBCATEGORY_WATER"
    INTERNET = "SUBCATEGORY_INTERNET"
    MOBILE_PHONE = "SUBCATEGORY_MOBILE_PHONE"
    GAS = "SUBCATEGORY_GAS"
    
    # Healthcare
    DOCTOR_VISITS = "SUBCATEGORY_DOCTOR_VISITS"
    MEDICATIONS = "SUBCATEGORY_MEDICATIONS"
    HOSPITAL = "SUBCATEGORY_HOSPITAL"
    DENTAL = "SUBCATEGORY_DENTAL"
    VISION = "SUBCATEGORY_VISION"
    
    # Entertainment
    STREAMING_SERVICES = "SUBCATEGORY_STREAMING_SERVICES"
    MOVIES = "SUBCATEGORY_MOVIES"
    CONCERTS = "SUBCATEGORY_CONCERTS"
    SUBSCRIPTIONS = "SUBCATEGORY_SUBSCRIPTIONS"
    HOBBIES = "SUBCATEGORY_HOBBIES"
    
    # Shopping
    CLOTHING = "SUBCATEGORY_CLOTHING"
    ELECTRONICS = "SUBCATEGORY_ELECTRONICS"
    HOME_GOODS = "SUBCATEGORY_HOME_GOODS"
    ONLINE_SHOPPING = "SUBCATEGORY_ONLINE_SHOPPING"
    
    # Income
    SALARY = "SUBCATEGORY_SALARY"
    BONUS = "SUBCATEGORY_BONUS"
    INTEREST = "SUBCATEGORY_INTEREST"
    DIVIDENDS = "SUBCATEGORY_DIVIDENDS"
    RENTAL_INCOME = "SUBCATEGORY_RENTAL_INCOME"
    
    # Other
    OTHER = "SUBCATEGORY_OTHER"


class TransactionFrequency(str, Enum):
    """Transaction frequency patterns"""
    DAILY = "FREQUENCY_DAILY"
    WEEKLY = "FREQUENCY_WEEKLY"
    BIWEEKLY = "FREQUENCY_BIWEEKLY"
    MONTHLY = "FREQUENCY_MONTHLY"
    QUARTERLY = "FREQUENCY_QUARTERLY"
    ANNUAL = "FREQUENCY_ANNUAL"
    IRREGULAR = "FREQUENCY_IRREGULAR"
    ONE_TIME = "FREQUENCY_ONE_TIME"


class SpendingTrend(str, Enum):
    """Spending trend indicators"""
    INCREASING = "TREND_INCREASING"
    DECREASING = "TREND_DECREASING"
    STABLE = "TREND_STABLE"
    VOLATILE = "TREND_VOLATILE"
    SEASONAL = "TREND_SEASONAL"


class InsightSeverity(str, Enum):
    """Severity levels for spending insights"""
    INFO = "SEVERITY_INFO"
    LOW = "SEVERITY_LOW"
    MEDIUM = "SEVERITY_MEDIUM"
    HIGH = "SEVERITY_HIGH"
    CRITICAL = "SEVERITY_CRITICAL"


class InsightType(str, Enum):
    """Types of spending insights"""
    OVERSPENDING = "INSIGHT_OVERSPENDING"
    SAVINGS_OPPORTUNITY = "INSIGHT_SAVINGS_OPPORTUNITY"
    UNUSUAL_TRANSACTION = "INSIGHT_UNUSUAL_TRANSACTION"
    RECURRING_CHARGE = "INSIGHT_RECURRING_CHARGE"
    DUPLICATE_PAYMENT = "INSIGHT_DUPLICATE_PAYMENT"
    CATEGORY_CHANGE = "INSIGHT_CATEGORY_CHANGE"
    BUDGET_ALERT = "INSIGHT_BUDGET_ALERT"
    POSITIVE_TREND = "INSIGHT_POSITIVE_TREND"


class CategorizedTransaction(BaseModel):
    """Transaction with spending category information"""
    transaction_id: str
    transaction_date: date
    amount: float
    description: str
    category: SpendCategory
    sub_category: Optional[SpendSubCategory] = None
    merchant: Optional[str] = None
    is_recurring: bool = False
    frequency: Optional[TransactionFrequency] = None
    confidence_score: float = 1.0  # AI categorization confidence (0-1)


class CategorySummary(BaseModel):
    """Summary of spending by category"""
    category: SpendCategory
    total_amount: float
    transaction_count: int
    average_transaction: float
    percentage_of_total: float
    trend: SpendingTrend
    month_over_month_change: float  # Percentage change


class MerchantSummary(BaseModel):
    """Summary of spending by merchant"""
    merchant_name: str
    total_amount: float
    transaction_count: int
    average_transaction: float
    categories: List[SpendCategory]
    most_recent_transaction: date
    trend: SpendingTrend


class SpendingInsight(BaseModel):
    """AI-generated insight about spending patterns"""
    insight_id: str = Field(default_factory=lambda: datetime.now().strftime("%Y%m%d%H%M%S"))
    type: InsightType
    title: str
    description: str
    severity: InsightSeverity
    category: Optional[SpendCategory] = None
    merchant: Optional[str] = None
    amount_impact: Optional[float] = None
    related_transactions: List[str] = []  # List of transaction IDs
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_read: bool = False
    is_actioned: bool = False


class MonthlySpendingSummary(BaseModel):
    """Monthly spending summary"""
    year: int
    month: int
    total_spending: float
    total_income: float
    net_cashflow: float
    top_categories: List[CategorySummary] = []
    top_merchants: List[MerchantSummary] = []
    category_breakdown: Dict[str, float] = {}
    daily_spending: Dict[str, float] = {}  # Date string to amount
    insights: List[SpendingInsight] = []
    month_over_month_change: float = 0.0


class SpendAnalysisReport(BaseModel):
    """Complete spend analysis report"""
    user_id: str
    current_month_summary: MonthlySpendingSummary
    previous_months: List[MonthlySpendingSummary] = []
    categorized_transactions: List[CategorizedTransaction] = []
    recurring_expenses: List[CategorizedTransaction] = []
    top_spending_categories: List[CategorySummary] = []
    top_merchants: List[MerchantSummary] = []
    insights: List[SpendingInsight] = []
    last_updated: datetime = Field(default_factory=datetime.utcnow)


class SpendingBudget(BaseModel):
    """User-defined spending budget"""
    budget_id: str
    user_id: str
    category: SpendCategory
    sub_category: Optional[SpendSubCategory] = None
    amount: float
    period: TransactionFrequency
    start_date: date
    end_date: Optional[date] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class BudgetStatus(BaseModel):
    """Current status of a budget"""
    budget_id: str
    current_spending: float
    budget_amount: float
    remaining_amount: float
    percentage_used: float
    days_remaining: int
    projected_overspend: Optional[float] = None
    status: str  # "on_track", "warning", "over_budget"


class UserSpendingProfile(BaseModel):
    """User spending profile with preferences and history"""
    user_id: str
    spending_reports: Dict[str, SpendAnalysisReport] = {}  # YYYY-MM to report
    budgets: List[SpendingBudget] = []
    budget_statuses: Dict[str, BudgetStatus] = {}  # budget_id to status
    spending_preferences: Dict[str, Any] = {}
    category_rules: Dict[str, Dict[str, Any]] = {}  # Custom categorization rules
    last_updated: datetime = Field(default_factory=datetime.utcnow)


class FirestoreSpendCollections:
    """Firestore collection names for spend analysis"""
    SPENDING_PROFILES = "spending_profiles"
    CATEGORIZED_TRANSACTIONS = "categorized_transactions"
    MONTHLY_SUMMARIES = "monthly_summaries"
    SPENDING_INSIGHTS = "spending_insights"
    SPENDING_BUDGETS = "spending_budgets"
    MERCHANT_PROFILES = "merchant_profiles"