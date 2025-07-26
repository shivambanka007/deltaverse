import { createListenerMiddleware } from '@reduxjs/toolkit';
import { setGlobalLoading, addNotification, setOnlineStatus } from '../slices/appSlice';

// Create listener middleware for API-related side effects
export const apiMiddleware = createListenerMiddleware();

// Track pending API requests
let pendingRequests = 0;

// Listen for pending API requests
apiMiddleware.startListening({
  predicate: action => action.type.endsWith('/pending'),
  effect: async (action, listenerApi) => {
    const { dispatch } = listenerApi;
    
    pendingRequests++;
    if (pendingRequests === 1) {
      dispatch(setGlobalLoading(true));
    }
  },
});

// Listen for completed API requests (fulfilled or rejected)
apiMiddleware.startListening({
  predicate: action => action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'),
  effect: async (action, listenerApi) => {
    const { dispatch } = listenerApi;
    
    pendingRequests = Math.max(0, pendingRequests - 1);
    if (pendingRequests === 0) {
      dispatch(setGlobalLoading(false));
    }
  },
});

// Listen for network errors
apiMiddleware.startListening({
  predicate: action => {
    return action.type.endsWith('/rejected') && 
           action.payload?.includes && 
           (action.payload.includes('Network Error') || 
            action.payload.includes('ERR_NETWORK') ||
            action.payload.includes('Failed to fetch'));
  },
  effect: async (action, listenerApi) => {
    const { dispatch } = listenerApi;
    
    // Update online status
    dispatch(setOnlineStatus(navigator.onLine));
    
    if (!navigator.onLine) {
      dispatch(addNotification({
        type: 'error',
        title: 'Connection Lost',
        message: 'Please check your internet connection and try again.',
        duration: 5000,
        persistent: true,
      }));
    }
  },
});

// Listen for server errors (5xx)
apiMiddleware.startListening({
  predicate: action => {
    return action.type.endsWith('/rejected') && 
           action.payload?.includes && 
           (action.payload.includes('500') || 
            action.payload.includes('502') ||
            action.payload.includes('503') ||
            action.payload.includes('504'));
  },
  effect: async (action, listenerApi) => {
    const { dispatch } = listenerApi;
    
    dispatch(addNotification({
      type: 'error',
      title: 'Server Error',
      message: 'The server is temporarily unavailable. Please try again later.',
      duration: 5000,
    }));
  },
});

// Listen for rate limiting (429)
apiMiddleware.startListening({
  predicate: action => {
    return action.type.endsWith('/rejected') && 
           action.payload?.includes && 
           action.payload.includes('429');
  },
  effect: async (action, listenerApi) => {
    const { dispatch } = listenerApi;
    
    dispatch(addNotification({
      type: 'warning',
      title: 'Rate Limited',
      message: 'Too many requests. Please wait a moment before trying again.',
      duration: 5000,
    }));
  },
});

// Listen for successful operations
apiMiddleware.startListening({
  predicate: action => {
    return action.type.endsWith('/fulfilled') && 
           (action.type.includes('update') || 
            action.type.includes('create') || 
            action.type.includes('delete'));
  },
  effect: async (action, listenerApi) => {
    const { dispatch } = listenerApi;
    
    const operationType = action.type.includes('update') ? 'updated' :
                         action.type.includes('create') ? 'created' : 'deleted';
    
    dispatch(addNotification({
      type: 'success',
      title: 'Success',
      message: `Operation ${operationType} successfully.`,
      duration: 3000,
    }));
  },
});

// Monitor online/offline status
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    apiMiddleware.startListening({
      predicate: () => true,
      effect: async (action, listenerApi) => {
        const { dispatch } = listenerApi;
        dispatch(setOnlineStatus(true));
        dispatch(addNotification({
          type: 'success',
          title: 'Connection Restored',
          message: 'You are back online.',
          duration: 3000,
        }));
      },
    });
  });

  window.addEventListener('offline', () => {
    apiMiddleware.startListening({
      predicate: () => true,
      effect: async (action, listenerApi) => {
        const { dispatch } = listenerApi;
        dispatch(setOnlineStatus(false));
      },
    });
  });
}

export default apiMiddleware;
