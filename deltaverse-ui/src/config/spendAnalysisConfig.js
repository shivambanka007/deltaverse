// Spend Analysis Configuration
export const SPEND_CONFIG = {
  // Currency settings
  currency: {
    code: 'INR',
    symbol: '₹',
    locale: 'en-IN'
  },
  
  // Category icons mapping
  categoryIcons: {
    'CATEGORY_FOOD': '🍽️',
    'CATEGORY_TRANSPORTATION': '🚗',
    'CATEGORY_UTILITIES': '⚡',
    'CATEGORY_ENTERTAINMENT': '🎬',
    'CATEGORY_SHOPPING': '🛍️',
    'CATEGORY_HEALTHCARE': '🏥',
    'CATEGORY_HOUSING': '🏠',
    'CATEGORY_EDUCATION': '📚',
    'CATEGORY_PERSONAL_CARE': '💄',
    'CATEGORY_TRAVEL': '✈️',
    'CATEGORY_INVESTMENTS': '📈',
    'CATEGORY_DEBT_PAYMENTS': '💳',
    'CATEGORY_GIFTS_DONATIONS': '🎁',
    'CATEGORY_TAXES': '📋',
    'CATEGORY_INSURANCE': '🛡️',
    'CATEGORY_MISCELLANEOUS': '💰',
    'CATEGORY_INCOME': '💵'
  },
  
  // Insight type icons
  insightIcons: {
    'INSIGHT_OVERSPENDING': '⚠️',
    'INSIGHT_SAVINGS_OPPORTUNITY': '💡',
    'INSIGHT_POSITIVE_TREND': '✅',
    'INSIGHT_BUDGET_ALERT': '🚨',
    'INSIGHT_UNUSUAL_TRANSACTION': '🔍',
    'INSIGHT_RECURRING_CHARGE': '🔄',
    'INSIGHT_DUPLICATE_PAYMENT': '⚡',
    'INSIGHT_CATEGORY_CHANGE': '📊'
  }
};

// Utility functions
export const formatCurrency = (amount, config = SPEND_CONFIG.currency) => {
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    maximumFractionDigits: 0
  }).format(amount);
};

export const getCategoryIcon = (category) => {
  return SPEND_CONFIG.categoryIcons[category] || '💰';
};

export const getInsightIcon = (type) => {
  return SPEND_CONFIG.insightIcons[type] || '📊';
};