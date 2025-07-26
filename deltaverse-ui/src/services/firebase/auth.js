import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  deleteUser,
  linkWithCredential,
  PhoneAuthProvider,
  EmailAuthProvider,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './config';
import { withAuthTimeout, withFirebaseTimeout, safeAsync } from '../../utils/timeout';

// Google Auth Provider with enhanced configuration
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Phone Auth - Recaptcha Verifier
let recaptchaVerifier = null;

/**
 * Initialize Recaptcha Verifier for Phone Authentication
 */
export const initializeRecaptcha = (containerId = 'recaptcha-container') => {
  try {
    // Clear existing verifier
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch (clearError) {
        // Ignore clear errors
      }
      recaptchaVerifier = null;
    }

    // Ensure container exists
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.style.display = 'none';
      document.body.appendChild(container);
    }

    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: response => {
        // reCAPTCHA solved successfully
      },
      'expired-callback': () => {
        // reCAPTCHA expired, reset
        if (recaptchaVerifier) {
          try {
            recaptchaVerifier.clear();
          } catch (clearError) {
            // Ignore clear errors
          }
          recaptchaVerifier = null;
        }
      },
    });

    return recaptchaVerifier;
  } catch (error) {
    return null;
  }
};

/**
 * Create user document in Firestore
 */
export const createUserDocument = async (uid, userData) => {
  const result = await safeAsync(async () => {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await withFirebaseTimeout(getDoc(userDocRef));

    if (!userDoc.exists()) {
      await withFirebaseTimeout(
        setDoc(userDocRef, {
          uid,
          ...userData,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          preferences: {
            language: 'en',
            currency: 'INR',
            notifications: true,
            theme: 'light',
          },
        })
      );
    } else {
      // Update last login time
      await withFirebaseTimeout(
        updateDoc(userDocRef, {
          lastLoginAt: serverTimestamp(),
        })
      );
    }
    return true;
  });

  return result.success 
    ? { success: true } 
    : { success: false, error: result.error };
};

/**
 * Email/Password Authentication
 */
export const signInWithEmail = async (email, password) => {
  const result = await safeAsync(async () => {
    const userCredential = await withAuthTimeout(
      signInWithEmailAndPassword(auth, email, password)
    );
    const user = userCredential.user;

    // Update user document in Firestore
    await createUserDocument(user.uid, {
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      provider: 'email',
    });

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      provider: 'email',
    };
  });

  return result.success
    ? { success: true, user: result.data }
    : { success: false, error: getAuthErrorMessage(result.error) };
};

export const signUpWithEmail = async (email, password, displayName) => {
  const result = await safeAsync(async () => {
    const userCredential = await withAuthTimeout(
      createUserWithEmailAndPassword(auth, email, password)
    );
    const user = userCredential.user;

    // Update user profile
    await withAuthTimeout(updateProfile(user, { displayName }));

    // Create user document in Firestore
    await createUserDocument(user.uid, {
      email: user.email,
      displayName,
      provider: 'email',
      emailVerified: false,
    });

    // Send email verification (don't fail if this fails)
    try {
      await withAuthTimeout(sendEmailVerification(user));
    } catch (emailError) {
      // Email verification failed, but account was created
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName,
      emailVerified: false,
      provider: 'email',
    };
  });

  return result.success
    ? { success: true, user: result.data }
    : { success: false, error: getAuthErrorMessage(result.error) };
};

/**
 * Phone Authentication - Enhanced for better reliability
 */
export const signInWithPhone = async phoneNumber => {
  const result = await safeAsync(async () => {
    // Initialize reCAPTCHA
    const verifier = initializeRecaptcha();
    if (!verifier) {
      throw new Error('Failed to initialize reCAPTCHA. Please refresh and try again.');
    }

    // Validate phone number format
    if (!phoneNumber.startsWith('+91') || phoneNumber.length !== 13) {
      throw new Error('Please enter a valid Indian mobile number');
    }

    // Attempt phone sign-in with longer timeout
    const confirmationResult = await withAuthTimeout(
      signInWithPhoneNumber(auth, phoneNumber, verifier),
      'phone'
    );

    return {
      confirmationResult,
      verificationId: confirmationResult.verificationId,
    };
  });

  // Clear reCAPTCHA on error
  if (!result.success && recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch (clearError) {
      // Ignore clear errors
    }
    recaptchaVerifier = null;
  }

  return result.success
    ? { success: true, ...result.data }
    : { success: false, error: getAuthErrorMessage(result.error) };
};

export const verifyPhoneOTP = async (confirmationResult, otpCode) => {
  const result = await safeAsync(async () => {
    const userCredential = await withAuthTimeout(
      confirmationResult.confirm(otpCode)
    );
    const user = userCredential.user;

    // Create user document in Firestore
    await createUserDocument(user.uid, {
      phoneNumber: user.phoneNumber,
      displayName: user.phoneNumber,
      provider: 'phone',
    });

    return {
      uid: user.uid,
      phoneNumber: user.phoneNumber,
      displayName: user.phoneNumber,
      provider: 'phone',
    };
  });

  return result.success
    ? { success: true, user: result.data }
    : { success: false, error: getAuthErrorMessage(result.error) };
};

/**
 * Google Authentication - Fixed to return proper user data
 */
export const signInWithGoogle = async () => {
  console.log('🔍 Firebase Auth: Starting Google sign-in process');
  
  try {
    // Check if popup blockers might be an issue
    if (typeof window !== 'undefined' && window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
      throw new Error('Google sign-in requires HTTPS in production');
    }

    console.log('🔍 Firebase Auth: Opening Google popup...');
    const authResult = await withAuthTimeout(
      signInWithPopup(auth, googleProvider),
      'general'
    );
    
    const user = authResult.user;
    console.log('🔍 Firebase Auth: Got user from Google:', user.email);

    // Validate that we got the expected user data
    if (!user || !user.uid) {
      throw new Error('Invalid user data received from Google');
    }

    // Create user document in Firestore
    console.log('🔍 Firebase Auth: Creating user document in Firestore...');
    const createDocResult = await createUserDocument(user.uid, {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      provider: 'google',
      emailVerified: user.emailVerified,
    });

    if (!createDocResult.success) {
      console.log('⚠️ Firebase Auth: User document creation failed, but continuing...');
    }

    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      provider: 'google',
    };

    console.log('✅ Firebase Auth: Google sign-in successful, returning user data:', userData);
    return { success: true, user: userData };

  } catch (error) {
    console.error('❌ Firebase Auth: Google sign-in error:', error);
    return { success: false, error: getAuthErrorMessage(error.message || error.code) };
  }
};

/**
 * Sign Out
 */
export const signOutUser = async () => {
  const result = await safeAsync(async () => {
    await withAuthTimeout(signOut(auth));
    
    // Clear reCAPTCHA on sign out
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch (clearError) {
        // Ignore clear errors
      }
      recaptchaVerifier = null;
    }
    
    return true;
  });

  return result.success
    ? { success: true }
    : { success: false, error: getAuthErrorMessage(result.error) };
};

/**
 * User Profile Management
 */
export const updateUserProfile = async (uid, updates) => {
  const result = await safeAsync(async () => {
    await withFirebaseTimeout(
      updateDoc(doc(db, 'users', uid), {
        ...updates,
        updatedAt: serverTimestamp(),
      })
    );
    return true;
  });

  return result.success
    ? { success: true }
    : { success: false, error: result.error };
};

export const getUserProfile = async uid => {
  const result = await safeAsync(async () => {
    const userDoc = await withFirebaseTimeout(getDoc(doc(db, 'users', uid)));
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error('User not found');
    }
  });

  return result.success
    ? { success: true, data: result.data }
    : { success: false, error: result.error };
};

/**
 * Password Management
 */
export const resetPassword = async email => {
  const result = await safeAsync(async () => {
    await withAuthTimeout(sendPasswordResetEmail(auth, email));
    return true;
  });

  return result.success
    ? { success: true }
    : { success: false, error: getAuthErrorMessage(result.error) };
};

export const changePassword = async newPassword => {
  const result = await safeAsync(async () => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }

    await withAuthTimeout(updatePassword(user, newPassword));
    return true;
  });

  return result.success
    ? { success: true }
    : { success: false, error: getAuthErrorMessage(result.error) };
};

/**
 * Auth State Observer
 */
export const onAuthStateChange = callback => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Error Message Helper
 */
const getAuthErrorMessage = errorCode => {
  const errorMessages = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/invalid-phone-number': 'Please enter a valid Indian mobile number (+91XXXXXXXXXX).',
    'auth/invalid-verification-code': 'Invalid verification code. Please try again.',
    'auth/code-expired': 'Verification code has expired. Please request a new one.',
    'auth/popup-closed-by-user': 'Google sign-in popup was closed. Please try again.',
    'auth/cancelled-popup-request': 'Google sign-in was cancelled. Please try again.',
    'auth/popup-blocked': 'Google sign-in popup was blocked. Please allow popups and try again.',
    'auth/captcha-check-failed': 'reCAPTCHA verification failed. Please refresh and try again.',
    'auth/quota-exceeded': 'SMS quota exceeded. Please try again later.',
    'Operation timed out': 'Request timed out. Please check your connection and try again.',
    'Authentication (general) timed out': 'Authentication timed out. Please try again.',
    'Authentication (phone) timed out': 'Phone verification timed out. Please try again.',
    'Firebase firestore operation timed out': 'Database operation timed out. Please try again.',
    'Failed to initialize reCAPTCHA. Please refresh and try again.': 'Failed to initialize reCAPTCHA. Please refresh and try again.',
    'Please enter a valid Indian mobile number': 'Please enter a valid Indian mobile number (+91XXXXXXXXXX).',
    'No user logged in': 'Please sign in to continue.',
    'Google sign-in requires HTTPS in production': 'Google sign-in requires a secure connection.',
    'Invalid user data received from Google': 'Invalid response from Google. Please try again.',
  };

  // Handle timeout errors specifically
  if (typeof errorCode === 'string' && errorCode.includes('timed out')) {
    return 'Request timed out. Please check your connection and try again.';
  }

  // Handle popup errors specifically
  if (typeof errorCode === 'string' && errorCode.includes('popup')) {
    return 'Google sign-in popup issue. Please allow popups and try again.';
  }

  return (
    errorMessages[errorCode] ||
    errorMessages[errorCode?.replace('auth/', '')] ||
    'An unexpected error occurred. Please try again.'
  );
};

// Export auth instance for direct use
export { auth };

const authService = {
  signInWithEmail,
  signUpWithEmail,
  signInWithPhone,
  verifyPhoneOTP,
  signInWithGoogle,
  signOutUser,
  createUserDocument,
  updateUserProfile,
  getUserProfile,
  resetPassword,
  changePassword,
  onAuthStateChange,
  initializeRecaptcha,
};

export default authService;
