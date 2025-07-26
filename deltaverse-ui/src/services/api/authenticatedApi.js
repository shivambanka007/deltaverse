// Enhanced API Service with Firebase Authentication
import { auth } from '../firebase/config';

const API_BASE_URL = process.env.REACT_APP_API_URL;
const FI_MCP_URL = process.env.REACT_APP_FI_MCP_URL;

if (!API_BASE_URL) {
  console.error('API_BASE_URL not set in environment');
}

if (!FI_MCP_URL) {
  console.error('FI_MCP_URL not set in environment');
}

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
 * Enhanced API request handler with Firebase authentication
 */
const authenticatedApiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    // Get Firebase ID token
    const idToken = await getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
        ...options.headers,
      },
      ...options,
    };

    console.log(`🔐 Authenticated API Request: ${options.method || 'GET'} ${endpoint}`);
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error('🚫 Authentication failed - redirecting to login');
        // Could trigger logout/redirect here
        throw new Error('Authentication required');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ API Response received for ${endpoint}`);
    
    return { success: true, data };
  } catch (error) {
    console.error(`❌ API Request failed for ${endpoint}:`, error);
    return { success: false, error: error.message };
  }
};

/**
 * Fallback API request without authentication (for public endpoints)
 */
const publicApiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log(`🌐 Public API Request: ${options.method || 'GET'} ${endpoint}`);
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`❌ Public API Request failed for ${endpoint}:`, error);
    return { success: false, error: error.message };
  }
};

// Enhanced API methods with authentication
export const authenticatedApi = {
  // Chat endpoints (require authentication)
  async sendChatMessage(message, conversationId = null) {
    return authenticatedApiRequest('/api/v1/chat/message', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
      }),
    });
  },

  async getChatInsights() {
    return authenticatedApiRequest('/api/v1/chat/insights');
  },

  // Fi-MCP endpoints (require authentication)
  async initiateFiLogin(scenarioPhone = '2222222222') {
    return authenticatedApiRequest('/api/v1/fi/login/initiate', {
      method: 'POST',
      body: JSON.stringify({
        scenario_phone: scenarioPhone,
      }),
    });
  },

  async completeFiLogin(sessionId, phoneNumber) {
    return authenticatedApiRequest('/api/v1/fi/login/complete', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
        phone_number: phoneNumber,
      }),
    });
  },

  async getFiData(sessionId) {
    return authenticatedApiRequest('/api/v1/fi/data', {
      method: 'POST',
      body: JSON.stringify({
        session_id: sessionId,
      }),
    });
  },

  // User profile endpoints (require authentication)
  async getUserProfile() {
    return authenticatedApiRequest('/api/v1/user/profile');
  },

  async updateUserProfile(profileData) {
    return authenticatedApiRequest('/api/v1/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Public API methods (no authentication required)
export const publicApi = {
  // Health check
  async getHealth() {
    return publicApiRequest('/health');
  },

  // Fi scenarios
  async getFiScenarios() {
    return publicApiRequest('/api/v1/fi/scenarios');
  },

  // Test endpoints
  async testConnection() {
    return publicApiRequest('/api/v1/test');
  },
};

// Utility functions
export const apiUtils = {
  // Check if user is authenticated
  isAuthenticated() {
    return !!auth.currentUser;
  },

  // Get current user info
  getCurrentUser() {
    return auth.currentUser;
  },

  // Check API health with authentication status
  async checkApiHealth() {
    const health = await publicApi.getHealth();
    
    if (health.success) {
      const authStatus = this.isAuthenticated() ? 'authenticated' : 'not_authenticated';
      console.log(`🏥 API Health: ${health.data.status}, Auth: ${authStatus}`);
      console.log(`🔧 Backend Mode: ${health.data.security_level || 'unknown'}`);
      
      return {
        ...health,
        user_authenticated: this.isAuthenticated(),
        backend_mode: health.data.security_level,
      };
    }
    
    return health;
  },

  // Test authenticated endpoint
  async testAuthentication() {
    if (!this.isAuthenticated()) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Try a simple authenticated request
    return authenticatedApi.getChatInsights();
  },
};

// Default export for backward compatibility
const authenticatedApiService = {
  ...authenticatedApi,
  public: publicApi,
  utils: apiUtils,
};

export default authenticatedApiService;
