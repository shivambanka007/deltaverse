import { logout } from '../slices/authSlice';

/**
 * Auth Middleware
 * Handles authentication-related side effects
 */
export const authMiddleware = store => next => action => {
  const result = next(action);

  // Handle authentication errors
  if (action.type?.includes('auth') && action.type?.includes('rejected')) {
    // Silent error handling - no console logs
    store.dispatch(logout());
  }

  return result;
};

export default authMiddleware;
