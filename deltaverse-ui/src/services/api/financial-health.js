import { auth } from '../firebase/config';

const API_BASE_URL = process.env.REACT_APP_API_URL;

// Get Fi-MCP server URL based on environment
const getFiMcpServerUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_FI_MCP_URL || 'https://fi-mcp.deltaverse.app';
  }
  return process.env.REACT_APP_FI_MCP_URL || 'http://localhost:8080';
};

if (!API_BASE_URL) {
  console.error('REACT_APP_API_URL environment variable is not set');
}

console.log('🔧 Financial Health API Service initialized:', {
  apiBaseUrl: API_BASE_URL,
  fiMcpServerUrl: getFiMcpServerUrl(),
  environment: process.env.NODE_ENV
});

/**
 * Get Firebase ID token for authenticated requests
 */
const getAuthToken = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Get fresh ID token
    const idToken = await user.getIdToken(true);
    return idToken;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    throw error;
  }
};

/**
 * Fetch the user's financial health score
 * @param {string} phoneNumber - Fi-MCP test scenario phone number
 * @returns {Promise<Object>} Financial health score data
 */
export const fetchFinancialHealthScore = async (phoneNumber = '2222222222') => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/financial-health/score?phone_number=${phoneNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      // If the server returns a 404 or auth error, try the mock endpoint
      if (response.status === 404 || response.status === 401) {
        console.warn('Authenticated endpoint not available, falling back to mock data');
        return fetchMockFinancialHealthScore(phoneNumber);
      }
      
      throw new Error(`Failed to fetch financial health score: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching financial health score:', error);
    // Fallback to mock data if there's an error
    console.warn('Falling back to mock financial health data');
    return fetchMockFinancialHealthScore(phoneNumber);
  }
};

/**
 * Fetch mock financial health score data for testing or when the API is unavailable
 * @param {string} phoneNumber - Fi-MCP test scenario phone number
 * @returns {Promise<Object>} Mock financial health score data
 */
export const fetchMockFinancialHealthScore = async (phoneNumber = '2222222222') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/financial-health/mock-score?phone_number=${phoneNumber}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch mock financial health score: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching mock financial health score:', error);
    // Return hardcoded mock data as a last resort
    return getHardcodedMockData(phoneNumber);
  }
};

/**
 * Get available Fi-MCP test scenarios
 * @returns {Promise<Array>} List of available scenarios
 */
export const fetchAvailableScenarios = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/financial-health/scenarios`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch scenarios: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    // Return default scenarios
    return [
      {"phone_number": "1111111111", "name": "No Assets Connected", "description": "Only saving account balance present"},
      {"phone_number": "2222222222", "name": "All Assets Connected", "description": "Banks, EPF, stocks, credit report, large MF portfolio"},
      {"phone_number": "7777777777", "name": "Debt-Heavy Low Performer", "description": "High liabilities, poor MF returns, low credit score"},
      {"phone_number": "8888888888", "name": "SIP Samurai", "description": "Consistent monthly investments via SIP"},
      {"phone_number": "1616161616", "name": "Early Retirement Dreamer", "description": "Optimizing investments to retire by 40"}
    ];
  }
};

/**
 * Fetch user's financial health history
 * @param {number} limit - Number of history entries to fetch
 * @returns {Promise<Array>} User's financial health history
 */
export const fetchFinancialHealthHistory = async (limit = 30) => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/financial-health/history?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch financial health history: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching financial health history:', error);
    return [];
  }
};

/**
 * Fetch historical scores for chart display
 * @param {number} days - Number of days of history to fetch
 * @returns {Promise<Object>} Historical scores data
 */
export const fetchHistoricalScores = async (days = 90) => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/financial-health/historical-scores?days=${days}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch historical scores: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching historical scores:', error);
    // Return mock historical data
    return {
      [new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: 60.0,
      [new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: 62.5,
      [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: 65.0,
      [new Date().toISOString().split('T')[0]]: 67.5
    };
  }
};

/**
 * Check Fi-MCP server status
 * @returns {Promise<Object>} Fi-MCP server status
 */
export const checkFiMcpStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/financial-health/fi-mcp-status`);
    
    if (!response.ok) {
      throw new Error(`Failed to check Fi-MCP status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking Fi-MCP status:', error);
    return {
      status: 'unavailable',
      url: 'http://localhost:8080',
      message: 'Unable to check Fi-MCP server status'
    };
  }
};

/**
 * Connect to Fi-MCP server
 * @param {string} phoneNumber - Phone number for Fi-MCP authentication
 * @returns {Promise<Object>} Connection result
 */
export const connectToFiMcp = async (phoneNumber = '2222222222') => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/financial-health/fi-mcp-connect?phone_number=${phoneNumber}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to connect to Fi-MCP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error connecting to Fi-MCP:', error);
    throw error;
  }
};

/**
 * Delete user's financial health data
 * @returns {Promise<Object>} Deletion result
 */
export const deleteUserFinancialData = async () => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/v1/financial-health/user-data`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete user data: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
};

/**
 * Check if the financial health service is available
 * @returns {Promise<boolean>} Service availability status
 */
export const checkFinancialHealthServiceStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/financial-health/health`);
    return response.ok;
  } catch (error) {
    console.error('Financial health service not available:', error);
    return false;
  }
};

/**
 * Get hardcoded mock data based on scenario
 * @param {string} phoneNumber - Scenario phone number
 * @returns {Object} Mock financial health data
 */
const getHardcodedMockData = (phoneNumber) => {
  const scenarios = {
    '1111111111': {
      overall_score: 45.0,
      components: [
        {
          name: "Savings Rate",
          score: 40,
          weight: 0.25,
          description: "Percentage of income saved each month",
          status: "poor",
          data_points: {"savings_rate": 10.0, "monthly_income": 50000, "monthly_savings": 5000}
        },
        {
          name: "Debt Ratio",
          score: 100,
          weight: 0.2,
          description: "Ratio of total debt to annual income",
          status: "excellent",
          data_points: {"debt_ratio": 0.0, "total_debt": 0, "annual_income": 600000}
        },
        {
          name: "Investment Diversification",
          score: 0,
          weight: 0.2,
          description: "Diversity and balance of investment portfolio",
          status: "critical",
          data_points: {"asset_classes": 0, "concentration_ratio": 0, "total_investment": 0}
        },
        {
          name: "Emergency Fund",
          score: 50,
          weight: 0.15,
          description: "Months of expenses covered by emergency savings",
          status: "poor",
          data_points: {"months_covered": 1.1, "emergency_fund": 50000, "monthly_expenses": 45000}
        },
        {
          name: "Credit Health",
          score: 65,
          weight: 0.2,
          description: "Credit score and overall credit health",
          status: "fair",
          data_points: {"credit_score": 650}
        }
      ]
    },
    '7777777777': {
      overall_score: 35.0,
      components: [
        {
          name: "Savings Rate",
          score: 20,
          weight: 0.25,
          description: "Percentage of income saved each month",
          status: "critical",
          data_points: {"savings_rate": 3.3, "monthly_income": 60000, "monthly_savings": 2000}
        },
        {
          name: "Debt Ratio",
          score: 15,
          weight: 0.2,
          description: "Ratio of total debt to annual income",
          status: "critical",
          data_points: {"debt_ratio": 2.78, "total_debt": 2000000, "annual_income": 720000}
        },
        {
          name: "Investment Diversification",
          score: 30,
          weight: 0.2,
          description: "Diversity and balance of investment portfolio",
          status: "poor",
          data_points: {"asset_classes": 2, "concentration_ratio": 0.8, "total_investment": 80000}
        },
        {
          name: "Emergency Fund",
          score: 25,
          weight: 0.15,
          description: "Months of expenses covered by emergency savings",
          status: "critical",
          data_points: {"months_covered": 0.34, "emergency_fund": 20000, "monthly_expenses": 58000}
        },
        {
          name: "Credit Health",
          score: 35,
          weight: 0.2,
          description: "Credit score and overall credit health",
          status: "poor",
          data_points: {"credit_score": 580}
        }
      ]
    }
  };

  const defaultData = {
    overall_score: 67.5,
    components: [
      {
        name: "Savings Rate",
        score: 70,
        weight: 0.25,
        description: "Percentage of income saved each month",
        status: "fair",
        data_points: {"savings_rate": 15.2, "monthly_income": 80000, "monthly_savings": 12160}
      },
      {
        name: "Debt Ratio",
        score: 50,
        weight: 0.2,
        description: "Ratio of total debt to annual income",
        status: "poor",
        data_points: {"debt_ratio": 0.45, "total_debt": 1500000, "annual_income": 960000}
      },
      {
        name: "Investment Diversification",
        score: 85,
        weight: 0.2,
        description: "Diversity and balance of investment portfolio",
        status: "good",
        data_points: {"asset_classes": 4, "concentration_ratio": 0.35, "total_investment": 900000}
      },
      {
        name: "Emergency Fund",
        score: 50,
        weight: 0.15,
        description: "Months of expenses covered by emergency savings",
        status: "poor",
        data_points: {"months_covered": 2.5, "emergency_fund": 150000, "monthly_expenses": 60000}
      },
      {
        name: "Credit Health",
        score: 85,
        weight: 0.2,
        description: "Credit score and overall credit health",
        status: "good",
        data_points: {"credit_score": 720}
      }
    ]
  };

  const scenarioData = scenarios[phoneNumber] || defaultData;
  
  return {
    ...scenarioData,
    recommendations: [
      {
        title: "Increase Your Savings Rate",
        description: "Your current savings rate is below the recommended 15%. Consider setting up automatic transfers to a savings account.",
        impact: "high",
        difficulty: "moderate",
        potential_improvement: 15.0,
        action_steps: [
          "Set up automatic transfer of 5% more of your income to savings",
          "Review discretionary expenses for potential reductions",
          "Consider a side income source to boost savings"
        ],
        category: "Savings Rate"
      }
    ],
    last_updated: new Date().toISOString(),
    historical_scores: {
      [new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: scenarioData.overall_score - 10,
      [new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: scenarioData.overall_score - 5,
      [new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]]: scenarioData.overall_score - 2.5,
      [new Date().toISOString().split('T')[0]]: scenarioData.overall_score
    }
  };
};
