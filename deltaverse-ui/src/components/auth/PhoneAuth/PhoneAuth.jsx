import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import styles from './PhoneAuth.module.css';

const PhoneAuth = ({ onSuccess, onError, onStart, isSignUp = false }) => {
  const { signInWithPhone, verifyPhoneOTP, isLoading, clearAuthError } =
    useAuth();
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Format Indian phone number as user types
  const formatIndianPhoneNumber = value => {
    // Remove all non-digits
    const phoneNumber = value.replace(/\D/g, '');

    // Limit to 10 digits for Indian numbers
    const limitedNumber = phoneNumber.slice(0, 10);

    // Format as XXXXX XXXXX (Indian format)
    if (limitedNumber.length <= 5) return limitedNumber;
    return `${limitedNumber.slice(0, 5)} ${limitedNumber.slice(5)}`;
  };

  // Convert formatted phone to E.164 format with +91
  const toIndianE164Format = formattedPhone => {
    const digits = formattedPhone.replace(/\D/g, '');
    return digits.length === 10 ? `+91${digits}` : null;
  };

  // Validate Indian mobile number
  const validateIndianNumber = digits => {
    // Must be 10 digits
    if (digits.length !== 10) return false;
    
    // Must start with 6, 7, 8, or 9
    if (!['6', '7', '8', '9'].includes(digits[0])) return false;
    
    return true;
  };

  // Resend cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handlePhoneSubmit = async e => {
    e.preventDefault();
    if (localLoading || isLoading) return;

    const digits = phoneNumber.replace(/\D/g, '');
    
    if (!validateIndianNumber(digits)) {
      setError('Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9)');
      return;
    }

    setError('');
    setLocalLoading(true);
    onStart?.();

    try {
      const e164Phone = toIndianE164Format(phoneNumber);
      
      // Show user-friendly message
      setError('Sending verification code... Please wait.');
      
      const result = await signInWithPhone(e164Phone);

      if (result.success) {
        setConfirmationResult(result.confirmationResult);
        setStep('otp');
        setResendCooldown(60); // 60 second cooldown
        setError(''); // Clear any previous errors
      } else {
        // Show specific error message
        if (result.error.includes('quota')) {
          setError('SMS limit reached. Please try again later or use email/Google login.');
        } else if (result.error.includes('captcha') || result.error.includes('reCAPTCHA')) {
          setError('Verification failed. Please refresh the page and try again.');
        } else if (result.error.includes('invalid-phone-number')) {
          setError('Invalid phone number format. Please enter a valid Indian mobile number.');
        } else {
          setError(result.error || 'Failed to send verification code. Please try again.');
        }
        onError?.(result.error);
      }
    } catch (error) {
      // Handle network or other errors
      setError('Network error. Please check your connection and try again.');
      onError?.(error.message);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleOtpSubmit = async e => {
    e.preventDefault();
    if (localLoading || isLoading || !confirmationResult) return;

    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    setError('');
    setLocalLoading(true);
    onStart?.();

    try {
      const result = await verifyPhoneOTP(confirmationResult, otpCode);

      if (result.success) {
        onSuccess?.(result);
      } else {
        if (result.error.includes('invalid-verification-code')) {
          setError('Invalid verification code. Please check and try again.');
        } else if (result.error.includes('code-expired')) {
          setError('Verification code has expired. Please request a new code.');
        } else {
          setError(result.error || 'Invalid verification code. Please try again.');
        }
        onError?.(result.error);
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
      onError?.(error.message);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || localLoading || isLoading) return;

    setError('');
    setLocalLoading(true);

    try {
      const e164Phone = toIndianE164Format(phoneNumber);
      const result = await signInWithPhone(e164Phone);

      if (result.success) {
        setConfirmationResult(result.confirmationResult);
        setResendCooldown(60);
        setError('New verification code sent!');
        // Clear success message after 3 seconds
        setTimeout(() => setError(''), 3000);
      } else {
        setError(result.error || 'Failed to resend code. Please try again.');
      }
    } catch (error) {
      setError('Failed to resend code. Please check your connection.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setOtpCode('');
    setError('');
    setConfirmationResult(null);
    clearAuthError();
  };

  if (step === 'otp') {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Enter Verification Code</h2>
          <p>
            We sent a 6-digit code to{' '}
            <strong>
              +91 {formatIndianPhoneNumber(phoneNumber.replace(/\D/g, ''))}
            </strong>
          </p>
          <p className={styles.otpNote}>
            The SMS may take up to 2 minutes to arrive. Please check your messages.
          </p>
        </div>

        {error && (
          <div className={error.includes('sent') ? styles.success : styles.error}>
            <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
              {error.includes('sent') ? (
                <path d='M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z' />
              ) : (
                <>
                  <path d='M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z' />
                  <path d='M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z' />
                </>
              )}
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleOtpSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor='otpCode' className={styles.label}>
              Verification Code
            </label>
            <input
              id='otpCode'
              type='text'
              value={otpCode}
              onChange={e =>
                setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              placeholder='000000'
              className={styles.input}
              maxLength={6}
              autoComplete='one-time-code'
              disabled={localLoading || isLoading}
              autoFocus
            />
            <div className={styles.inputHint}>
              Enter the 6-digit code sent to your phone
            </div>
          </div>

          <button
            type='submit'
            className={styles.submitButton}
            disabled={localLoading || isLoading || otpCode.length !== 6}
          >
            {localLoading || isLoading ? (
              <>
                <div className={styles.spinner}></div>
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </button>
        </form>

        <div className={styles.resendSection}>
          <p>Didn't receive the code?</p>
          <button
            type='button'
            onClick={handleResendCode}
            className={styles.resendButton}
            disabled={resendCooldown > 0 || localLoading || isLoading}
          >
            {resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : 'Resend Code'}
          </button>
        </div>

        <div className={styles.backSection}>
          <button
            type='button'
            onClick={handleBackToPhone}
            className={styles.backButton}
            disabled={localLoading || isLoading}
          >
            ← Change Phone Number
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>{isSignUp ? 'Sign up' : 'Sign in'} with Phone</h2>
        <p>Enter your Indian mobile number to receive SMS verification</p>
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

      <form onSubmit={handlePhoneSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor='phoneNumber' className={styles.label}>
            Mobile Number
          </label>
          <div className={styles.phoneInputContainer}>
            <div className={styles.countryCode}>+91</div>
            <input
              id='phoneNumber'
              type='tel'
              value={phoneNumber}
              onChange={e =>
                setPhoneNumber(formatIndianPhoneNumber(e.target.value))
              }
              placeholder='98765 43210'
              className={styles.phoneInput}
              maxLength={11} // 10 digits + 1 space
              autoComplete='tel'
              disabled={localLoading || isLoading}
              autoFocus
            />
          </div>
          <div className={styles.inputHint}>
            Enter your 10-digit Indian mobile number
          </div>
        </div>

        <button
          type='submit'
          className={styles.submitButton}
          disabled={
            localLoading ||
            isLoading ||
            phoneNumber.replace(/\D/g, '').length !== 10
          }
        >
          {localLoading || isLoading ? (
            <>
              <div className={styles.spinner}></div>
              Sending Code...
            </>
          ) : (
            'Send Verification Code'
          )}
        </button>
      </form>

      <div className={styles.disclaimer}>
        <p>
          By continuing, you agree to receive SMS messages. Standard SMS rates may apply.
        </p>
      </div>
    </div>
  );
};

export default PhoneAuth;
