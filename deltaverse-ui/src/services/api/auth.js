import { apiClient } from './index';
import { API_ENDPOINTS } from '../../utils/constants';

/**
 * Authentication API service
 */
export const authAPI = {
  /**
   * Google Login
   * @param {string} idToken - Firebase ID token
   * @param {boolean} requireOTP - Whether OTP verification is required
   * @returns {Promise} API response
   */
  googleLogin: async (idToken, requireOTP = false) => {
    const endpoint = requireOTP 
      ? API_ENDPOINTS.AUTH.GOOGLE_OTP_LOGIN 
      : API_ENDPOINTS.AUTH.GOOGLE_LOGIN;
    
    return apiClient.post(endpoint, { id_token: idToken });
  },

  /**
   * Verify Mobile OTP
   * @param {string} idToken - Firebase ID token from OTP verification
   * @returns {Promise} API response
   */
  verifyMobileOTP: async (idToken) => {
    return apiClient.post(API_ENDPOINTS.AUTH.VERIFY_MOBILE_OTP, {
      id_token: idToken,
    });
  },

  /**
   * Verify Google OTP
   * @param {string} otpToken - Firebase ID token from OTP verification
   * @param {string} tempToken - Temporary token from Google login
   * @returns {Promise} API response
   */
  verifyGoogleOTP: async (otpToken, tempToken) => {
    return apiClient.post(API_ENDPOINTS.AUTH.VERIFY_GOOGLE_OTP, {
      otp_token: otpToken,
      temp_token: tempToken,
    });
  },

  /**
   * Send OTP to phone number
   * @param {string} phoneNumber - Phone number in international format
   * @param {string} recaptchaToken - reCAPTCHA token (optional)
   * @returns {Promise} API response
   */
  sendOTP: async (phoneNumber, recaptchaToken = null) => {
    return apiClient.post(API_ENDPOINTS.AUTH.SEND_OTP, {
      phone_number: phoneNumber,
      recaptcha_token: recaptchaToken,
    });
  },

  /**
   * Refresh access token
   * @param {string} accessToken - Current access token
   * @returns {Promise} API response
   */
  refreshToken: async (accessToken) => {
    return apiClient.post(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  },

  /**
   * Get current user information
   * @param {string} accessToken - Access token
   * @returns {Promise} API response
   */
  getCurrentUser: async (accessToken) => {
    return apiClient.get(API_ENDPOINTS.AUTH.ME, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },

  /**
   * Logout user
   * @param {string} accessToken - Access token
   * @returns {Promise} API response
   */
  logout: async (accessToken) => {
    return apiClient.post(
      API_ENDPOINTS.AUTH.LOGOUT,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  },
};
