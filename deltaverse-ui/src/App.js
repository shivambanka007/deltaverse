import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAuth } from './hooks/useAuth';
import { initializeGlobalAuthListener } from './services/firebase/authListener';
import { initializeGlobalAuthState, forceLogoutAndNavigate } from './services/firebase/globalAuthState';

// Error Handling
import IndexedDBErrorHandler from './components/common/IndexedDBErrorHandler';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import FinancialHealth from './pages/FinancialHealth';
import FinancialAnalysis from './pages/FinancialAnalysis';
import VoiceTest from './pages/VoiceTest';
import NotFound from './pages/NotFound';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import Loading from './components/common/Loading';
import AuthTest from './components/AuthTest';
import ErrorBoundary from './components/common/ErrorBoundary';
import { VoiceAssistantWidget } from './components';

// Styles
import './App.css';

// Initialize global auth systems once when app starts
initializeGlobalAuthListener();
initializeGlobalAuthState();

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  useEffect(() => {
    // Initialize any app-level configurations silently
    const handleRedirectResult = async () => {
      try {
        // Global auth state manager will handle authentication state
      } catch (error) {
        // Silent error handling
      }
    };

    handleRedirectResult();
  }, []);

  // Handle stuck loading state (fallback mechanism)
  useEffect(() => {
    if (isLoading) {
      // If loading for more than 10 seconds, something is wrong
      const timeout = setTimeout(() => {
        setLoadingTimeout(true);
        // Force logout and navigate
        forceLogoutAndNavigate();
      }, 10000);

      return () => {
        clearTimeout(timeout);
      };
    } else {
      setLoadingTimeout(false);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <Layout>
        <Loading message='Loading DeltaVerse...' />
        {loadingTimeout && (
          <div
            style={{
              position: 'fixed',
              bottom: '50px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(239, 68, 68, 0.9)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              zIndex: 10000,
              textAlign: 'center',
            }}
          >
            <div>Connection timeout. Redirecting...</div>
            <button
              onClick={forceLogoutAndNavigate}
              style={{
                marginTop: '10px',
                padding: '5px 15px',
                background: 'white',
                color: '#ef4444',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Go to Home
            </button>
          </div>
        )}
      </Layout>
    );
  }

  return (
    <Layout>
      
      <Routes>
        {/* Public Routes */}
        <Route
          path='/'
          element={
            isAuthenticated ? <Navigate to='/dashboard' replace /> : <Home />
          }
        />
        <Route
          path='/login'
          element={
            isAuthenticated ? <Navigate to='/dashboard' replace /> : <Login />
          }
        />

        {/* Protected Routes */}
        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile'
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path='/chat'
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path='/financial-health'
          element={
            <ProtectedRoute>
              <FinancialHealth />
            </ProtectedRoute>
          }
        />
        <Route
          path='/financial-analysis'
          element={
            <ProtectedRoute>
              <FinancialAnalysis />
            </ProtectedRoute>
          }
        />
        <Route
          path='/voice-test'
          element={
            <ProtectedRoute>
              <VoiceTest />
            </ProtectedRoute>
          }
        />
        <Route
          path='/auth-test'
          element={
            <ProtectedRoute>
              <AuthTest />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path='*' element={<NotFound />} />
      </Routes>

      {/* Voice Assistant Widget - Available on all authenticated pages */}
      {isAuthenticated && (
        <VoiceAssistantWidget 
          position="bottom-right"
          size="medium"
          showOnMobile={true}
        />
      )}

      {/* Recaptcha container for phone authentication */}
      <div id='recaptcha-container'></div>
    </Layout>
  );
}

function App() {
  return (
    <IndexedDBErrorHandler>
      <ErrorBoundary>
        <Provider store={store}>
          <Router>
            <div className='App'>
              <AppContent />
            </div>
          </Router>
        </Provider>
      </ErrorBoundary>
    </IndexedDBErrorHandler>
  );
}

export default App;
