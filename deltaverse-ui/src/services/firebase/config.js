import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'demo-api-key',
  authDomain:
    process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ||
    'demo-project.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId:
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:123456789:web:abcdef',
  measurementId:
    process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || 'G-XXXXXXXXXX',
};

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId'];
  const missingFields = requiredFields.filter(field => 
    !firebaseConfig[field] || firebaseConfig[field].includes('demo-')
  );
  
  if (missingFields.length > 0) {
    console.warn('⚠️ Firebase: Using demo configuration. Some features may not work properly.');
    console.warn('💡 To fix IndexedDB errors, set proper Firebase environment variables or use offline mode.');
    console.warn('Missing or demo fields:', missingFields);
    return false;
  } else {
    console.log('✅ Firebase: Configuration validated successfully');
    return true;
  }
};

// Initialize Firebase with error handling
let app;
let auth;
let db;
let analytics;

try {
  const isValidConfig = validateFirebaseConfig();
  
  if (isValidConfig) {
    // Initialize with real Firebase
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Only initialize analytics in production
    if (process.env.NODE_ENV === 'production' && firebaseConfig.measurementId !== 'G-XXXXXXXXXX') {
      analytics = getAnalytics(app);
    }
  } else {
    // Initialize with offline/demo mode to prevent IndexedDB errors
    console.log('🔧 Initializing Firebase in offline mode to prevent IndexedDB errors');
    
    // Create minimal Firebase app for demo mode
    const offlineConfig = {
      ...firebaseConfig,
      projectId: 'deltaverse-offline-demo'
    };
    
    app = initializeApp(offlineConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Connect to emulators if available
    if (process.env.NODE_ENV === 'development') {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('🔧 Connected to Firebase emulators');
      } catch (error) {
        console.log('ℹ️ Firebase emulators not available, using offline mode');
      }
    }
  }
  
  console.log('✅ Firebase initialized successfully');
  
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  
  // Fallback: Create minimal auth and db objects to prevent app crashes
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback) => callback(null),
    signInWithPopup: () => Promise.reject(new Error('Firebase not available')),
    signOut: () => Promise.resolve()
  };
  
  db = {
    collection: () => ({
      doc: () => ({
        get: () => Promise.resolve({ exists: false }),
        set: () => Promise.resolve(),
        update: () => Promise.resolve()
      })
    })
  };
  
  console.log('🔧 Using fallback Firebase objects to prevent crashes');
}

export { auth, db, analytics };
export default app;
