import React, { useState } from 'react';
import styles from './InlineFiLogin.module.css';

const InlineFiLogin = ({ onConnect, onDismiss, context = "general" }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await onConnect('fi-money');
    } finally {
      setIsConnecting(false);
    }
  };

  const getContextMessage = () => {
    switch (context) {
      case 'personal_query':
        return {
          title: "Connect Fi Money for Personalized Answer",
          description: "To answer your personal financial question, I need access to your Fi Money account data.",
          benefit: "Get AI-powered insights based on your actual financial situation"
        };
      case 'portfolio_analysis':
        return {
          title: "Connect for Portfolio Analysis",
          description: "Connect your Fi Money account to get detailed portfolio analysis and recommendations.",
          benefit: "Real-time portfolio tracking and AI-powered investment advice"
        };
      case 'spending_insights':
        return {
          title: "Connect for Spending Insights",
          description: "Link your Fi Money account to analyze your spending patterns and get personalized budgeting advice.",
          benefit: "Smart expense categorization and spending optimization tips"
        };
      default:
        return {
          title: "Unlock Personalized Financial Insights",
          description: "Connect your Fi Money account to get AI-powered advice tailored to your financial situation.",
          benefit: "Personalized recommendations based on your actual data"
        };
    }
  };

  const contextInfo = getContextMessage();

  return (
    <div className={styles.inlineLogin}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.icon}>🔗</div>
          <h3>{contextInfo.title}</h3>
        </div>
        
        <p className={styles.description}>
          {contextInfo.description}
        </p>
        
        <div className={styles.benefits}>
          <div className={styles.benefit}>
            <span className={styles.checkIcon}>✅</span>
            <span>{contextInfo.benefit}</span>
          </div>
          <div className={styles.benefit}>
            <span className={styles.checkIcon}>✅</span>
            <span>Secure data encryption and privacy protection</span>
          </div>
          <div className={styles.benefit}>
            <span className={styles.checkIcon}>✅</span>
            <span>Continue chatting with enhanced AI responses</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.connectButton}
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <span className={styles.spinner}></span>
                Connecting...
              </>
            ) : (
              <>
                🔗 Connect Fi Money
              </>
            )}
          </button>
          
          <button 
            className={styles.dismissButton}
            onClick={onDismiss}
          >
            Continue without connecting
          </button>
        </div>

        <div className={styles.security}>
          <span className={styles.securityIcon}>🔒</span>
          <span>Your data is encrypted and secure. We never store your login credentials.</span>
        </div>
      </div>
    </div>
  );
};

export default InlineFiLogin;
