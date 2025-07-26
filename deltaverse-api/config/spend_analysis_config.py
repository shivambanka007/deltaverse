"""
Spend Analysis Configuration
Configurable parameters for spend analysis feature
"""

from ..models.spend_analysis_models import SpendCategory

# Transaction categorization keywords
CATEGORY_KEYWORDS = {
    SpendCategory.FOOD: ["restaurant", "food", "grocery", "cafe", "pizza", "swiggy", "zomato", "dominos", "mcdonald", "kfc", "subway"],
    SpendCategory.TRANSPORTATION: ["fuel", "petrol", "uber", "ola", "metro", "bus", "taxi", "rapido", "auto"],
    SpendCategory.UTILITIES: ["electricity", "water", "internet", "mobile", "phone", "broadband", "wifi", "airtel", "jio", "vodafone"],
    SpendCategory.ENTERTAINMENT: ["netflix", "amazon prime", "spotify", "movie", "cinema", "hotstar", "youtube", "gaming"],
    SpendCategory.SHOPPING: ["amazon", "flipkart", "mall", "store", "shopping", "myntra", "ajio", "nykaa"],
    SpendCategory.HEALTHCARE: ["hospital", "pharmacy", "doctor", "medical", "clinic", "apollo", "fortis", "medplus"],
    SpendCategory.HOUSING: ["rent", "maintenance", "society", "apartment", "housing", "property"],
    SpendCategory.EDUCATION: ["school", "college", "course", "book", "education", "fees", "tuition"],
}

# AI Insights thresholds
INSIGHTS_CONFIG = {
    "overspending_threshold": 0.3,  # 30% of total spending
    "high_food_spending_threshold": 15000,  # INR
    "income_detection_threshold": 10000,  # INR
    "savings_opportunity_percentage": 0.3,  # 30% potential savings
}

# Currency settings
CURRENCY_CONFIG = {
    "default_currency": "INR",
    "currency_symbol": "₹",
    "locale": "en-IN"
}

# Category confidence scores
CONFIDENCE_SCORES = {
    "keyword_match": 0.8,
    "income_detection": 0.9,
    "default": 0.5
}