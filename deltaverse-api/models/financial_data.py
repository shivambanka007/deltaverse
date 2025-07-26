"""
Financial Data Models
Pydantic models for structured financial data from Fi MCP Server
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from decimal import Decimal
from enum import Enum

class TransactionType(str, Enum):
    """Transaction types"""
    CREDIT = "credit"
    DEBIT = "debit"

class InvestmentType(str, Enum):
    """Investment types"""
    MUTUAL_FUND = "mutual_fund"
    STOCK = "stock"
    BOND = "bond"
    FD = "fixed_deposit"
    PPF = "ppf"
    EPF = "epf"

class BankTransaction(BaseModel):
    """Bank transaction model"""
    transaction_id: str
    date: datetime
    amount: Decimal
    type: TransactionType
    description: str
    category: Optional[str] = None
    account_number: str
    balance: Optional[Decimal] = None
    merchant: Optional[str] = None
    
class BankAccount(BaseModel):
    """Bank account model"""
    account_number: str
    bank_name: str
    account_type: str
    current_balance: Decimal
    transactions: List[BankTransaction] = []

class MutualFundHolding(BaseModel):
    """Mutual fund holding model"""
    fund_name: str
    fund_code: str
    units: Decimal
    nav: Decimal
    current_value: Decimal
    invested_amount: Decimal
    gain_loss: Decimal
    gain_loss_percentage: Decimal
    sip_amount: Optional[Decimal] = None
    sip_date: Optional[int] = None

class StockHolding(BaseModel):
    """Stock holding model"""
    symbol: str
    company_name: str
    quantity: int
    average_price: Decimal
    current_price: Decimal
    current_value: Decimal
    invested_amount: Decimal
    gain_loss: Decimal
    gain_loss_percentage: Decimal

class CreditScore(BaseModel):
    """Credit score model"""
    score: int
    score_range: str  # e.g., "300-850"
    rating: str  # e.g., "Excellent", "Good", "Fair"
    last_updated: datetime
    factors_affecting: List[str] = []

class CreditAccount(BaseModel):
    """Credit account model"""
    account_type: str  # credit_card, loan, etc.
    bank_name: str
    account_number: str
    credit_limit: Optional[Decimal] = None
    outstanding_amount: Decimal
    minimum_due: Optional[Decimal] = None
    due_date: Optional[datetime] = None
    status: str

class EPFAccount(BaseModel):
    """EPF account model"""
    uan_number: str
    pf_number: str
    employee_contribution: Decimal
    employer_contribution: Decimal
    total_balance: Decimal
    last_contribution_date: Optional[datetime] = None
    nominee_details: Optional[Dict[str, Any]] = None

class NetWorthBreakdown(BaseModel):
    """Net worth breakdown model"""
    total_assets: Decimal
    total_liabilities: Decimal
    net_worth: Decimal
    liquid_assets: Decimal
    invested_assets: Decimal
    fixed_assets: Decimal
    short_term_debt: Decimal
    long_term_debt: Decimal
    calculated_at: datetime

class FinancialProfile(BaseModel):
    """Complete financial profile model"""
    user_id: str
    bank_accounts: List[BankAccount] = []
    mutual_fund_holdings: List[MutualFundHolding] = []
    stock_holdings: List[StockHolding] = []
    credit_score: Optional[CreditScore] = None
    credit_accounts: List[CreditAccount] = []
    epf_account: Optional[EPFAccount] = None
    net_worth: Optional[NetWorthBreakdown] = None
    last_updated: datetime
    data_sources: List[str] = []

class FinancialDataCategory(str, Enum):
    """Financial data categories for organization"""
    INCOME = "income"
    EXPENSES = "expenses"
    INVESTMENTS = "investments"
    DEBTS = "debts"
    ASSETS = "assets"
    INSURANCE = "insurance"
    TAX = "tax"
    RETIREMENT = "retirement"
    EMERGENCY_FUND = "emergency_fund"
    GOALS = "goals"

class CategorizedTransaction(BaseModel):
    """Transaction with AI-generated category"""
    original_transaction: BankTransaction
    ai_category: FinancialDataCategory
    subcategory: Optional[str] = None
    confidence_score: float = Field(ge=0.0, le=1.0)
    tags: List[str] = []

class FinancialInsight(BaseModel):
    """AI-generated financial insight"""
    insight_id: str
    user_id: str
    type: str  # trend, recommendation, alert, prediction
    title: str
    description: str
    category: FinancialDataCategory
    priority: str  # high, medium, low
    data_points: Dict[str, Any]
    generated_at: datetime
    expires_at: Optional[datetime] = None
    action_items: List[str] = []

class UserQuery(BaseModel):
    """User query model"""
    query_id: str
    user_id: str
    query_text: str
    intent: Optional[str] = None
    category: Optional[FinancialDataCategory] = None
    timestamp: datetime
    context_used: List[str] = []

class AIResponse(BaseModel):
    """AI response model"""
    response_id: str
    query_id: str
    user_id: str
    response_text: str
    confidence_score: float = Field(ge=0.0, le=1.0)
    data_sources: List[str] = []
    generated_at: datetime
    model_used: str  # gemma, gemini-pro, etc.

class ConversationHistory(BaseModel):
    """Conversation history model"""
    conversation_id: str
    user_id: str
    messages: List[Dict[str, Any]] = []
    started_at: datetime
    last_activity: datetime
    context_summary: Optional[str] = None

# Response models for API endpoints
class MCPDataResponse(BaseModel):
    """Response model for MCP data fetch"""
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: datetime
    data_types_fetched: List[str] = []

class FinancialSummary(BaseModel):
    """Financial summary for dashboard"""
    user_id: str
    total_balance: Decimal
    total_investments: Decimal
    total_debt: Decimal
    net_worth: Decimal
    monthly_income: Optional[Decimal] = None
    monthly_expenses: Optional[Decimal] = None
    savings_rate: Optional[float] = None
    credit_score: Optional[int] = None
    last_updated: datetime
