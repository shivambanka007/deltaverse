import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config';
import { getUserProfile } from './auth';

// Global auth state management
let globalAuthListener = null;
let isListenerInitialized = false;
let authStateCallbacks = new Set();
let currentAuthUser = null;
let lastAuthEventTime = 0;
let isProcessingAuthChange = false;

/**
 * Initialize the global auth listener once for the entire application
 */
export const initializeGlobalAuthListener = () => {
  if (isListenerInitialized || globalAuthListener) {
    console.log('🔄 AuthListener: Already initialized, skipping');
    return;
  }

  console.log('🔄 AuthListener: Initializing GLOBAL Firebase auth listener');
  isListenerInitialized = true;

  globalAuthListener = onAuthStateChanged(
    auth,
    async (firebaseUser) => {
      // Prevent concurrent processing
      if (isProcessingAuthChange) {
        console.log('🔄 AuthListener: Already processing auth change, skipping');
        return;
      }

      try {
        isProcessingAuthChange = true;

        // Prevent rapid-fire events (reduced from 200ms to 50ms for better popup handling)
        const now = Date.now();
        if (now - lastAuthEventTime < 50) {
          console.log('🔄 AuthListener: Ignoring rapid auth event (< 50ms)');
          return;
        }
        lastAuthEventTime = now;

        console.log('🔄 AuthListener: Auth state event received:', {
          currentUser: currentAuthUser ? { uid: currentAuthUser.uid, email: currentAuthUser.email } : null,
          newUser: firebaseUser ? { uid: firebaseUser.uid, email: firebaseUser.email } : null
        });

        // Always process auth state changes - don't skip any
        // The previous logic was too restrictive and was skipping legitimate auth changes
        const shouldProcess = true; // Process all auth state changes
        
        console.log('🔄 AuthListener: Processing auth state change...', {
          previousUser: currentAuthUser ? currentAuthUser.uid : 'none',
          newUser: firebaseUser ? firebaseUser.uid : 'none',
          email: firebaseUser?.email || 'none'
        });
        currentAuthUser = firebaseUser;

        if (firebaseUser) {
          console.log('👤 AuthListener: User authenticated:', firebaseUser.email || firebaseUser.phoneNumber);
          
          // Create serializable user data
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            phoneNumber: firebaseUser.phoneNumber,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            provider: firebaseUser.providerData[0]?.providerId || 'unknown',
          };

          // Get additional user profile data from Firestore (with timeout)
          try {
            const profileResult = await Promise.race([
              getUserProfile(firebaseUser.uid),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
              ),
            ]);

            if (profileResult.success) {
              userData.profileData = profileResult.data;
            }
          } catch (profileError) {
            console.log('⚠️ AuthListener: Profile fetch failed, continuing with basic data');
          }

          // Notify all subscribers
          console.log('📢 AuthListener: Notifying subscribers of authentication');
          authStateCallbacks.forEach(callback => {
            try {
              callback({ type: 'USER_AUTHENTICATED', user: userData });
            } catch (error) {
              console.error('❌ AuthListener: Callback error:', error);
            }
          });
          
          // Force a second notification after a short delay to ensure it's processed
          setTimeout(() => {
            console.log('🔄 AuthListener: Sending backup authentication notification');
            authStateCallbacks.forEach(callback => {
              try {
                callback({ type: 'USER_AUTHENTICATED', user: userData });
              } catch (error) {
                console.error('❌ AuthListener: Backup callback error:', error);
              }
            });
          }, 100);
          
        } else {
          console.log('🚪 AuthListener: User logged out');
          
          // Notify all subscribers
          console.log('📢 AuthListener: Notifying subscribers of logout');
          authStateCallbacks.forEach(callback => {
            try {
              callback({ type: 'USER_LOGGED_OUT' });
            } catch (error) {
              console.error('❌ AuthListener: Callback error:', error);
            }
          });
        }
      } catch (authError) {
        console.error('❌ AuthListener: Auth state change error:', authError);
        
        // Notify all subscribers of error
        authStateCallbacks.forEach(callback => {
          try {
            callback({ type: 'AUTH_ERROR', error: authError.message });
          } catch (error) {
            console.error('❌ AuthListener: Callback error:', error);
          }
        });
      } finally {
        isProcessingAuthChange = false;
      }
    },
    (error) => {
      console.error('❌ AuthListener: Auth state listener error:', error);
      isProcessingAuthChange = false;
      
      // Notify all subscribers of error
      authStateCallbacks.forEach(callback => {
        try {
          callback({ type: 'AUTH_ERROR', error: error.message });
        } catch (callbackError) {
          console.error('❌ AuthListener: Callback error:', callbackError);
        }
      });
    }
  );
};

/**
 * Subscribe to auth state changes
 */
export const subscribeToAuthState = (callback) => {
  console.log(`🔄 AuthListener: New subscription added (Total: ${authStateCallbacks.size + 1})`);
  authStateCallbacks.add(callback);
  
  // Initialize listener if not already done
  if (!isListenerInitialized) {
    initializeGlobalAuthListener();
  }
  
  // Return unsubscribe function
  return () => {
    console.log('🔄 AuthListener: Subscription removed (Remaining:', authStateCallbacks.size - 1, ')');
    authStateCallbacks.delete(callback);
  };
};

/**
 * Get current auth user
 */
export const getCurrentAuthUser = () => {
  return currentAuthUser;
};

/**
 * Get subscription count (for debugging)
 */
export const getSubscriptionCount = () => {
  return authStateCallbacks.size;
};

/**
 * Cleanup auth listener (only call on app shutdown)
 */
export const cleanupGlobalAuthListener = () => {
  console.log('🧹 AuthListener: Cleaning up global auth listener');
  
  if (globalAuthListener) {
    globalAuthListener();
    globalAuthListener = null;
  }
  
  isListenerInitialized = false;
  authStateCallbacks.clear();
  currentAuthUser = null;
  lastAuthEventTime = 0;
  isProcessingAuthChange = false;
};
