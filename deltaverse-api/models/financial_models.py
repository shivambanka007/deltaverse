"""
Financial Data Models for Fi MCP Integration
Based on Fi MCP API structure and Firestore collections
"""

from datetime import datetime, date
from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field
from enum import Enum

# ============================================================================
# ENUMS AND CONSTANTS
# ============================================================================


class AssetType(str, Enum):
    MUTUAL_FUND = "ASSET_TYPE_MUTUAL_FUND"
    EPF = "ASSET_TYPE_EPF"
    INDIAN_SECURITIES = "ASSET_TYPE_INDIAN_SECURITIES"
    US_SECURITIES = "ASSET_TYPE_US_SECURITIES"
    SAVINGS_ACCOUNTS = "ASSET_TYPE_SAVINGS_ACCOUNTS"
    FIXED_DEPOSITS = "ASSET_TYPE_FIXED_DEPOSITS"
    GOLD = "ASSET_TYPE_GOLD"
    REAL_ESTATE = "ASSET_TYPE_REAL_ESTATE"


class LiabilityType(str, Enum):
    HOME_LOAN = "LIABILITY_TYPE_HOME_LOAN"
    VEHICLE_LOAN = "LIABILITY_TYPE_VEHICLE_LOAN"
    PERSONAL_LOAN = "LIABILITY_TYPE_PERSONAL_LOAN"
    CREDIT_CARD = "LIABILITY_TYPE_CREDIT_CARD"
    OTHER_LOAN = "LIABILITY_TYPE_OTHER_LOAN"


class TransactionType(int, Enum):
    CREDIT = 1
    DEBIT = 2
    OPENING = 3
    INTEREST = 4
    TDS = 5
    INSTALLMENT = 6
    CLOSING = 7
    OTHERS = 8


class MFOrderType(int, Enum):
    BUY = 1
    SELL = 2


class AccountInstrumentType(str, Enum):
    DEPOSIT = "ACC_INSTRUMENT_TYPE_DEPOSIT"
    EQUITIES = "ACC_INSTRUMENT_TYPE_EQUITIES"
    MUTUAL_FUND = "ACC_INSTRUMENT_TYPE_MUTUAL_FUND"
    ETF = "ACC_INSTRUMENT_TYPE_ETF"
    REIT = "ACC_INSTRUMENT_TYPE_REIT"
    INVIT = "ACC_INSTRUMENT_TYPE_INVIT"

# ============================================================================
# BASE MODELS
# ============================================================================


class CurrencyValue(BaseModel):
    """Represents a monetary value with currency"""
    currency_code: str = "INR"
    units: str = "0"
    nanos: int = 0

    @property
    def amount(self) -> float:
        """Convert to float amount"""
        return float(self.units) + (self.nanos / 1_000_000_000)


class UserProfile(BaseModel):
    """User profile information"""
    user_id: str
    phone_number: str
    email: Optional[str] = None
    name: Optional[str] = None
    date_of_birth: Optional[date] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

    # Fi MCP specific
    fi_mcp_session_id: Optional[str] = None
    last_data_sync: Optional[datetime] = None

# ============================================================================
# NET WORTH MODELS
# ============================================================================


class AssetValue(BaseModel):
    """Individual asset value"""
    net_worth_attribute: AssetType
    value: CurrencyValue


class LiabilityValue(BaseModel):
    """Individual liability value"""
    net_worth_attribute: LiabilityType
    value: CurrencyValue


class NetWorthResponse(BaseModel):
    """Complete net worth response"""
    asset_values: List[AssetValue] = []
    liability_values: List[LiabilityValue] = []
    total_net_worth_value: CurrencyValue

    @property
    def total_assets(self) -> float:
        """Calculate total assets"""
        return sum(asset.value.amount for asset in self.asset_values)

    @property
    def total_liabilities(self) -> float:
        """Calculate total liabilities"""
        return sum(
            liability.value.amount for liability in self.liability_values)

# ============================================================================
# MUTUAL FUND MODELS
# ============================================================================


class SchemeDetail(BaseModel):
    """Mutual fund scheme details"""
    amc: str
    name_data: Dict[str, str]
    plan_type: str
    investment_type: str
    option_type: str
    nav: CurrencyValue
    asset_class: str
    isin_number: str
    category_name: str
    fundhouse_defined_risk_level: str


class SchemeAnalytics(BaseModel):
    """Mutual fund scheme analytics"""
    current_value: CurrencyValue
    invested_value: CurrencyValue
    xirr: float
    absolute_returns: CurrencyValue
    unrealised_returns: CurrencyValue
    nav_value: CurrencyValue
    units: float


class MFSchemeAnalytics(BaseModel):
    """Complete MF scheme with analytics"""
    scheme_detail: SchemeDetail
    enriched_analytics: Dict[str, Any]


class MFTransaction(BaseModel):
    """Mutual fund transaction"""
    isin: str
    scheme_name: str
    folio_id: str
    order_type: MFOrderType
    transaction_date: date
    purchase_price: float
    purchase_units: float
    transaction_amount: float


class MFPortfolio(BaseModel):
    """User's mutual fund portfolio"""
    user_id: str
    scheme_analytics: List[MFSchemeAnalytics] = []
    transactions: List[MFTransaction] = []
    total_current_value: float = 0
    total_invested_value: float = 0
    overall_xirr: float = 0
    last_updated: datetime = Field(default_factory=datetime.utcnow)

# ============================================================================
# BANK ACCOUNT MODELS
# ============================================================================


class BankTransaction(BaseModel):
    """Individual bank transaction"""
    transaction_amount: str
    transaction_narration: str
    transaction_date: date
    transaction_type: TransactionType
    transaction_mode: str
    current_balance: str

    @property
    def amount(self) -> float:
        """Get transaction amount as float"""
        return float(self.transaction_amount)


class BankAccount(BaseModel):
    """Bank account details"""
    bank_name: str
    account_id: str
    masked_account_number: str
    account_type: str
    ifsc_code: Optional[str] = None
    current_balance: CurrencyValue
    transactions: List[BankTransaction] = []


class BankPortfolio(BaseModel):
    """User's banking portfolio"""
    user_id: str
    accounts: List[BankAccount] = []
    total_balance: float = 0
    last_updated: datetime = Field(default_factory=datetime.utcnow)

# ============================================================================
# EQUITY/STOCK MODELS
# ============================================================================


class EquityHolding(BaseModel):
    """Individual equity holding"""
    isin: str
    issuer_name: str
    holding_type: str
    units: int
    last_traded_price: CurrencyValue
    isin_description: str

    @property
    def current_value(self) -> float:
        """Calculate current value of holding"""
        return self.units * self.last_traded_price.amount


class EquityAccount(BaseModel):
    """Equity account (Demat account)"""
    account_id: str
    fip_id: str
    masked_account_number: str
    current_value: CurrencyValue
    holdings: List[EquityHolding] = []


class StockTransaction(BaseModel):
    """Stock transaction"""
    isin: str
    transaction_date: date
    transaction_type: str  # BUY/SELL
    quantity: int
    price: float
    total_amount: float


class EquityPortfolio(BaseModel):
    """User's equity portfolio"""
    user_id: str
    accounts: List[EquityAccount] = []
    transactions: List[StockTransaction] = []
    total_current_value: float = 0
    last_updated: datetime = Field(default_factory=datetime.utcnow)

# ============================================================================
# EPF MODELS
# ============================================================================


class EPFBalance(BaseModel):
    """EPF balance details"""
    net_balance: str
    employee_share: Dict[str, str]
    employer_share: Dict[str, str]

    @property
    def total_balance(self) -> float:
        """Get total EPF balance"""
        return float(self.net_balance)


class EPFEstablishment(BaseModel):
    """EPF establishment details"""
    est_name: str
    member_id: str
    office: str
    doj_epf: str  # Date of joining
    doe_epf: str  # Date of exit
    doe_eps: str  # Date of exit from EPS
    pf_balance: EPFBalance


class EPFAccount(BaseModel):
    """EPF account details"""
    uan_number: str
    phone_number: str
    establishments: List[EPFEstablishment] = []
    overall_pf_balance: Dict[str, Any]

    @property
    def total_balance(self) -> float:
        """Get total EPF balance across all establishments"""
        return float(self.overall_pf_balance.get("current_pf_balance", "0"))


class EPFPortfolio(BaseModel):
    """User's EPF portfolio"""
    user_id: str
    uan_accounts: List[EPFAccount] = []
    total_balance: float = 0
    last_updated: datetime = Field(default_factory=datetime.utcnow)

# ============================================================================
# CREDIT REPORT MODELS
# ============================================================================


class CreditAccount(BaseModel):
    """Individual credit account"""
    subscriber_name: str
    portfolio_type: str
    account_type: str
    open_date: str
    highest_credit_or_original_loan_amount: str
    account_status: str
    payment_rating: str
    payment_history_profile: str
    current_balance: str
    amount_past_due: str
    date_reported: str
    rate_of_interest: Optional[str] = None
    currency_code: str = "INR"


class CreditScore(BaseModel):
    """Credit score information"""
    bureau_score: str
    bureau_score_confidence_level: str

    @property
    def score(self) -> int:
        """Get credit score as integer"""
        return int(self.bureau_score)


class CreditEnquiry(BaseModel):
    """Credit enquiry/CAPS"""
    subscriber_name: str
    date_of_request: Optional[str] = None
    enquiry_reason: str
    finance_purpose: str


class CreditReport(BaseModel):
    """Complete credit report"""
    report_date: str
    report_time: str
    credit_accounts: List[CreditAccount] = []
    score: CreditScore
    enquiries: List[CreditEnquiry] = []
    total_outstanding_balance: Dict[str, str]


class CreditPortfolio(BaseModel):
    """User's credit portfolio"""
    user_id: str
    credit_reports: List[CreditReport] = []
    current_score: int = 0
    total_outstanding: float = 0
    last_updated: datetime = Field(default_factory=datetime.utcnow)

# ============================================================================
# COMPREHENSIVE USER FINANCIAL PROFILE
# ============================================================================


class UserFinancialProfile(BaseModel):
    """Complete user financial profile"""
    user_id: str
    profile: UserProfile

    # Portfolio components
    net_worth: Optional[NetWorthResponse] = None
    mutual_funds: Optional[MFPortfolio] = None
    banking: Optional[BankPortfolio] = None
    equities: Optional[EquityPortfolio] = None
    epf: Optional[EPFPortfolio] = None
    credit: Optional[CreditPortfolio] = None

    # Aggregated metrics
    total_net_worth: float = 0
    total_assets: float = 0
    total_liabilities: float = 0
    credit_score: int = 0

    # Metadata
    last_sync: datetime = Field(default_factory=datetime.utcnow)
    data_completeness: float = 0.0  # Percentage of data available

    def calculate_aggregates(self):
        """Calculate aggregated financial metrics"""
        if self.net_worth:
            self.total_net_worth = self.net_worth.total_net_worth_value.amount
            self.total_assets = self.net_worth.total_assets
            self.total_liabilities = self.net_worth.total_liabilities

        if self.credit and self.credit.credit_reports:
            self.credit_score = self.credit.current_score

    def get_data_completeness(self) -> float:
        """Calculate data completeness percentage"""
        components = [
            self.net_worth,
            self.mutual_funds,
            self.banking,
            self.equities,
            self.epf,
            self.credit
        ]
        available = sum(1 for component in components if component is not None)
        return (available / len(components)) * 100

# ============================================================================
# FIRESTORE COLLECTION MODELS
# ============================================================================


class FirestoreCollections:
    """Firestore collection names"""
    USERS = "users"
    USER_PROFILES = "user_profiles"
    NET_WORTH = "net_worth"
    MUTUAL_FUNDS = "mutual_funds"
    BANK_ACCOUNTS = "bank_accounts"
    EQUITY_PORTFOLIOS = "equity_portfolios"
    EPF_ACCOUNTS = "epf_accounts"
    CREDIT_REPORTS = "credit_reports"
    FINANCIAL_PROFILES = "financial_profiles"

    # Sub-collections
    TRANSACTIONS = "transactions"
    HOLDINGS = "holdings"
    ANALYTICS = "analytics"
