import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import GoogleAuth from '../../components/auth/GoogleAuth';
import PhoneAuth from '../../components/auth/PhoneAuth';
import EmailAuth from '../../components/auth/EmailAuth';
import styles from './Home.module.css';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, error, clearAuthError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState('select'); // 'select', 'email', 'phone', 'google'
  const [isSignUp, setIsSignUp] = useState(false);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleAuthSuccess = (userData) => {
    setIsLoading(false);
    setAuthMode('select');
    
    // Force navigation to dashboard
    setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 500);
  };

  const handleAuthError = error => {
    // Silent error handling - no console logs
    setIsLoading(false);
  };

  const handleAuthStart = () => {
    setIsLoading(true);
  };

  const handleModeSwitch = mode => {
    clearAuthError();
    setAuthMode(mode);
    setIsLoading(false);
  };

  const handleSignUpToggle = () => {
    clearAuthError();
    setIsSignUp(!isSignUp);
    setAuthMode('select');
  };

  const renderAuthSelection = () => (
    <div className={styles.authSelection}>
      <div className={styles.authOptions}>
        <button
          className={styles.authOption}
          onClick={() => handleModeSwitch('email')}
          disabled={isLoading}
        >
          <div className={styles.authIcon}>
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
              <path
                d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'
                stroke='currentColor'
                strokeWidth='2'
                fill='none'
              />
              <polyline
                points='22,6 12,13 2,6'
                stroke='currentColor'
                strokeWidth='2'
                fill='none'
              />
            </svg>
          </div>
          <div className={styles.authContent}>
            <h3>Continue with Email</h3>
            <p>Secure email authentication</p>
          </div>
          <div className={styles.authArrow}>
            <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
              <path d='M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z' />
            </svg>
          </div>
        </button>

        <button
          className={styles.authOption}
          onClick={() => handleModeSwitch('phone')}
          disabled={isLoading}
        >
          <div className={styles.authIcon}>
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none'>
              <path
                d='M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z'
                fill='currentColor'
              />
            </svg>
          </div>
          <div className={styles.authContent}>
            <h3>Continue with Phone</h3>
            <p>SMS verification</p>
          </div>
          <div className={styles.authArrow}>
            <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
              <path d='M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z' />
            </svg>
          </div>
        </button>

        <button
          className={styles.authOption}
          onClick={() => handleModeSwitch('google')}
          disabled={isLoading}
        >
          <div className={styles.authIcon}>
            <svg width='24' height='24' viewBox='0 0 24 24'>
              <path
                fill='#4285F4'
                d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
              />
              <path
                fill='#34A853'
                d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
              />
              <path
                fill='#FBBC05'
                d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
              />
              <path
                fill='#EA4335'
                d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
              />
            </svg>
          </div>
          <div className={styles.authContent}>
            <h3>Continue with Google</h3>
            <p>Quick and secure Google sign-in</p>
          </div>
          <div className={styles.authArrow}>
            <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
              <path d='M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z' />
            </svg>
          </div>
        </button>
      </div>

      <div className={styles.signUpPrompt}>
        <p>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button className={styles.signUpLink} onClick={handleSignUpToggle}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );

  const renderEmailAuth = () => (
    <div className={styles.authForm}>
      <div className={styles.backButton}>
        <button onClick={() => handleModeSwitch('select')}>
          <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
            <path d='M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z' />
          </svg>
          Back
        </button>
      </div>
      <div className={styles.formHeader}>
        <h2>{isSignUp ? 'Create Account' : 'Sign In'} with Email</h2>
        <p>Enter your email and password to continue</p>
      </div>
      <EmailAuth
        onSuccess={handleAuthSuccess}
        onError={handleAuthError}
        onStart={handleAuthStart}
        isSignUp={isSignUp}
      />
    </div>
  );

  const renderPhoneAuth = () => (
    <div className={styles.authForm}>
      <div className={styles.backButton}>
        <button onClick={() => handleModeSwitch('select')}>
          <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
            <path d='M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z' />
          </svg>
          Back
        </button>
      </div>
      <div className={styles.formHeader}>
        <h2>{isSignUp ? 'Sign up' : 'Sign in'} with Phone</h2>
        <p>Enter your mobile number to continue</p>
      </div>
      <PhoneAuth
        onSuccess={handleAuthSuccess}
        onError={handleAuthError}
        onStart={handleAuthStart}
        isSignUp={isSignUp}
      />
    </div>
  );

  const renderGoogleAuth = () => (
    <div className={styles.authForm}>
      <div className={styles.backButton}>
        <button onClick={() => handleModeSwitch('select')}>
          <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
            <path d='M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z' />
          </svg>
          Back
        </button>
      </div>
      <div className={styles.formHeader}>
        <h2>{isSignUp ? 'Sign up' : 'Sign in'} with Google</h2>
        <p>Continue with your Google account</p>
      </div>
      <GoogleAuth
        onSuccess={handleAuthSuccess}
        onError={handleAuthError}
        onStart={handleAuthStart}
        buttonText={`${isSignUp ? 'Sign up' : 'Sign in'} with Google`}
        className={styles.googleButton}
        disabled={isLoading}
      />
    </div>
  );

  const renderWelcomeSection = () => (
    <div className={styles.welcomeSection}>
      <h2>
        Welcome back,{' '}
        {user?.displayName || user?.email || user?.phoneNumber || 'User'}!
      </h2>
      <p>Ready to explore your personalized financial insights?</p>
      <div className={styles.actions}>
        <Link to='/dashboard' className={styles.primaryButton}>
          Go to Dashboard
        </Link>
        <Link to='/profile' className={styles.secondaryButton}>
          View Profile
        </Link>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <svg width='40' height='40' viewBox='0 0 40 40'>
              <rect width='40' height='40' rx='8' fill='url(#gradient)' />
              <path d='M20 10L28 20L20 30L12 20L20 10Z' fill='white' />
              <defs>
                <linearGradient id='gradient' x1='0' y1='0' x2='40' y2='40'>
                  <stop stopColor='#4F46E5' />
                  <stop offset='1' stopColor='#7C3AED' />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1>
            {isAuthenticated
              ? 'Welcome to DeltaVerse'
              : authMode === 'select'
                ? isSignUp
                  ? 'Create your account'
                  : 'Welcome to DeltaVerse'
                : 'DeltaVerse - AI Finance Advisor'}
          </h1>
          <p>
            {isAuthenticated
              ? 'Your intelligent AI-powered finance advisor'
              : authMode === 'select'
                ? isSignUp
                  ? 'Join thousands making smarter financial decisions'
                  : 'Your intelligent AI-powered financial advisor'
                : 'Complete your authentication'}
          </p>
        </div>

        {error && (
          <div className={styles.error}>
            <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
              <path d='M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z' />
              <path d='M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z' />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className={styles.content}>
          {isAuthenticated
            ? renderWelcomeSection()
            : authMode === 'select'
              ? renderAuthSelection()
              : authMode === 'email'
                ? renderEmailAuth()
                : authMode === 'phone'
                  ? renderPhoneAuth()
                  : authMode === 'google'
                    ? renderGoogleAuth()
                    : renderAuthSelection()}
        </div>

        <div className={styles.footer}>
          <p>
            By continuing, you agree to our{' '}
            <a href='/terms'>Terms of Service</a> and{' '}
            <a href='/privacy'>Privacy Policy</a>
          </p>
        </div>

        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <span>Please wait...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
