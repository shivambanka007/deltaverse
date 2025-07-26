/**
 * Timeout Utilities for DeltaVerse
 * Handles all async operations with proper timeout management
 */

/**
 * Creates a timeout promise that rejects after specified time
 */
const createTimeoutPromise = (timeoutMs, errorMessage = 'Operation timed out') => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });
};

/**
 * Wraps a promise with timeout functionality
 */
export const withTimeout = (promise, timeoutMs = 30000, errorMessage) => {
  const timeoutPromise = createTimeoutPromise(
    timeoutMs, 
    errorMessage || `Operation timed out after ${timeoutMs}ms`
  );
  
  return Promise.race([promise, timeoutPromise]);
};

/**
 * Wraps a promise with retry functionality
 */
export const withRetry = async (
  promiseFactory, 
  maxRetries = 3, 
  delay = 1000,
  timeoutMs = 30000
) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const promise = promiseFactory();
      const result = await withTimeout(promise, timeoutMs);
      return result;
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.message?.includes('auth/') || 
          error.message?.includes('permission') ||
          error.message?.includes('unauthorized')) {
        throw error;
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
};

/**
 * Specific timeout configurations for different operations
 */
export const TIMEOUTS = {
  AUTH: 15000,        // 15 seconds for authentication
  FIRESTORE: 10000,   // 10 seconds for Firestore operations
  PHONE_AUTH: 30000,  // 30 seconds for phone authentication
  API_REQUEST: 20000, // 20 seconds for API requests
  FILE_UPLOAD: 60000, // 60 seconds for file uploads
  QUICK: 5000,        // 5 seconds for quick operations
};

/**
 * Firebase-specific timeout wrapper
 */
export const withFirebaseTimeout = (promise, operation = 'firestore') => {
  const timeout = TIMEOUTS[operation.toUpperCase()] || TIMEOUTS.FIRESTORE;
  return withTimeout(promise, timeout, `Firebase ${operation} operation timed out`);
};

/**
 * Authentication-specific timeout wrapper
 */
export const withAuthTimeout = (promise, authType = 'general') => {
  const timeout = authType === 'phone' ? TIMEOUTS.PHONE_AUTH : TIMEOUTS.AUTH;
  return withTimeout(promise, timeout, `Authentication (${authType}) timed out`);
};

/**
 * API request timeout wrapper
 */
export const withApiTimeout = (promise, endpoint = 'unknown') => {
  return withTimeout(
    promise, 
    TIMEOUTS.API_REQUEST, 
    `API request to ${endpoint} timed out`
  );
};

/**
 * Debounced timeout - prevents multiple rapid calls
 */
export const withDebounce = (func, delay = 300) => {
  let timeoutId;
  
  return (...args) => {
    clearTimeout(timeoutId);
    
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await func(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
};

/**
 * Safe async wrapper that never throws
 */
export const safeAsync = async (promise, defaultValue = null) => {
  try {
    const result = await promise;
    return { success: true, data: result, error: null };
  } catch (error) {
    return { success: false, data: defaultValue, error: error.message };
  }
};

/**
 * Timeout-aware fetch wrapper
 */
export const timeoutFetch = (url, options = {}, timeoutMs = TIMEOUTS.API_REQUEST) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => {
    clearTimeout(timeoutId);
  });
};

const timeoutUtils = {
  withTimeout,
  withRetry,
  withFirebaseTimeout,
  withAuthTimeout,
  withApiTimeout,
  withDebounce,
  safeAsync,
  timeoutFetch,
  TIMEOUTS,
};

export default timeoutUtils;
