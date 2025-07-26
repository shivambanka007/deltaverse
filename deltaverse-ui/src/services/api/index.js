// API Service for DeltaVerse
const API_BASE_URL = process.env.REACT_APP_API_URL;

if (!API_BASE_URL) {
  throw new Error('REACT_APP_API_URL environment variable is not set');
}

/**
 * Generic API request handler
 */
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    // Silent request handling - no console logs
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Silent response handling - no console logs
    return { success: true, data };
  } catch (error) {
    // Silent error handling - no console logs
    return { success: false, error: error.message };
  }
};

/**
 * Authentication API
 */
export const authAPI = {
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  logout: () => apiRequest('/auth/logout', {
    method: 'POST',
  }),
  
  refreshToken: (token) => apiRequest('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ token }),
  }),
};

/**
 * User API
 */
export const userAPI = {
  getProfile: (userId) => apiRequest(`/users/${userId}`),
  
  updateProfile: (userId, updates) => apiRequest(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  
  deleteAccount: (userId) => apiRequest(`/users/${userId}`, {
    method: 'DELETE',
  }),
};

/**
 * Financial Data API
 */
export const financialAPI = {
  getDashboard: (userId) => apiRequest(`/financial/${userId}/dashboard`),
  
  getTransactions: (userId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/financial/${userId}/transactions?${queryString}`);
  },
  
  addTransaction: (userId, transaction) => apiRequest(`/financial/${userId}/transactions`, {
    method: 'POST',
    body: JSON.stringify(transaction),
  }),
  
  updateTransaction: (userId, transactionId, updates) => apiRequest(`/financial/${userId}/transactions/${transactionId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  
  deleteTransaction: (userId, transactionId) => apiRequest(`/financial/${userId}/transactions/${transactionId}`, {
    method: 'DELETE',
  }),
  
  getGoals: (userId) => apiRequest(`/financial/${userId}/goals`),
  
  addGoal: (userId, goal) => apiRequest(`/financial/${userId}/goals`, {
    method: 'POST',
    body: JSON.stringify(goal),
  }),
  
  updateGoal: (userId, goalId, updates) => apiRequest(`/financial/${userId}/goals/${goalId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  
  getAnalytics: (userId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/financial/${userId}/analytics?${queryString}`);
  },
};

/**
 * AI Recommendations API
 */
export const aiAPI = {
  getRecommendations: (userId) => apiRequest(`/ai/${userId}/recommendations`),
  
  generateRecommendations: (userId, data) => apiRequest(`/ai/${userId}/generate`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  updateRecommendationStatus: (userId, recommendationId, status) => apiRequest(`/ai/${userId}/recommendations/${recommendationId}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
};

/**
 * Spend Analysis API
 */
export const spendAnalysisAPI = {
  getReport: (userId) => apiRequest(`/api/v1/spend-analysis/report/${userId}`),
  
  getMonthlySummary: (userId, year, month) => {
    const params = year && month ? `?year=${year}&month=${month}` : '';
    return apiRequest(`/api/v1/spend-analysis/monthly/${userId}${params}`);
  },
  
  getInsights: (userId) => apiRequest(`/api/v1/spend-analysis/insights/${userId}`),
  
  getCategoryBreakdown: (userId) => apiRequest(`/api/v1/spend-analysis/categories/${userId}`),
  
  getTrends: (userId) => apiRequest(`/api/v1/spend-analysis/trends/${userId}`),
};

/**
 * Market Data API
 */
export const marketAPI = {
  getStockPrices: (symbols) => {
    const queryString = new URLSearchParams({ symbols: symbols.join(',') }).toString();
    return apiRequest(`/market/stocks?${queryString}`);
  },
  
  getMutualFunds: (category) => apiRequest(`/market/mutual-funds?category=${category}`),
  
  getCurrencyRates: () => apiRequest('/market/currency'),
  
  getMarketNews: (limit = 10) => apiRequest(`/market/news?limit=${limit}`),
};

/**
 * Utility functions
 */
export const setAuthToken = (token) => {
  // Store token for authenticated requests
  localStorage.setItem('authToken', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const clearAuthToken = () => {
  localStorage.removeItem('authToken');
};

// Add auth token to requests if available
const originalApiRequest = apiRequest;
const authenticatedApiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return originalApiRequest(endpoint, options);
};

const apiService = {
  auth: authAPI,
  user: userAPI,
  financial: financialAPI,
  ai: aiAPI,
  market: marketAPI,
  spendAnalysis: spendAnalysisAPI,
  setAuthToken,
  getAuthToken,
  clearAuthToken,
};

export default apiService;
