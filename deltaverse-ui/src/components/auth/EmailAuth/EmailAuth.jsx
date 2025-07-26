import React, { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import styles from './EmailAuth.module.css';

const EmailAuth = ({ onSuccess, onError, onStart, isSignUp = false }) => {
  const { signInWithEmail, signUpWithEmail, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!email || !password) {
      setError('Please fill in all required fields');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (isSignUp && !displayName.trim()) {
      setError('Please enter your full name');
      return false;
    }

    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (localLoading || isLoading) return;

    if (!validateForm()) return;

    setError('');
    setLocalLoading(true);
    onStart?.();

    try {
      let result;
      if (isSignUp) {
        result = await signUpWithEmail(email, password, displayName.trim());
      } else {
        result = await signInWithEmail(email, password);
      }

      if (result.success) {
        onSuccess?.(result);
      } else {
        setError(result.error || 'Authentication failed');
        onError?.(result.error);
      }
    } catch (error) {
      // Silent error handling - no console logs
      setError('Authentication failed. Please try again.');
      onError?.(error.message);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && (
        <div className={styles.error}>
          <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
            <path d='M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z' />
            <path d='M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z' />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {isSignUp && (
        <div className={styles.inputGroup}>
          <label htmlFor='displayName' className={styles.label}>
            Full Name
          </label>
          <input
            id='displayName'
            type='text'
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder='Enter your full name'
            className={styles.input}
            disabled={localLoading || isLoading}
            autoComplete='name'
            required
          />
        </div>
      )}

      <div className={styles.inputGroup}>
        <label htmlFor='email' className={styles.label}>
          Email Address
        </label>
        <input
          id='email'
          type='email'
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder='Enter your email address'
          className={styles.input}
          disabled={localLoading || isLoading}
          autoComplete='email'
          required
        />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor='password' className={styles.label}>
          Password
        </label>
        <input
          id='password'
          type='password'
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder='Enter your password'
          className={styles.input}
          disabled={localLoading || isLoading}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          minLength={6}
          required
        />
      </div>

      {isSignUp && (
        <div className={styles.inputGroup}>
          <label htmlFor='confirmPassword' className={styles.label}>
            Confirm Password
          </label>
          <input
            id='confirmPassword'
            type='password'
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder='Confirm your password'
            className={styles.input}
            disabled={localLoading || isLoading}
            autoComplete='new-password'
            minLength={6}
            required
          />
        </div>
      )}

      <button
        type='submit'
        className={styles.submitButton}
        disabled={localLoading || isLoading}
      >
        {localLoading || isLoading ? (
          <>
            <div className={styles.spinner}></div>
            {isSignUp ? 'Creating Account...' : 'Signing In...'}
          </>
        ) : (
          <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
        )}
      </button>
    </form>
  );
};

export default EmailAuth;
