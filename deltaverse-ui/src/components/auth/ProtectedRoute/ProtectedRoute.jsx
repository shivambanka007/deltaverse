import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import Loading from '../../common/Loading';

/**
 * ProtectedRoute Component
 * Protects routes that require authentication
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log('🔍 ProtectedRoute: Auth check:', {
    isAuthenticated,
    isLoading,
    path: location.pathname
  });

  // Show loading while checking authentication status
  if (isLoading) {
    console.log('🔍 ProtectedRoute: Showing loading...');
    return <Loading message='Checking authentication...' />;
  }

  // If not authenticated, redirect to login with return path
  if (!isAuthenticated) {
    console.log('🔍 ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // If authenticated, render the protected component
  console.log('🔍 ProtectedRoute: Authenticated, rendering protected component');
  return children;
};

export default ProtectedRoute;
