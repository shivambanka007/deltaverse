// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL,
  FI_MCP_URL: process.env.REACT_APP_FI_MCP_URL,
  VERSION: process.env.REACT_APP_API_VERSION || 'v1',
  TIMEOUT: 10000,
};

export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE_LOGIN: '/auth/google-login',
    GOOGLE_OTP_LOGIN: '/auth/google-otp-login',
    VERIFY_GOOGLE_OTP: '/auth/verify-google-otp',
    SEND_OTP: '/auth/send-otp',
    VERIFY_MOBILE_OTP: '/auth/verify-mobile-otp',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
  },
};

// Authentication Constants
export const AUTH_TYPES = {
  GOOGLE: 'google',
  PHONE: 'phone',
  GOOGLE_OTP: 'google_otp',
};

export const AUTH_STEPS = {
  INITIAL: 'initial',
  OTP_REQUIRED: 'otp_required',
  AUTHENTICATED: 'authenticated',
  ERROR: 'error',
};

export const AUTH_PROVIDERS = {
  GOOGLE: 'google',
  PHONE: 'phone',
  GOOGLE_OTP: 'google_otp',
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'deltaverse_auth_token',
  USER_DATA: 'deltaverse_user_data',
  AUTH_STATE: 'deltaverse_auth_state',
  PREFERENCES: 'deltaverse_preferences',
};

// UI Constants
export const BREAKPOINTS = {
  MOBILE: '480px',
  TABLET: '768px',
  DESKTOP: '1024px',
  LARGE: '1200px',
};

export const COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#6b7280',
  SUCCESS: '#10b981',
  ERROR: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#3b82f6',
};

// Form Validation
export const VALIDATION_RULES = {
  PHONE: {
    PATTERN: /^\+[1-9]\d{1,14}$/,
    MESSAGE: 'Please enter a valid phone number with country code (+1234567890)',
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address',
  },
  OTP: {
    LENGTH: 6,
    PATTERN: /^\d{6}$/,
    MESSAGE: 'Please enter a 6-digit verification code',
  },
};

// Feature Flags
export const FEATURES = {
  GOOGLE_AUTH: process.env.REACT_APP_ENABLE_GOOGLE_AUTH === 'true',
  PHONE_AUTH: process.env.REACT_APP_ENABLE_PHONE_AUTH === 'true',
  OTP_VERIFICATION: process.env.REACT_APP_ENABLE_OTP_VERIFICATION === 'true',
  DEBUG: process.env.REACT_APP_DEBUG === 'true',
};

// App Configuration
export const APP_CONFIG = {
  NAME: process.env.REACT_APP_NAME || 'Deltaverse',
  VERSION: process.env.REACT_APP_VERSION || '0.1.0',
  ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT || 'development',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  AUTH_ERROR: 'Authentication failed. Please try again.',
  OTP_ERROR: 'Invalid verification code. Please try again.',
  PHONE_ERROR: 'Invalid phone number format.',
  GOOGLE_AUTH_ERROR: 'Google authentication failed.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  OTP_SENT: 'Verification code sent to your phone.',
  OTP_VERIFIED: 'Phone number verified successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
};

// Loading Messages
export const LOADING_MESSAGES = {
  SIGNING_IN: 'Signing in...',
  SENDING_OTP: 'Sending verification code...',
  VERIFYING_OTP: 'Verifying code...',
  LOADING: 'Loading...',
  SAVING: 'Saving...',
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
};

// Local Storage Expiry (in milliseconds)
export const STORAGE_EXPIRY = {
  AUTH_TOKEN: 60 * 60 * 1000, // 1 hour
  USER_DATA: 24 * 60 * 60 * 1000, // 24 hours
  PREFERENCES: 30 * 24 * 60 * 60 * 1000, // 30 days
};
