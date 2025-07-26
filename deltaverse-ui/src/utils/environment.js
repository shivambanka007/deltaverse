/**
 * Environment Detection Utility
 * Provides consistent environment detection across the application
 */

/**
 * Check if the application is running in development mode
 * @returns {boolean} True if in development mode
 */
export const isDevelopment = () => {
  // Check multiple indicators for development environment
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.REACT_APP_ENVIRONMENT === 'development' ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost') ||
    (typeof window !== 'undefined' && window.location.hostname === '127.0.0.1') ||
    (typeof window !== 'undefined' && window.location.hostname.includes('localhost'))
  );
};

/**
 * Check if the application is running in production mode
 * @returns {boolean} True if in production mode
 */
export const isProduction = () => {
  return !isDevelopment();
};

/**
 * Get the current environment name
 * @returns {string} 'development' or 'production'
 */
export const getEnvironment = () => {
  return isDevelopment() ? 'development' : 'production';
};

/**
 * Check if test scenarios should be shown
 * @returns {boolean} True if test scenarios should be visible
 */
export const shouldShowTestScenarios = () => {
  return isDevelopment();
};

/**
 * Get the default scenario for the current environment
 * @returns {string} Default scenario phone number or identifier
 */
export const getDefaultScenario = () => {
  return isDevelopment() ? '2222222222' : 'user';
};

/**
 * Log environment information (development only)
 */
export const logEnvironmentInfo = () => {
  if (isDevelopment()) {
    console.log('🔧 Environment Detection:', {
      NODE_ENV: process.env.NODE_ENV,
      REACT_APP_ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
      isDevelopment: isDevelopment(),
      isProduction: isProduction(),
      environment: getEnvironment()
    });
  }
};
