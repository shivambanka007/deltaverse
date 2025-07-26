/**
 * Navigation Utilities
 * Provides consistent navigation functions across the application
 */

/**
 * Navigate to the main dashboard
 * @param {Function} navigate - React Router navigate function
 * @param {string} from - Optional: source page for debugging
 */
export const navigateToDashboard = (navigate, from = 'unknown') => {
  try {
    const isDevelopment = process.env.NODE_ENV === 'development';
    console.log(`[Navigation] Navigating to dashboard from: ${from} (${isDevelopment ? 'dev' : 'prod'} mode)`);
    navigate('/dashboard');
  } catch (error) {
    console.error(`[Navigation] Error navigating to dashboard from ${from}:`, error);
    // Fallback: try to navigate to home
    try {
      navigate('/');
    } catch (fallbackError) {
      console.error('[Navigation] Fallback navigation to home also failed:', fallbackError);
      // Last resort: reload the page to home
      window.location.href = '/';
    }
  }
};

/**
 * Navigate to the financial health dashboard
 * @param {Function} navigate - React Router navigate function
 * @param {string} from - Optional: source page for debugging
 */
export const navigateToFinancialHealth = (navigate, from = 'unknown') => {
  try {
    console.log(`[Navigation] Navigating to financial health from: ${from}`);
    navigate('/financial-health');
  } catch (error) {
    console.error(`[Navigation] Error navigating to financial health from ${from}:`, error);
    // Fallback: try to navigate to dashboard
    try {
      navigate('/dashboard');
    } catch (fallbackError) {
      console.error('[Navigation] Fallback navigation to dashboard also failed:', fallbackError);
      // Last resort: reload the page to dashboard
      window.location.href = '/dashboard';
    }
  }
};

/**
 * Navigate to the chat page
 * @param {Function} navigate - React Router navigate function
 * @param {string} from - Optional: source page for debugging
 */
export const navigateToChat = (navigate, from = 'unknown') => {
  try {
    console.log(`[Navigation] Navigating to chat from: ${from}`);
    navigate('/chat');
  } catch (error) {
    console.error(`[Navigation] Error navigating to chat from ${from}:`, error);
    // Fallback: try to navigate to dashboard
    try {
      navigate('/dashboard');
    } catch (fallbackError) {
      console.error('[Navigation] Fallback navigation to dashboard also failed:', fallbackError);
      // Last resort: reload the page to dashboard
      window.location.href = '/dashboard';
    }
  }
};

/**
 * Create a return to dashboard handler
 * @param {Function} navigate - React Router navigate function
 * @param {string} from - Source page identifier
 * @returns {Function} Handler function for return to dashboard
 */
export const createReturnToDashboardHandler = (navigate, from = 'unknown') => {
  return () => {
    // For financial components, return to financial health dashboard
    if (from.includes('financial') || from.includes('4d')) {
      navigateToFinancialHealth(navigate, from);
    } else {
      // For other components, return to main dashboard
      navigateToDashboard(navigate, from);
    }
  };
};

/**
 * Create a return to financial health handler
 * @param {Function} navigate - React Router navigate function
 * @param {string} from - Source page identifier
 * @returns {Function} Handler function for return to financial health
 */
export const createReturnToFinancialHealthHandler = (navigate, from = 'unknown') => {
  return () => {
    navigateToFinancialHealth(navigate, from);
  };
};

/**
 * Debug navigation state
 * @param {string} component - Component name
 * @param {Object} props - Component props
 */
export const debugNavigation = (component, props) => {
  console.log(`[Navigation Debug] Component: ${component}`);
  console.log(`[Navigation Debug] Props:`, {
    hasOnReturnToDashboard: typeof props.onReturnToDashboard === 'function',
    hasOnBackToComplex: typeof props.onBackToComplex === 'function',
    hasNavigate: typeof props.navigate === 'function'
  });
};
