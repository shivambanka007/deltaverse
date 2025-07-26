import React, { useEffect, useState } from 'react';
import styles from './IndexedDBErrorHandler.module.css';

const IndexedDBErrorHandler = ({ children }) => {
  const [hasIndexedDBError, setHasIndexedDBError] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');

  useEffect(() => {
    // Listen for IndexedDB errors
    const handleError = (event) => {
      const error = event.error || event.reason;
      if (error && error.message && error.message.includes('indexedDB')) {
        setHasIndexedDBError(true);
        setErrorDetails(error.message);
        console.error('IndexedDB Error detected:', error);
      }
    };

    // Listen for unhandled promise rejections
    const handleUnhandledRejection = (event) => {
      if (event.reason && event.reason.message && 
          event.reason.message.includes('backing store')) {
        setHasIndexedDBError(true);
        setErrorDetails(event.reason.message);
        event.preventDefault(); // Prevent the error from showing in console
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Test IndexedDB availability
    const testIndexedDB = async () => {
      try {
        const request = indexedDB.open('test-db', 1);
        request.onerror = () => {
          setHasIndexedDBError(true);
          setErrorDetails('IndexedDB is not available or corrupted');
        };
        request.onsuccess = () => {
          indexedDB.deleteDatabase('test-db');
        };
      } catch (error) {
        setHasIndexedDBError(true);
        setErrorDetails(error.message);
      }
    };

    testIndexedDB();

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const clearBrowserStorage = async () => {
    try {
      // Clear localStorage
      localStorage.clear();
      sessionStorage.clear();

      // Clear IndexedDB
      const databases = await indexedDB.databases();
      for (const db of databases) {
        await new Promise((resolve, reject) => {
          const deleteReq = indexedDB.deleteDatabase(db.name);
          deleteReq.onsuccess = () => resolve();
          deleteReq.onerror = () => reject(deleteReq.error);
        });
      }

      // Clear cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`); 
      });

      alert('✅ Storage cleared! The page will now reload.');
      window.location.reload();
    } catch (error) {
      console.error('Error clearing storage:', error);
      alert('❌ Could not clear storage automatically. Please clear browser data manually.');
    }
  };

  const openInIncognito = () => {
    alert('💡 Try opening DeltaVerse in an incognito/private window to bypass storage issues.');
  };

  if (hasIndexedDBError) {
    return (
      <div className={styles.indexeddbErrorContainer}>
        <div className={styles.errorModal}>
          <div className={styles.errorHeader}>
            <h2>🔧 Storage Issue Detected</h2>
            <p>DeltaVerse encountered a browser storage problem that's preventing it from working properly.</p>
          </div>
          
          <div className={styles.errorDetails}>
            <h3>What happened?</h3>
            <p>Your browser's IndexedDB storage is corrupted or unavailable. This is a common issue that can be easily fixed.</p>
            
            <div className={styles.errorMessage}>
              <strong>Technical details:</strong> {errorDetails}
            </div>
          </div>

          <div className={styles.errorSolutions}>
            <h3>Quick Fixes:</h3>
            
            <button 
              className={`${styles.solutionButton} ${styles.primary}`}
              onClick={clearBrowserStorage}
            >
              🧹 Clear Browser Storage (Recommended)
            </button>
            
            <button 
              className={`${styles.solutionButton} ${styles.secondary}`}
              onClick={openInIncognito}
            >
              🕵️ Try Incognito Mode
            </button>
            
            <button 
              className={`${styles.solutionButton} ${styles.secondary}`}
              onClick={() => window.location.reload()}
            >
              🔄 Reload Page
            </button>
          </div>

          <div className={styles.manualInstructions}>
            <h4>Manual Fix (if buttons don't work):</h4>
            <ol>
              <li>Open browser DevTools (F12)</li>
              <li>Go to <strong>Application</strong> tab</li>
              <li>Click <strong>Storage</strong> → <strong>Clear site data</strong></li>
              <li>Refresh the page</li>
            </ol>
          </div>

          <div className={styles.errorFooter}>
            <p>💡 This won't affect your DeltaVerse account data - only local browser storage.</p>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default IndexedDBErrorHandler;
