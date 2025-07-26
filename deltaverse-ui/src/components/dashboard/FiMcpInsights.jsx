import React, { useState, useEffect, useCallback } from 'react';
import { authenticatedApi } from '../../services/api/authenticatedApi';
import { auth } from '../../services/firebase/config';
import styles from './FiMcpInsights.module.css';

const FiMcpInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fiConnected, setFiConnected] = useState(false);
  const [connectingFi, setConnectingFi] = useState(false);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const loadInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get personalized insights first
      const insightsResponse = await authenticatedApi.getChatInsights();
      
      if (insightsResponse.success) {
        const insightsData = insightsResponse.data.data || insightsResponse.data;
        
        if (insightsData.insights && insightsData.insights.length > 0) {
          setInsights(insightsData.insights);
          setFiConnected(true);
        } else {
          // No insights available - user needs to connect Fi Money
          setFiConnected(false);
          setInsights([]);
        }
      } else {
        throw new Error(insightsResponse.error || 'Failed to load insights');
      }
    } catch (err) {
      console.error('Error loading insights:', err);
      setError(err.message);
      setFiConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const connectFiMoney = async () => {
    try {
      console.log('🔍 FiMcpInsights: Connect Fi Money clicked');
      console.log('🔍 Current API URL:', process.env.REACT_APP_API_URL);
      
      setConnectingFi(true);
      setError(null);

      // Step 1: Initiate Fi login with SIP Samurai scenario (rich data)
      console.log('🔍 Calling authenticatedApi.initiateFiLogin...');
      const loginResponse = await authenticatedApi.initiateFiLogin('8888888888');
      
      console.log('🔍 Login response:', loginResponse);
      
      if (!loginResponse.success) {
        throw new Error(loginResponse.error || 'Failed to initiate Fi login');
      }

      const { session_id, login_url } = loginResponse.data;
      
      console.log('🔍 Session ID:', session_id);
      console.log('🔍 Login URL:', login_url);

      // Step 2: Open Fi-MCP popup
      console.log('🔍 Opening popup with URL:', login_url);
      const popup = window.open(
        login_url,
        'fi-login',
        `width=500,height=700,scrollbars=yes,resizable=yes,left=${window.screen.width / 2 - 250},top=${window.screen.height / 2 - 350}`
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Step 3: Monitor popup and complete authentication
      const checkPopup = setInterval(async () => {
        try {
          if (popup.closed) {
            clearInterval(checkPopup);
            
            // Step 4: Complete Fi login
            const completeResponse = await authenticatedApi.completeFiLogin(
              session_id,
              '8888888888'
            );

            if (completeResponse.success) {
              console.log('✅ Fi Money connected successfully');
              setFiConnected(true);
              
              // Step 5: Reload insights with new Fi data
              await loadInsights();
            } else {
              throw new Error(completeResponse.error || 'Fi authentication failed');
            }
          }
        } catch (err) {
          clearInterval(checkPopup);
          console.error('Fi connection error:', err);
          setError(err.message);
        }
      }, 1000);

      // Cleanup if popup is manually closed
      setTimeout(() => {
        if (!popup.closed) {
          clearInterval(checkPopup);
          popup.close();
          setError('Fi connection timed out. Please try again.');
        }
      }, 60000); // 1 minute timeout

    } catch (err) {
      console.error('Error connecting Fi Money:', err);
      setError(err.message);
    } finally {
      setConnectingFi(false);
    }
  };

  const getInsightIcon = (insight) => {
    const type = insight.type || insight.category || 'general';
    const priority = insight.priority || 'medium';
    
    if (priority === 'high') return '🚨';
    if (type.includes('sip') || type.includes('investment')) return '📈';
    if (type.includes('expense') || type.includes('spending')) return '💰';
    if (type.includes('tax')) return '📋';
    if (type.includes('credit') || type.includes('score')) return '⭐';
    return '🤖';
  };

  const getInsightPriorityClass = (insight) => {
    const priority = insight.priority || 'medium';
    return styles[`priority${priority.charAt(0).toUpperCase() + priority.slice(1)}`] || styles.priorityMedium;
  };

  if (loading) {
    return (
      <section className={styles.insightsSection}>
        <h2>AI Financial Insights</h2>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading your personalized insights...</p>
        </div>
      </section>
    );
  }

  if (!fiConnected) {
    return (
      <section className={styles.insightsSection}>
        <h2>AI Financial Insights</h2>
        <div className={styles.connectPrompt}>
          <div className={styles.connectIcon}>🔗</div>
          <h3>Connect Your Financial Data</h3>
          <p>
            Get personalized AI-powered insights and recommendations based on your actual financial data.
            Connect your Fi Money account to unlock advanced analytics.
          </p>
          <button 
            className={styles.connectButton}
            onClick={connectFiMoney}
            disabled={connectingFi}
          >
            {connectingFi ? (
              <>
                <div className={styles.spinner}></div>
                Connecting Fi Money...
              </>
            ) : (
              <>
                <span className={styles.buttonIcon}>💰</span>
                Connect Fi Money
              </>
            )}
          </button>
          {error && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>⚠️</span>
              {typeof error === 'string' ? error : error.message || 'An error occurred'}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.insightsSection}>
      <h2>AI Financial Insights</h2>
      
      {fiConnected ? (
        // Connected State
        <>
          <div className={styles.connectionStatus}>
            <span className={styles.connectedIcon}>✅</span>
            <span>Fi Money Connected</span>
            <button 
              className={styles.refreshButton}
              onClick={loadInsights}
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>⚠️</span>
              {typeof error === 'string' ? error : error.message || 'An error occurred'}
              <button onClick={loadInsights} className={styles.retryButton}>
                Try Again
              </button>
            </div>
          )}

          <div className={styles.insightsList}>
            {insights.length > 0 ? (
              insights.map((insight, index) => (
                <div 
                  key={insight.id || index} 
                  className={`${styles.insightItem} ${getInsightPriorityClass(insight)}`}
                >
                  <div className={styles.insightIcon}>
                    {getInsightIcon(insight)}
                  </div>
                  <div className={styles.insightContent}>
                    <div className={styles.insightHeader}>
                      <h4>{insight.title || insight.message || 'Financial Insight'}</h4>
                      {insight.priority && (
                        <span className={styles.priorityBadge}>
                          {insight.priority.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p>{insight.description || insight.suggestion || insight.details}</p>
                    {insight.action && (
                      <div className={styles.insightAction}>
                        <strong>Action:</strong> {insight.action}
                      </div>
                    )}
                    {insight.impact && (
                      <div className={styles.insightImpact}>
                        <strong>Impact:</strong> {insight.impact}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noInsights}>
                <div className={styles.noInsightsIcon}>🤖</div>
                <h3>Generating Insights...</h3>
                <p>Your AI financial advisor is analyzing your data to provide personalized recommendations.</p>
                <button onClick={loadInsights} className={styles.generateButton}>
                  Generate Insights
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        // Not Connected State
        <div className={styles.connectPrompt}>
          <div className={`${styles.insightItem} ${styles.priorityHigh}`}>
            <div className={styles.insightIcon}>🚨</div>
            <div className={styles.insightContent}>
              <div className={styles.insightHeader}>
                <h4>Connect Your Financial Data</h4>
                <span className={styles.priorityBadge}>HIGH</span>
              </div>
              <p>Connect your Fi Money account to get personalized AI-powered insights based on your actual financial data.</p>
              <div className={styles.insightAction}>
                <strong>Action:</strong> Click 'Connect Fi Money' to get started
              </div>
              <div className={styles.insightImpact}>
                <strong>Impact:</strong> Unlock personalized financial recommendations
              </div>
              <button 
                className={styles.connectButton}
                onClick={connectFiMoney}
                disabled={connectingFi}
              >
                {connectingFi ? (
                  <>
                    <div className={styles.spinner}></div>
                    Connecting Fi Money...
                  </>
                ) : (
                  <>
                    <span className={styles.buttonIcon}>🔗</span>
                    Connect Fi Money
                  </>
                )}
              </button>
            </div>
          </div>
          {error && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>⚠️</span>
              {typeof error === 'string' ? error : error.message || 'An error occurred'}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default FiMcpInsights;
