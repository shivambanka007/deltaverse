import React from 'react';
import styles from './FiLoginSuggestion.module.css';

const FiLoginSuggestion = ({ onConnect, queryType = "general" }) => {
  const getSuggestionContent = () => {
    switch (queryType) {
      case 'portfolio':
        return {
          icon: '📊',
          title: 'Connect for Portfolio Insights (Optional)',
          message: 'I can provide much better portfolio analysis with your actual Fi Money data.',
          cta: 'Connect Fi Money'
        };
      case 'networth':
        return {
          icon: '💰',
          title: 'Connect for Real Net Worth (Optional)',
          message: 'Connect your Fi Money account to see your actual net worth and get personalized advice.',
          cta: 'Show My Net Worth'
        };
      case 'spending':
        return {
          icon: '💳',
          title: 'Connect for Spending Analysis (Optional)',
          message: 'I can analyze your actual spending patterns and provide personalized budgeting advice.',
          cta: 'Analyze My Spending'
        };
      case 'investment':
        return {
          icon: '📈',
          title: 'Connect for Investment Advice (Optional)',
          message: 'Get personalized investment recommendations based on your current portfolio and goals.',
          cta: 'Get Investment Advice'
        };
      default:
        return {
          icon: '🔗',
          title: 'Connect for Personalized Insights (Optional)',
          message: 'Connect your Fi Money account to get AI-powered advice tailored to your financial situation.',
          cta: 'Connect Fi Money'
        };
    }
  };

  const content = getSuggestionContent();

  return (
    <div className={styles.suggestion}>
      <div className={styles.content}>
        <div className={styles.icon}>{content.icon}</div>
        <div className={styles.text}>
          <div className={styles.title}>{content.title}</div>
          <div className={styles.message}>{content.message}</div>
        </div>
      </div>
      <div className={styles.buttonContainer}>
        <button 
          className={styles.connectButton}
          onClick={() => onConnect('fi-money')}
        >
          {content.cta}
        </button>
        <button 
          className={styles.skipButton}
          onClick={() => onConnect('skip')}
        >
          Skip for Now
        </button>
      </div>
    </div>
  );
};

export default FiLoginSuggestion;
