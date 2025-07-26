import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import styles from './GoogleAuth.module.css';

const GoogleAuth = ({
  onSuccess,
  onError,
  onStart,
  buttonText = 'Continue with Google',
  className = '',
  disabled = false,
}) => {
  const { signInWithGoogle, isLoading } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    if (localLoading || isLoading || disabled) {
      console.log('🔍 GoogleAuth: Button click ignored - loading or disabled');
      return;
    }

    console.log('🔍 GoogleAuth: Button clicked - Starting Google sign-in process');
    setLocalLoading(true);
    onStart?.();

    try {
      console.log('🔍 GoogleAuth: Calling signInWithGoogle...');
      const result = await signInWithGoogle();
      console.log('🔍 GoogleAuth: signInWithGoogle result:', result);

      if (result.success) {
        console.log('✅ GoogleAuth: Google sign-in successful!', result.user);
        
        // Call success callback
        if (onSuccess) {
          console.log('🔍 GoogleAuth: Calling onSuccess callback');
          onSuccess(result.user);
        }
        
        // Navigate to dashboard
        console.log('🚀 GoogleAuth: Navigating to dashboard in 500ms...');
        setTimeout(() => {
          console.log('🚀 GoogleAuth: Executing navigation to dashboard');
          navigate('/dashboard', { replace: true });
        }, 500);
      } else {
        console.log('❌ GoogleAuth: Google sign-in failed:', result.error);
        if (onError) {
          onError(result.error || 'Google sign-in failed');
        }
      }
    } catch (error) {
      console.error('❌ GoogleAuth: Google sign-in error:', error);
      if (onError) {
        onError(error.message || 'Google sign-in failed');
      }
    } finally {
      console.log('🔍 GoogleAuth: Cleaning up - setting localLoading to false');
      setLocalLoading(false);
    }
  };

  console.log('🔍 GoogleAuth: Rendering button - localLoading:', localLoading, 'isLoading:', isLoading, 'disabled:', disabled);

  return (
    <button
      type='button'
      onClick={handleGoogleSignIn}
      disabled={localLoading || isLoading || disabled}
      className={`${styles.googleButton} ${className}`}
    >
      {localLoading || isLoading ? (
        <>
          <div className={styles.spinner}></div>
          <span>Signing in...</span>
        </>
      ) : (
        <>
          <svg
            className={styles.googleIcon}
            width='20'
            height='20'
            viewBox='0 0 24 24'
          >
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
          <span>{buttonText}</span>
        </>
      )}
    </button>
  );
};

export default GoogleAuth;
