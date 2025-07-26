import { store } from '../../store';
import { setUser, logout, setLoading } from '../../store/slices/authSlice';
import { subscribeToAuthState } from './authListener';

// Global auth state management
let isGlobalAuthInitialized = false;
let globalAuthUnsubscribe = null;

/**
 * Initialize global auth state management
 * This should be called once when the app starts
 */
export const initializeGlobalAuthState = () => {
  if (isGlobalAuthInitialized) {
    console.log('🔄 GlobalAuth: Already initialized, skipping');
    return;
  }

  console.log('🔄 GlobalAuth: Initializing global auth state management');
  
  // Force initial state to be logged out
  console.log('🔄 GlobalAuth: Setting initial state to logged out');
  store.dispatch(logout());
  store.dispatch(setLoading(true)); // Set loading while checking auth
  
  isGlobalAuthInitialized = true;

  // Subscribe to auth state changes and update Redux store directly
  globalAuthUnsubscribe = subscribeToAuthState((authEvent) => {
    console.log('🔄 GlobalAuth: Received auth event:', authEvent.type);
    
    switch (authEvent.type) {
      case 'USER_AUTHENTICATED':
        console.log('✅ GlobalAuth: Setting authenticated user in Redux');
        store.dispatch(setUser(authEvent.user));
        store.dispatch(setLoading(false));
        break;
        
      case 'USER_LOGGED_OUT':
        console.log('🚪 GlobalAuth: User logged out, clearing Redux state');
        
        // Clear Redux state first
        store.dispatch(logout());
        store.dispatch(setLoading(false));
        
        // Force navigation to login page with multiple fallback methods
        console.log('🚀 GlobalAuth: Forcing navigation to login page');
        
        // Check if we're currently on a protected route
        const currentPath = window.location.pathname;
        const protectedRoutes = ['/dashboard', '/profile'];
        const shouldRedirect = protectedRoutes.includes(currentPath);
        
        if (shouldRedirect) {
          console.log('🔄 GlobalAuth: User on protected route, redirecting to login');
          
          // Method 1: Try React Router navigation if available
          try {
            if (window.history && window.history.pushState) {
              window.history.pushState({}, '', '/login');
              window.dispatchEvent(new PopStateEvent('popstate'));
              console.log('✅ GlobalAuth: Navigation via history API successful');
            }
          } catch (historyError) {
            console.log('⚠️ GlobalAuth: History API navigation failed:', historyError);
          }
          
          // Method 2: Force page reload to login (most reliable)
          setTimeout(() => {
            if (window.location.pathname !== '/login') {
              console.log('🔄 GlobalAuth: Force reloading to login page');
              window.location.href = '/login';
            }
          }, 200);
        } else {
          console.log('✅ GlobalAuth: User not on protected route, no redirect needed');
        }
        
        break;
        
      case 'AUTH_ERROR':
        console.error('❌ GlobalAuth: Auth error:', authEvent.error);
        store.dispatch(logout());
        store.dispatch(setLoading(false));
        break;
        
      default:
        console.log('🔄 GlobalAuth: Unknown auth event:', authEvent.type);
    }
  });
  
  // Fallback: If no auth event is received within 5 seconds, assume logged out
  // (Increased from 3s to 5s to accommodate Google popup auth)
  setTimeout(() => {
    const currentState = store.getState().auth;
    console.log('🔄 GlobalAuth: Timeout check - current auth state:', {
      isAuthenticated: currentState.isAuthenticated,
      isLoading: currentState.isLoading,
      user: currentState.user ? 'Present' : 'None'
    });
    
    if (currentState.isLoading) {
      console.log('⚠️ GlobalAuth: Still loading after 5s, forcing logged out state');
      store.dispatch(logout());
      store.dispatch(setLoading(false));
    }
  }, 5000);
};

/**
 * Manual logout function for emergency use
 */
export const forceLogoutAndNavigate = () => {
  console.log('🚨 GlobalAuth: Force logout and navigate');
  
  // Clear Redux state
  store.dispatch(logout());
  store.dispatch(setLoading(false));
  
  // Clear any stored auth data
  try {
    localStorage.removeItem('firebase:authUser');
    sessionStorage.clear();
  } catch (storageError) {
    console.log('⚠️ GlobalAuth: Storage clear failed:', storageError);
  }
  
  // Force navigation to login
  window.location.href = '/login';
};

/**
 * Cleanup global auth state (only call on app shutdown)
 */
export const cleanupGlobalAuthState = () => {
  console.log('🧹 GlobalAuth: Cleaning up global auth state');
  
  if (globalAuthUnsubscribe) {
    globalAuthUnsubscribe();
    globalAuthUnsubscribe = null;
  }
  
  isGlobalAuthInitialized = false;
};
