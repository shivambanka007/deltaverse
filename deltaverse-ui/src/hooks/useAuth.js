import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { auth } from '../services/firebase/config';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithPhone,
  verifyPhoneOTP,
  signInWithGoogle,
  signOutUser,
  getUserProfile,
  updateUserProfile,
  resetPassword,
  changePassword,
  initializeRecaptcha,
} from '../services/firebase/auth';

import {
  setUser,
  setLoading,
  clearError,
  logout,
  setAuthStep,
} from '../store/slices/authSlice';

/**
 * Custom hook for Firebase authentication
 * Provides a clean interface to Firebase Auth services
 * Note: Auth state management is handled globally, not per component
 */
export const useAuth = () => {
  const dispatch = useDispatch();

  // Select auth state from Redux store
  const { user, isAuthenticated, isLoading, error, authStep } = useSelector(
    state => state.auth
  );

  /**
   * Email Authentication
   */
  const signInWithEmailAndPassword = useCallback(
    async (email, password) => {
      console.log('📧 useAuth: Starting email sign-in');
      dispatch(setLoading(true));
      dispatch(clearError());

      try {
        const result = await signInWithEmail(email, password);

        if (result.success) {
          console.log('✅ useAuth: Email sign-in successful');
          // Global auth listener will handle user state update
          return { success: true, user: result.user };
        } else {
          console.log('❌ useAuth: Email sign-in failed:', result.error);
          dispatch(setLoading(false));
          dispatch(clearError());
          return { success: false, error: result.error };
        }
      } catch (error) {
        console.error('❌ useAuth: Email sign-in error:', error);
        const errorMessage = 'Failed to sign in. Please try again.';
        dispatch(setLoading(false));
        dispatch(clearError());
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  const signUpWithEmailAndPassword = useCallback(
    async (email, password, displayName) => {
      console.log('📧 useAuth: Starting email sign-up');
      dispatch(setLoading(true));
      dispatch(clearError());

      try {
        const result = await signUpWithEmail(email, password, displayName);

        if (result.success) {
          console.log('✅ useAuth: Email sign-up successful');
          return { success: true, user: result.user };
        } else {
          console.log('❌ useAuth: Email sign-up failed:', result.error);
          dispatch(setLoading(false));
          dispatch(clearError());
          return { success: false, error: result.error };
        }
      } catch (error) {
        console.error('❌ useAuth: Email sign-up error:', error);
        const errorMessage = 'Failed to create account. Please try again.';
        dispatch(setLoading(false));
        dispatch(clearError());
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  /**
   * Phone Authentication
   */
  const signInWithPhoneNumber = useCallback(
    async phoneNumber => {
      console.log('📱 useAuth: Starting phone sign-in');
      dispatch(setLoading(true));
      dispatch(clearError());

      try {
        // Initialize recaptcha if not already done
        initializeRecaptcha();

        const result = await signInWithPhone(phoneNumber);

        if (result.success) {
          console.log('✅ useAuth: Phone verification code sent');
          dispatch(setAuthStep('otp_verification'));
          return {
            success: true,
            confirmationResult: result.confirmationResult,
            verificationId: result.verificationId,
          };
        } else {
          console.log('❌ useAuth: Phone sign-in failed:', result.error);
          dispatch(setLoading(false));
          dispatch(clearError());
          return { success: false, error: result.error };
        }
      } catch (error) {
        console.error('❌ useAuth: Phone sign-in error:', error);
        const errorMessage =
          'Failed to send verification code. Please try again.';
        dispatch(setLoading(false));
        dispatch(clearError());
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  const verifyPhoneCode = useCallback(
    async (confirmationResult, otpCode) => {
      console.log('🔢 useAuth: Verifying phone OTP');
      dispatch(setLoading(true));
      dispatch(clearError());

      try {
        const result = await verifyPhoneOTP(confirmationResult, otpCode);

        if (result.success) {
          console.log('✅ useAuth: Phone OTP verification successful');
          dispatch(setAuthStep('authenticated'));
          return { success: true, user: result.user };
        } else {
          console.log('❌ useAuth: Phone OTP verification failed:', result.error);
          dispatch(setLoading(false));
          dispatch(clearError());
          return { success: false, error: result.error };
        }
      } catch (error) {
        console.error('❌ useAuth: Phone OTP verification error:', error);
        const errorMessage = 'Invalid verification code. Please try again.';
        dispatch(setLoading(false));
        dispatch(clearError());
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  /**
   * Google Authentication
   */
  const signInWithGoogleProvider = useCallback(async () => {
    console.log('🔍 useAuth: Starting Google sign-in');
    dispatch(setLoading(true));
    dispatch(clearError());

    try {
      const result = await signInWithGoogle();

      if (result.success) {
        console.log('✅ useAuth: Google sign-in successful');
        // Global auth listener will handle user state update
        return { success: true, user: result.user };
      } else {
        console.log('❌ useAuth: Google sign-in failed:', result.error);
        dispatch(setLoading(false));
        dispatch(clearError());
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ useAuth: Google sign-in error:', error);
      const errorMessage = 'Failed to sign in with Google. Please try again.';
      dispatch(setLoading(false));
      dispatch(clearError());
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  /**
   * Sign Out
   */
  const signOut = useCallback(async () => {
    console.log('🚪 useAuth: Starting sign out');
    dispatch(setLoading(true));

    try {
      // First, clear the Redux state immediately
      console.log('🧹 useAuth: Clearing Redux state immediately');
      dispatch(logout());
      dispatch(setAuthStep('unauthenticated'));
      
      // Then sign out from Firebase
      console.log('🔥 useAuth: Signing out from Firebase');
      const result = await signOutUser();
      
      if (result.success) {
        console.log('✅ useAuth: Sign out successful');
        return { success: true };
      } else {
        console.log('❌ useAuth: Firebase sign out failed, but local state cleared:', result.error);
        // Even if Firebase signout fails, we've cleared local state
        return { success: true }; // Return success since local state is cleared
      }
    } catch (error) {
      console.error('❌ useAuth: Sign out error:', error);
      // Even if there's an error, clear local state
      dispatch(logout());
      dispatch(setAuthStep('unauthenticated'));
      dispatch(setLoading(false));
      return { success: true }; // Return success since we cleared local state
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  /**
   * Password Management
   */
  const sendPasswordReset = useCallback(
    async email => {
      dispatch(setLoading(true));
      dispatch(clearError());

      try {
        const result = await resetPassword(email);

        if (result.success) {
          return { success: true };
        } else {
          dispatch(clearError());
          return { success: false, error: result.error };
        }
      } catch (error) {
        const errorMessage = 'Failed to send password reset email.';
        dispatch(clearError());
        return { success: false, error: errorMessage };
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  const updatePassword = useCallback(
    async newPassword => {
      dispatch(setLoading(true));
      dispatch(clearError());

      try {
        const result = await changePassword(newPassword);

        if (result.success) {
          return { success: true };
        } else {
          dispatch(clearError());
          return { success: false, error: result.error };
        }
      } catch (error) {
        const errorMessage = 'Failed to update password.';
        dispatch(clearError());
        return { success: false, error: errorMessage };
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  /**
   * Profile Management
   */
  const updateProfile = useCallback(
    async updates => {
      if (!user?.uid) return { success: false, error: 'No user logged in' };

      dispatch(setLoading(true));
      dispatch(clearError());

      try {
        const result = await updateUserProfile(user.uid, updates);

        if (result.success) {
          // Update local user state
          dispatch(setUser({ ...user, ...updates }));
          return { success: true };
        } else {
          dispatch(clearError());
          return { success: false, error: result.error };
        }
      } catch (error) {
        const errorMessage = 'Failed to update profile.';
        dispatch(clearError());
        return { success: false, error: errorMessage };
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, user]
  );

  /**
   * Utility Functions
   */
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const setAuthenticationStep = useCallback(
    step => {
      dispatch(setAuthStep(step));
    },
    [dispatch]
  );

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    authStep,

    // Email Authentication
    signInWithEmail: signInWithEmailAndPassword,
    signUpWithEmail: signUpWithEmailAndPassword,

    // Phone Authentication
    signInWithPhone: signInWithPhoneNumber,
    verifyPhoneOTP: verifyPhoneCode,

    // Google Authentication
    signInWithGoogle: signInWithGoogleProvider,

    // Sign Out
    signOut,

    // Password Management
    sendPasswordReset,
    updatePassword,

    // Profile Management
    updateProfile,

    // Utility
    clearAuthError,
    setAuthStep: setAuthenticationStep,

    // Firebase Auth Instance (for advanced use)
    auth,
  };
};

export default useAuth;
