/**
 * Environment Configuration Utility
 * Handles configuration for both development and production environments
 */

// Environment detection
const ENV = {
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development' || process.env.REACT_APP_ENVIRONMENT === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production' || process.env.REACT_APP_ENVIRONMENT === 'production',
  IS_LOCALHOST: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
};

// Log environment information
console.log('🔧 Environment:', ENV.IS_DEVELOPMENT ? 'Development' : 'Production');
console.log('🔧 Running on:', ENV.IS_LOCALHOST ? 'Localhost' : 'Remote server');

/**
 * Get the appropriate API URL based on environment
 * - In development on localhost: use localhost URL
 * - In production or remote: use configured production URL
 */
export const getApiUrl = () => {
  // If running on localhost in development mode, use localhost URL
  if (ENV.IS_LOCALHOST && ENV.IS_DEVELOPMENT) {
    return 'http://localhost:8002';
  }
  
  // Otherwise use the configured API URL from environment variables
  return process.env.REACT_APP_API_URL || 'https://deltaverse-api-1029461078184.us-central1.run.app';
};

/**
 * Get the appropriate Fi MCP URL based on environment
 * - In development on localhost: use localhost URL
 * - In production or remote: use configured production URL
 */
export const getFiMcpUrl = () => {
  // If running on localhost in development mode, use localhost URL
  if (ENV.IS_LOCALHOST && ENV.IS_DEVELOPMENT) {
    return 'http://localhost:8080';
  }
  
  // Otherwise use the configured Fi MCP URL from environment variables
  return process.env.REACT_APP_FI_MCP_URL || 'https://fi-mcp-dev-1029461078184.us-central1.run.app';
};

/**
 * Debug logging utility that only logs in development mode
 */
export const debugLog = (message, data = null) => {
  if (ENV.IS_DEVELOPMENT) {
    if (data) {
      console.log(`🔍 DEBUG: ${message}`, data);
    } else {
      console.log(`🔍 DEBUG: ${message}`);
    }
  }
};

// Export environment configuration
export const ENV_CONFIG = {
  ...ENV,
  API_URL: getApiUrl(),
  FI_MCP_URL: getFiMcpUrl(),
  API_VERSION: process.env.REACT_APP_API_VERSION || 'v1',
  DEBUG: process.env.REACT_APP_DEBUG === 'true' || ENV.IS_DEVELOPMENT,
};

// Log configuration
console.log('🔧 API URL:', ENV_CONFIG.API_URL);
console.log('🔧 Fi MCP URL:', ENV_CONFIG.FI_MCP_URL);

export default ENV_CONFIG;
