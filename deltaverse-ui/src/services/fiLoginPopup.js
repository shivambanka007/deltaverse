/**
 * Fi Money Login Popup Service
 * Handles Fi-MCP authentication flow using backend API
 */

import { getApiUrl, debugLog, ENV_CONFIG } from '../utils/envConfig';

// Get the appropriate API URL based on environment
const API_BASE_URL = getApiUrl();

class FiLoginPopupService {
  constructor() {
    this.popup = null;
    this.checkInterval = null;
    this.messageListener = null;
    this.retryAttempts = 0;
    this.maxRetries = 3;
    
    this.backendUrl = API_BASE_URL;
    console.log('🔧 fiLoginPopup: Using backend URL:', this.backendUrl);
    console.log('🔧 fiLoginPopup: Environment:', ENV_CONFIG.IS_DEVELOPMENT ? 'Development' : 'Production');
  }

  /**
   * Check if popups are allowed
   * @returns {Promise<boolean>}
   */
  async checkPopupAllowed() {
    try {
      // Try to open a tiny test popup
      const test = window.open('about:blank', '_blank', 'width=1,height=1');
      if (test) {
        test.close();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get popup features string
   * @returns {string}
   */
  getPopupFeatures() {
    const popupWidth = 500;
    const popupHeight = 700;
    const left = (window.screen.width - popupWidth) / 2;
    const top = (window.screen.height - popupHeight) / 2;

    return [
      `width=${popupWidth}`,
      `height=${popupHeight}`,
      `left=${left}`,
      `top=${top}`,
      'scrollbars=yes',
      'resizable=yes',
      'status=no',
      'toolbar=no',
      'menubar=no',
      'location=no'
    ].join(',');
  }

  /**
   * Open Fi Money login popup using backend API
   * @param {string} scenarioPhone - Phone number for Fi scenario
   * @returns {Promise} - Resolves with login data or rejects with error
   */
  async openLoginPopup(scenarioPhone = '8888888888') {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('🔍 Starting Fi login process with real server connection');
        console.log('🔍 Backend URL:', this.backendUrl);
        console.log('🔍 Scenario Phone:', scenarioPhone);

        // Check if popups are allowed
        const popupsAllowed = await this.checkPopupAllowed();
        if (!popupsAllowed) {
          const error = new Error('Popup blocked. Please allow popups for this site and try again.');
          error.code = 'POPUP_BLOCKED';
          throw error;
        }

        // Step 1: Call backend API to initiate Fi login
        const initiateUrl = `${this.backendUrl}/api/v1/fi/login/initiate`;
        console.log(`🔍 Making POST request to: ${initiateUrl}`);
        
        const response = await fetch(initiateUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            scenario_phone: scenarioPhone
          }),
          // Ensure we're not using cached responses
          cache: 'no-cache'
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication required. Please sign in first.');
          }
          
          // Try to get more detailed error information
          let errorText = '';
          try {
            const errorData = await response.json();
            errorText = errorData.detail || errorData.message || '';
          } catch (e) {
            // If we can't parse the error response, just use the status
          }
          
          throw new Error(`Backend API error: ${response.status}${errorText ? ` - ${errorText}` : ''}`);
        }

        const loginData = await response.json();
        console.log('🔍 Login initiation response:', loginData);
        
        const loginUrl = loginData.login_url;
        const backendSessionId = loginData.session_id;

        if (!loginUrl || !backendSessionId) {
          throw new Error('Invalid response from server: missing login URL or session ID');
        }

        console.log('✅ Backend login initiated successfully');
        console.log('🔍 Login URL:', loginUrl);
        console.log('🔍 Session ID:', backendSessionId);

        // Step 2: Open popup with the correct URL from backend
        const popupFeatures = this.getPopupFeatures();
        console.log('🔍 Opening popup with URL:', loginUrl);
        
        // First try to focus existing popup if it exists
        if (this.popup && !this.popup.closed) {
          try {
            this.popup.focus();
            return;
          } catch (e) {
            // If focusing fails, continue with opening new popup
          }
        }

        // Open new popup
        this.popup = window.open(loginUrl, 'fiLoginPopup', popupFeatures);

        if (!this.popup) {
          const error = new Error('Popup blocked. Please allow popups for this site and try again.');
          error.code = 'POPUP_BLOCKED';
          throw error;
        }

        // Focus the popup
        this.popup.focus();

        // Step 3: Monitor popup for completion
        let loginCompleted = false;
        
        this.checkInterval = setInterval(async () => {
          try {
            if (this.popup.closed && !loginCompleted) {
              loginCompleted = true;
              clearInterval(this.checkInterval);
              this.checkInterval = null;
              
              console.log('🔍 Popup closed, completing Fi login...');
              
              // Step 4: Complete Fi login via backend API
              const completeUrl = `${this.backendUrl}/api/v1/fi/login/complete`;
              console.log(`🔍 Making POST request to: ${completeUrl}`);
              
              const completeResponse = await fetch(completeUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  session_id: backendSessionId,
                  phone_number: scenarioPhone
                }),
                // Ensure we're not using cached responses
                cache: 'no-cache'
              });

              if (completeResponse.ok) {
                const completeData = await completeResponse.json();
                console.log('✅ Fi login completed successfully:', completeData);
                
                // Store the session token for future API calls
                if (completeData.token) {
                  localStorage.setItem('fi_session_token', completeData.token);
                  console.log('✅ Fi session token stored for future API calls');
                }
                
                resolve({
                  mobile: scenarioPhone,
                  sessionId: backendSessionId,
                  loginTime: new Date().toISOString(),
                  scenario: completeData.scenario || 'default',
                  financialSummary: completeData.financial_summary || null,
                  status: 'success',
                  token: completeData.token || null
                });
              } else {
                // Try to get more detailed error information
                let errorText = '';
                try {
                  const errorData = await completeResponse.json();
                  errorText = errorData.detail || errorData.message || '';
                } catch (e) {
                  // If we can't parse the error response, just use the status
                }
                
                console.error('❌ Failed to complete Fi login:', completeResponse.status, errorText);
                throw new Error(`Failed to complete Fi login: ${completeResponse.status}${errorText ? ` - ${errorText}` : ''}`);
              }
            }
          } catch (error) {
            console.error('❌ Error during popup monitoring:', error);
            loginCompleted = true;
            if (this.checkInterval) {
              clearInterval(this.checkInterval);
              this.checkInterval = null;
            }
            if (this.popup && !this.popup.closed) {
              this.popup.close();
            }
            reject(error);
          }
        }, 1000);

        // Cleanup after timeout
        setTimeout(() => {
          if (this.checkInterval && !loginCompleted) {
            loginCompleted = true;
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            if (this.popup && !this.popup.closed) {
              this.popup.close();
            }
            console.log('⏰ Fi login timeout - user cancelled');
            const error = new Error('Login cancelled by user or timed out');
            error.code = 'LOGIN_TIMEOUT';
            reject(error);
          }
        }, 60000); // 1 minute timeout

      } catch (error) {
        console.error('❌ fiLoginPopup error:', error);
        
        // Handle popup blocked error specifically
        if (error.code === 'POPUP_BLOCKED') {
          this.retryAttempts++;
          if (this.retryAttempts < this.maxRetries) {
            console.log(`🔄 Retrying login (attempt ${this.retryAttempts + 1}/${this.maxRetries})...`);
            // Wait for user to enable popups and try again
            const shouldRetry = window.confirm(
              `Popup was blocked. Please:

1. Enable popups for this site
2. Look for the popup blocker icon in your browser's address bar
3. Click OK to try again

Note: You may need to refresh the page after enabling popups.`
            );
            if (shouldRetry) {
              try {
                const result = await this.openLoginPopup(scenarioPhone);
                resolve(result);
                return;
              } catch (retryError) {
                reject(retryError);
                return;
              }
            }
          }
        }
        
        reject(error);
      }
    });
  }

  /**
   * Check if popup is supported
   * @returns {Promise<boolean>}
   */
  async isPopupSupported() {
    return this.checkPopupAllowed();
  }

  /**
   * Close any open popup
   */
  closePopup() {
    if (this.popup && !this.popup.closed) {
      this.popup.close();
    }
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.closePopup();
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
    }
  }
}

// Create singleton instance
const fiLoginPopup = new FiLoginPopupService();

export default fiLoginPopup;
