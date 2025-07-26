/**
 * Firebase Authentication Diagnostics
 * Environment-aware comprehensive testing tool to identify authentication issues
 */

import { auth } from '../services/firebase/config';
import { GoogleAuthProvider, signInWithPopup, getRedirectResult } from 'firebase/auth';

export const runFirebaseAuthDiagnostics = async () => {
  console.group('🔍 Firebase Authentication Diagnostics');
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    firebaseConfig: {},
    authState: {},
    googleProvider: {},
    domainConfig: {},
    errors: [],
    recommendations: []
  };

  try {
    // 1. Check Firebase Configuration
    console.log('1️⃣ Checking Firebase Configuration...');
    diagnostics.firebaseConfig = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY ? 'present' : 'missing',
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'missing',
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'missing',
      appId: process.env.REACT_APP_FIREBASE_APP_ID ? 'present' : 'missing',
      currentDomain: window.location.hostname,
      currentProtocol: window.location.protocol,
      currentOrigin: window.location.origin,
      environment: process.env.NODE_ENV,
      reactAppEnvironment: process.env.REACT_APP_ENVIRONMENT
    };

    // Environment-specific checks
    if (process.env.NODE_ENV === 'development') {
      diagnostics.recommendations.push('Development mode: Enhanced logging enabled');
      if (window.location.hostname === 'localhost') {
        diagnostics.recommendations.push('Localhost detected: Ensure Firebase project allows localhost');
      }
    } else {
      diagnostics.recommendations.push('Production mode: Ensure HTTPS is enabled');
      if (window.location.protocol !== 'https:') {
        diagnostics.errors.push('Production requires HTTPS for authentication');
      }
    }

    // 2. Check Auth Instance
    console.log('2️⃣ Checking Auth Instance...');
    diagnostics.authState = {
      authInstanceExists: !!auth,
      currentUser: auth.currentUser ? {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        emailVerified: auth.currentUser.emailVerified
      } : null,
      authReady: true
    };

    // 3. Check Google Provider
    console.log('3️⃣ Checking Google Provider...');
    const googleProvider = new GoogleAuthProvider();
    diagnostics.googleProvider = {
      providerCreated: !!googleProvider,
      providerId: googleProvider.providerId,
      scopes: googleProvider._scopes || []
    };

    // 4. Test Popup Capability (environment-aware)
    console.log('4️⃣ Testing Popup Capability...');
    try {
      const testPopup = window.open('', '_blank', 'width=1,height=1');
      if (testPopup) {
        testPopup.close();
        diagnostics.domainConfig.popupAllowed = true;
      } else {
        diagnostics.domainConfig.popupAllowed = false;
        diagnostics.recommendations.push('Enable popups for this domain');
      }
    } catch (error) {
      diagnostics.domainConfig.popupAllowed = false;
      diagnostics.errors.push(`Popup test failed: ${error.message}`);
    }

    // 5. Check for Redirect Result
    console.log('5️⃣ Checking for Redirect Result...');
    try {
      const redirectResult = await getRedirectResult(auth);
      diagnostics.authState.redirectResult = redirectResult ? {
        user: {
          uid: redirectResult.user.uid,
          email: redirectResult.user.email
        },
        credential: !!redirectResult.credential
      } : null;
    } catch (error) {
      diagnostics.errors.push(`Redirect result check failed: ${error.message}`);
    }

    // 6. Environment-specific domain checks
    console.log('6️⃣ Environment-specific Domain Checks...');
    const currentOrigin = window.location.origin;
    const authDomain = process.env.REACT_APP_FIREBASE_AUTH_DOMAIN;
    
    diagnostics.domainConfig = {
      ...diagnostics.domainConfig,
      currentOrigin,
      authDomain,
      isLocalhost: window.location.hostname === 'localhost',
      isHTTPS: window.location.protocol === 'https:',
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production'
    };

    // Environment-specific recommendations
    if (diagnostics.domainConfig.isDevelopment) {
      diagnostics.recommendations.push('Development: Firebase emulators can be used for testing');
      if (diagnostics.domainConfig.isLocalhost) {
        diagnostics.recommendations.push('Localhost: Add localhost to Firebase authorized domains');
      }
    }

    if (diagnostics.domainConfig.isProduction && !diagnostics.domainConfig.isHTTPS) {
      diagnostics.errors.push('Production requires HTTPS for Google authentication');
    }

    if (diagnostics.errors.length === 0) {
      diagnostics.recommendations.push('Firebase configuration appears correct for current environment');
    }

  } catch (error) {
    diagnostics.errors.push(`Diagnostics failed: ${error.message}`);
  }

  // Log results with environment context
  console.log(`📊 Diagnostics Results (${diagnostics.environment} mode):`, diagnostics);
  
  if (diagnostics.errors.length > 0) {
    console.group('❌ Errors Found:');
    diagnostics.errors.forEach((error, index) => {
      console.error(`${index + 1}. ${error}`);
    });
    console.groupEnd();
  }

  if (diagnostics.recommendations.length > 0) {
    console.group('💡 Recommendations:');
    diagnostics.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
    console.groupEnd();
  }

  console.groupEnd();
  return diagnostics;
};

export const testGoogleAuthFlow = async () => {
  console.group('🧪 Testing Google Auth Flow');
  
  try {
    const isDevelopment = process.env.NODE_ENV === 'development';
    console.log(`1️⃣ Environment: ${isDevelopment ? 'Development' : 'Production'}`);
    
    console.log('2️⃣ Creating Google Provider...');
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({ prompt: 'select_account' });
    
    console.log('3️⃣ Testing signInWithPopup (will open popup)...');
    console.warn('⚠️ This will open a Google sign-in popup for testing');
    
    const result = await signInWithPopup(auth, provider);
    
    console.log('✅ Authentication successful!', {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      emailVerified: result.user.emailVerified,
      environment: isDevelopment ? 'development' : 'production'
    });
    
    return { success: true, user: result.user, environment: process.env.NODE_ENV };
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Environment:', process.env.NODE_ENV);
    
    return { 
      success: false, 
      error: error.message, 
      code: error.code,
      environment: process.env.NODE_ENV
    };
  } finally {
    console.groupEnd();
  }
};

// Auto-run diagnostics in development only
if (process.env.NODE_ENV === 'development') {
  // Run diagnostics after a short delay to ensure Firebase is initialized
  setTimeout(() => {
    runFirebaseAuthDiagnostics();
  }, 2000);
}
