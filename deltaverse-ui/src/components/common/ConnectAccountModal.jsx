import React, { useState, useEffect } from 'react';
import styles from './ConnectAccountModal.module.css';

const ConnectAccountModal = ({ isOpen, onClose, onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('fi-money');
  const [isVisible, setIsVisible] = useState(false);

  // Enhanced visibility management
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      // Add modal-open class to body for additional styling if needed
      document.body.classList.add('modal-open');
      // Delay visibility for smooth animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
      setIsVisible(false);
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await onConnect(selectedProvider);
      onClose();
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`${styles.modalOverlay} ${isVisible ? styles.visible : ''}`} 
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 id="modal-title" className={styles.modalTitle}>
            🔗 Connect Your Financial Account
          </h2>
          <button 
            className={styles.closeButton} 
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.benefitsSection}>
            <h3>🚀 Unlock Personalized Financial Insights</h3>
            <ul className={styles.benefitsList}>
              <li>📊 Real-time portfolio analysis</li>
              <li>💰 Personalized spending insights</li>
              <li>🎯 Goal-based investment recommendations</li>
              <li>📈 Performance tracking and alerts</li>
              <li>🔍 Expense categorization and trends</li>
            </ul>
          </div>

          <div className={styles.providersSection}>
            <h3>Choose Your Financial Data Provider</h3>
            <div className={styles.providerOptions}>
              <div 
                className={`${styles.providerCard} ${selectedProvider === 'fi-money' ? styles.selected : ''}`}
                onClick={() => setSelectedProvider('fi-money')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedProvider('fi-money')}
              >
                <div className={styles.providerIcon}>🏦</div>
                <div className={styles.providerInfo}>
                  <h4>Fi Money</h4>
                  <p>Connect your Fi account for comprehensive financial data</p>
                  <span className={styles.providerBadge}>Recommended</span>
                </div>
              </div>
              
              <div 
                className={`${styles.providerCard} ${selectedProvider === 'manual' ? styles.selected : ''}`}
                onClick={() => setSelectedProvider('manual')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedProvider('manual')}
              >
                <div className={styles.providerIcon}>📝</div>
                <div className={styles.providerInfo}>
                  <h4>Manual Entry</h4>
                  <p>Enter your financial information manually</p>
                  <span className={styles.providerBadge}>Coming Soon</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.securityNote}>
            <div className={styles.securityIcon}>🔒</div>
            <div className={styles.securityText}>
              <strong>Your data is secure:</strong> We use bank-level encryption and never store your login credentials. 
              Your financial data is processed securely and used only to provide personalized insights.
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button 
            className={styles.cancelButton} 
            onClick={onClose}
            disabled={isConnecting}
          >
            Maybe Later
          </button>
          <button 
            className={styles.connectButton} 
            onClick={handleConnect}
            disabled={isConnecting || selectedProvider === 'manual'}
          >
            {isConnecting ? (
              <>
                <span className={styles.spinner}></span>
                Connecting...
              </>
            ) : (
              <>
                🔗 Connect {selectedProvider === 'fi-money' ? 'Fi Money' : 'Account'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectAccountModal;
