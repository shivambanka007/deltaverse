import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import FiLoginSuggestion from '../FiLoginSuggestion/FiLoginSuggestion';
import styles from './ChatMessage.module.css';

const ChatMessage = ({ message, onSuggestionClick, onFiConnect }) => {
  const [showDetails, setShowDetails] = useState(false);
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';

  const formatTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'just now';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#10b981'; // green
    if (confidence >= 0.6) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.6) return 'High confidence';
    if (confidence >= 0.6) return 'Medium confidence';
    return 'Low confidence';
  };

  // Determine if we should show Fi login suggestion
  const shouldShowFiSuggestion = () => {
    return message.requires_fi_auth && 
           !message.mcp_integration?.has_financial_data && 
           !isUser && 
           !isSystem;
  };

  // Determine the type of Fi suggestion based on message content
  const getFiSuggestionType = () => {
    const text = message.text?.toLowerCase() || '';
    if (text.includes('portfolio') || text.includes('investment')) return 'portfolio';
    if (text.includes('net worth') || text.includes('wealth')) return 'networth';
    if (text.includes('spending') || text.includes('expense')) return 'spending';
    if (text.includes('invest') || text.includes('sip')) return 'investment';
    return 'general';
  };

  return (
    <div className={`${styles.messageWrapper} ${isUser ? styles.userMessage : isSystem ? styles.systemMessage : styles.aiMessage}`}>
      <div className={styles.messageContent}>
        <div className={styles.messageHeader}>
          <div className={styles.avatar}>
            {isUser ? (
              message.user?.avatar ? (
                <img src={message.user.avatar} alt="User" />
              ) : (
                <span>{(message.user?.name || 'U').charAt(0).toUpperCase()}</span>
              )
            ) : isSystem ? (
              <span className={styles.systemIcon}>⚙️</span>
            ) : (
              <span className={styles.aiIcon}>🤖</span>
            )}
          </div>
          <div className={styles.messageInfo}>
            <span className={styles.senderName}>
              {isUser ? (message.user?.name || 'You') : isSystem ? 'System' : 'AI Assistant'}
            </span>
            <span className={styles.timestamp}>
              {formatTime(message.timestamp)}
            </span>
            {message.confidence && !isUser && (
              <span 
                className={styles.confidence}
                style={{ color: getConfidenceColor(message.confidence) }}
                title={`AI Confidence: ${(message.confidence * 100).toFixed(0)}%`}
              >
                {getConfidenceText(message.confidence)}
              </span>
            )}
          </div>
        </div>
        
        <div className={`${styles.messageBubble} ${message.isError ? styles.errorMessage : ''}`}>
          <p className={styles.messageText}>{message.text}</p>
          
          {/* Action Buttons */}
          {message.actionButtons && message.actionButtons.length > 0 && (
            <div className={styles.actionButtons}>
              {message.actionButtons.map((button, index) => (
                <button
                  key={index}
                  className={`${styles.actionButton} ${styles[button.style] || styles.primary}`}
                  onClick={() => {
                    if (button.action === 'connect_fi') {
                      onFiConnect && onFiConnect();
                    } else if (button.action === 'view_insights') {
                      // Pass to parent component to handle insights panel
                      onSuggestionClick && onSuggestionClick('VIEW_INSIGHTS');
                    } else if (button.action === 'dismiss') {
                      // Just dismiss the message or do nothing
                    } else {
                      onSuggestionClick && onSuggestionClick(button.action);
                    }
                  }}
                >
                  {button.text}
                </button>
              ))}
            </div>
          )}

          {/* AI Insights */}
          {message.insights && message.insights.length > 0 && (
            <div className={styles.insights}>
              <div className={styles.insightsHeader}>
                <span className={styles.insightsIcon}>💡</span>
                <span>Key Insights</span>
              </div>
              <ul className={styles.insightsList}>
                {message.insights.map((insight, index) => (
                  <li key={index} className={styles.insightItem}>
                    {insight.includes('Connect your accounts') ? (
                      <button 
                        className={styles.connectAccountButton}
                        onClick={() => onSuggestionClick && onSuggestionClick('CONNECT_ACCOUNT')}
                        title="Click to connect your financial accounts"
                      >
                        🔗 {insight}
                      </button>
                    ) : (
                      insight
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Items */}
          {message.actionItems && message.actionItems.length > 0 && (
            <div className={styles.actionItems}>
              <div className={styles.actionItemsHeader}>
                <span className={styles.actionIcon}>⚡</span>
                <span>Recommended Actions</span>
              </div>
              <ul className={styles.actionItemsList}>
                {message.actionItems.map((action, index) => (
                  <li key={index} className={styles.actionItem}>
                    <span className={styles.actionBullet}>•</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Follow-up Suggestions */}
          {message.suggestions && message.suggestions.length > 0 && (
            <div className={styles.suggestions}>
              <p className={styles.suggestionsLabel}>You might also ask:</p>
              <div className={styles.suggestionButtons}>
                {message.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className={styles.suggestionButton}
                    onClick={() => onSuggestionClick(suggestion)}
                    aria-label={`Ask: ${suggestion}`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Details Toggle */}
          {(message.queryId || message.confidence) && !isUser && (
            <div className={styles.messageFooter}>
              <button 
                className={styles.detailsToggle}
                onClick={() => setShowDetails(!showDetails)}
                aria-label="Toggle message details"
              >
                {showDetails ? 'Hide details' : 'Show details'}
              </button>
              
              {showDetails && (
                <div className={styles.messageDetails}>
                  {message.queryId && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Query ID:</span>
                      <span className={styles.detailValue}>{message.queryId}</span>
                    </div>
                  )}
                  {message.confidence && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Confidence:</span>
                      <span className={styles.detailValue}>
                        {(message.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Model:</span>
                    <span className={styles.detailValue}>Vertex AI (Gemini Pro)</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Fi Login Suggestion - Show when auth is required and user doesn't have Fi data */}
        {shouldShowFiSuggestion() && onFiConnect && (
          <FiLoginSuggestion 
            onConnect={onFiConnect}
            queryType={getFiSuggestionType()}
          />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
