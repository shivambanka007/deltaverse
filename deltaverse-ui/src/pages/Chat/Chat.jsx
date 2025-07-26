import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import ChatMessage from '../../components/chat/ChatMessage';
import ChatInput from '../../components/chat/ChatInput';
import ConnectAccountModal from '../../components/common/ConnectAccountModal';
import FiLoginModal from '../../components/modals/FiLoginModal/FiLoginModal';
import InlineFiLogin from '../../components/chat/InlineFiLogin/InlineFiLogin';
import MasterVoiceIntegration from '../../components/voice/MasterVoiceIntegration';
import FourDimensionalChatIntegration from '../../components/4d/FourDimensionalChatIntegration';
import { chatAPI } from '../../services/api/chat';
import fiLoginPopup from '../../services/fiLoginPopup';
import { setConnected, setInsights } from '../../store/slices/fiConnectSlice';
import { 
  Box, 
  Fab, 
  Tooltip, 
  Collapse, 
  IconButton,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Badge
} from '@mui/material';
import { 
  Mic as MicIcon, 
  Close as CloseIcon,
  Settings as SettingsIcon,
  AutoAwesome as AutoAwesomeIcon,
  FourK as FourDIcon
} from '@mui/icons-material';
import styles from './Chat.module.css';

/**
 * Masks a mobile number for display, showing only first 2 and last 2 digits
 * @param {string} mobile - The mobile number to mask
 * @returns {string} - The masked mobile number
 */
const maskMobileNumber = (mobile) => {
  if (!mobile) return "Unknown";
  
  // Ensure mobile is a string
  const mobileStr = String(mobile);
  
  // Handle different length mobile numbers
  if (mobileStr.length <= 4) {
    return mobileStr; // Too short to mask meaningfully
  } else if (mobileStr.length <= 6) {
    // For shorter numbers, show first and last digit
    return `${mobileStr.substring(0, 1)}XXXX${mobileStr.substring(mobileStr.length - 1)}`;
  } else if (mobileStr.length <= 8) {
    // For medium length, show first and last 2 digits
    return `${mobileStr.substring(0, 2)}XXXX${mobileStr.substring(mobileStr.length - 2)}`;
  } else {
    // For standard 10-digit numbers, show first 2 and last 2 digits
    return `${mobileStr.substring(0, 2)}XXXXXX${mobileStr.substring(mobileStr.length - 2)}`;
  }
};

const Chat = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { isConnected, insights, userData } = useSelector(state => state.fiConnect);
  
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [proactiveInsights, setProactiveInsights] = useState([]);
  const [financialSummary, setFinancialSummary] = useState(null);
  const [showInsights, setShowInsights] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showFiLoginModal, setShowFiLoginModal] = useState(false);
  const [showInlineFiLogin, setShowInlineFiLogin] = useState(false);
  const [inlineFiContext, setInlineFiContext] = useState('general');
  
  // 🎤 Voice Interface State
  const [showVoiceInterface, setShowVoiceInterface] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState('en-US');
  
  // 🌌 4D Experience State
  const [fourDEnabled, setFourDEnabled] = useState(true);
  const [lastProcessedMessage, setLastProcessedMessage] = useState(null);
  const [fourDExperienceResult, setFourDExperienceResult] = useState(null);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load personalized financial data after Fi login
  const loadPersonalizedData = async () => {
    try {
      console.log('Loading personalized financial data after Fi login...');
      
      // Load personalized insights from Fi-MCP with detailed logging
      console.log('Fetching personalized insights...');
      const insightsResponse = await chatAPI.getProactiveInsights(true);
      
      if (insightsResponse.success) {
        const insightsData = insightsResponse.data.insights || [];
        console.log('Received insights data:', insightsData);
        
        if (insightsData.length > 0) {
          setProactiveInsights(insightsData);
          
          // Update Redux state with insights
          dispatch(setInsights(insightsData));
          console.log('Updated insights state with', insightsData.length, 'insights');
        } else {
          console.warn('No insights data received from API');
        }
      } else {
        console.error('Failed to fetch insights:', insightsResponse.error);
      }
      
      // Load financial summary
      console.log('Fetching financial summary...');
      const summaryResponse = await chatAPI.getFinancialSummary(true);
      
      if (summaryResponse.success) {
        console.log('Received financial summary:', summaryResponse.data);
        setFinancialSummary(summaryResponse.data);
      } else {
        console.error('Failed to fetch financial summary:', summaryResponse.error);
      }
    } catch (error) {
      console.warn('Failed to load personalized data:', error);
    }
  };

  // Load proactive insights and financial summary on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load insights based on connection state
        const insightsResponse = await chatAPI.getProactiveInsights(isConnected);
        if (insightsResponse.success) {
          setProactiveInsights(insightsResponse.data.insights || []);
          
          // Update Redux state with insights if connected
          if (isConnected) {
            dispatch(setInsights(insightsResponse.data.insights || []));
          }
        }

        // Load financial summary based on connection state
        const summaryResponse = await chatAPI.getFinancialSummary(isConnected);
        if (summaryResponse.success) {
          setFinancialSummary(summaryResponse.data);
        }
      } catch (error) {
        console.warn('Failed to load initial data:', error);
      }
    };

    if (user) {
      loadInitialData();
    }
  }, [user, isConnected, dispatch]);

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    // Ensure consistent user ID (same logic as Fi Login Modal)
    const userId = user?.uid || 'default_user';

    // Check if this is a personal financial query that needs Fi connection
    const personalQueries = [
      'net worth', 'portfolio', 'my investment', 'my account', 'my balance', 
      'my spending', 'my income', 'my debt', 'my credit', 'my sip', 'my mutual fund'
    ];
    
    const isPersonalQuery = personalQueries.some(query => 
      messageText.toLowerCase().includes(query)
    );

    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date().toISOString(),
      user: {
        name: user?.displayName || user?.email?.split('@')[0] || 'You',
        avatar: user?.photoURL
      }
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      console.log('Sending chat message - User ID:', userId, 'Message:', messageText);
      const response = await chatAPI.sendMessage(userId, messageText, conversationId);
      
      if (response.success) {
        // Set conversation ID for context
        if (response.data.conversation_id && !conversationId) {
          setConversationId(response.data.conversation_id);
        }

        // Check if response indicates Fi connection needed
        const needsFiConnection = response.data.requires_fi_auth || 
                               (isPersonalQuery && !isConnected);

        // Simulate typing delay for better UX
        setTimeout(() => {
          const aiMessage = {
            id: Date.now() + 1,
            text: response.data.message,
            sender: 'ai',
            timestamp: new Date().toISOString(),
            suggestions: response.data.suggestions || [],
            insights: response.data.insights || [],
            actionItems: response.data.action_items || [],
            confidence: response.data.confidence || 0.8,
            queryId: response.data.query_id,
            requires_fi_auth: response.data.requires_fi_auth || false
          };
          
          setMessages(prev => [...prev, aiMessage]);
          
          // Track last processed message for 4D experience
          setLastProcessedMessage({
            text: messageText,
            response: aiMessage,
            timestamp: new Date().toISOString()
          });
          
          // Show Fi login prompt if needed for personal queries
          if (needsFiConnection && !isConnected) {
            setTimeout(() => {
              const fiPromptMessage = {
                id: Date.now() + 2,
                text: "🔗 **Connect Fi Money for Personalized Answer**\n\nTo give you specific insights about your financial situation, I need access to your Fi Money account data.",
                sender: 'system',
                timestamp: new Date().toISOString(),
                fiPrompt: true,
                queryType: getQueryType(messageText)
              };
              
              setMessages(prev => [...prev, fiPromptMessage]);
              setInlineFiContext(getQueryType(messageText));
              setShowInlineFiLogin(true);
            }, 1000);
          }
          
          setIsLoading(false);
        }, 500);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      setError(error.message);
      setIsLoading(false);
      
      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        text: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        sender: 'system',
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const getQueryType = (messageText) => {
    const text = messageText.toLowerCase();
    
    if (text.includes('portfolio') || text.includes('investment') || text.includes('mutual fund') || text.includes('stock')) {
      return 'investment';
    } else if (text.includes('spend') || text.includes('expense') || text.includes('budget')) {
      return 'spending';
    } else if (text.includes('net worth') || text.includes('assets') || text.includes('liabilities')) {
      return 'networth';
    } else if (text.includes('goal') || text.includes('plan') || text.includes('future')) {
      return 'planning';
    }
    
    return 'general';
  };

  // 🎤 Voice Interface Handlers
  const handleVoiceMessage = async (voiceData) => {
    console.log('🎤 Voice message received:', voiceData);
    
    const { message, metadata } = voiceData;
    
    if (!message.trim()) return;
    
    // Add voice metadata to the message for enhanced processing
    const enhancedMessage = {
      text: message,
      voiceMetadata: {
        confidence: metadata.confidence,
        language: metadata.language,
        emotion: metadata.emotion,
        financialContext: metadata.financialContext,
        biometric: metadata.biometric
      }
    };
    
    // Send the voice message through the regular chat flow
    await handleSendMessage(message);
    
    // If auto-speak is enabled, speak the response when it arrives
    if (autoSpeak && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === 'assistant') {
        await speakMessage(lastMessage.text);
      }
    }
  };

  const handleVoiceError = (error) => {
    console.error('🚨 Voice error:', error);
    setError(`Voice error: ${error.message}`);
  };

  const speakMessage = async (text) => {
    // This will be handled by the AdvancedVoiceInterface component
    // We can trigger it through a ref or callback
    console.log('🔊 Speaking message:', text);
  };

  const toggleVoiceInterface = () => {
    setShowVoiceInterface(!showVoiceInterface);
  };

  const handleVoiceSettings = (setting, value) => {
    switch (setting) {
      case 'autoSpeak':
        setAutoSpeak(value);
        break;
      case 'language':
        setVoiceLanguage(value);
        break;
      case 'enabled':
        setVoiceEnabled(value);
        break;
      default:
        break;
    }
  };

  // 🌌 4D Experience Handlers
  const handle4DExperienceComplete = (result) => {
    console.log('🌌 4D Experience completed:', result);
    setFourDExperienceResult(result);
    
    // Add 4D experience result as a special message
    if (result && result.insights) {
      const fourDMessage = {
        id: Date.now(),
        text: `🌌 4D Experience Insights: ${result.summary}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        is4DResult: true,
        fourDData: result
      };
      
      setMessages(prev => [...prev, fourDMessage]);
    }
  };

  const toggle4DExperience = () => {
    setFourDEnabled(!fourDEnabled);
  };

  const handleFiConnect = async () => {
    try {
      console.log('Starting Fi login process...');
      
      // Use the fiLoginPopup service to handle the login flow
      const loginData = await fiLoginPopup.openLoginPopup();
      
      console.log('Fi login successful:', loginData);
      
      // Update Fi connection state in Redux
      dispatch(setConnected({
        mobile: loginData.mobile,
        sessionId: loginData.sessionId,
        loginTime: loginData.loginTime,
        scenario: loginData.scenario,
        token: loginData.token
      }));

      // Load personalized data with a slight delay to ensure token is stored
      setTimeout(async () => {
        console.log('Loading personalized data after Fi connection...');
        await loadPersonalizedData();
      }, 500);

      // Show success message
      const successMessage = {
        id: Date.now(),
        text: `🎉 **Fi Money Connected Successfully!**\n\nYour account (${maskMobileNumber(loginData.mobile)}) is now connected. I can now provide personalized financial insights!`,
        sender: 'system',
        timestamp: new Date().toISOString(),
        actionButtons: [
          {
            text: "💡 View Personal Insights",
            action: "view_insights",
            style: "primary"
          }
        ]
      };
      
      setMessages(prev => [...prev, successMessage]);

    } catch (error) {
      console.error('Fi login error:', error);
      
      if (error.message.includes('blocked')) {
        // Popup was blocked, show modal as fallback
        setShowFiLoginModal(true);
      } else if (error.message.includes('cancelled')) {
        // User cancelled, no need to show error
        console.log('User cancelled Fi login');
      } else {
        // Other errors
        const errorMessage = {
          id: Date.now(),
          text: `❌ **Fi Money Connection Failed**\n\n${error.message}\n\nPlease try again or contact support if the issue persists.`,
          sender: 'system',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
  };

  const handleInlineFiConnect = (action) => {
    if (action === 'fi-money') {
      handleFiConnect();
    }
    
    setShowInlineFiLogin(false);
  };

  const handleActionButton = (action) => {
    switch (action) {
      case 'view_insights':
        setShowInsights(true);
        break;
      case 'connect_fi':
        handleFiConnect();
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const getInsightDescription = (title) => {
    if (title && title.includes('Spending')) {
      return 'Analysis of your recent spending patterns and recommendations.';
    } else if (title && title.includes('Investment')) {
      return 'Insights about your investment portfolio performance.';
    } else if (title && title.includes('Tax')) {
      return 'Tax saving opportunities based on your financial profile.';
    } else if (title && title.includes('Home Purchase')) {
      return 'Tracking your progress towards your home purchase goal.';
    }
    
    return 'Personalized financial insight based on your connected data.';
  };

  const toggleInsights = async () => {
    setShowInsights(!showInsights);
    
    if (!showInsights) {
      // Refresh insights when opening the panel
      try {
        const insightsResponse = await chatAPI.getProactiveInsights(isConnected);
        if (insightsResponse.success) {
          setProactiveInsights(insightsResponse.data.insights || []);
        }
      } catch (error) {
        console.warn('Failed to refresh general insights:', error);
      }
      
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <div className={styles.headerContent}>
          <div className={styles.navSection}>
            <Link to="/dashboard" className={styles.backButton}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Dashboard
            </Link>
          </div>
          <div className={styles.titleSection}>
            <h1>AI Financial Assistant</h1>
            <p>Powered by Vertex AI • Ask me anything about your finances</p>
            {financialSummary && (
              <div className={styles.quickStats}>
                <span>Net Worth: ₹{(financialSummary.net_worth / 100000).toFixed(1)}L</span>
                <span>•</span>
                <span>Savings Rate: {(financialSummary.savings_rate * 100).toFixed(0)}%</span>
              </div>
            )}
          </div>
          <div className={styles.headerActions}>
            <button 
              className={`${styles.syncButton} ${isConnected ? styles.connected : ''}`}
              onClick={() => setShowFiLoginModal(true)}
              disabled={isLoading || isConnected}
              title={isConnected ? "Fi Money connected" : "Connect Fi Money account for personalized insights"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                {isConnected ? (
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                ) : (
                  <>
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </>
                )}
              </svg>
              {isConnected ? '✅ Fi Connected' : '🔗 Connect to Fi'}
            </button>
            <button 
              className={styles.insightsButton}
              onClick={toggleInsights}
              title={isConnected ? "View personalized insights" : (proactiveInsights.length === 0 ? "Connect Fi Money for personalized insights" : "View AI insights")}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 11H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2zM19 11h-4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2zM12 2L9 9h6l-3-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isConnected 
                ? `💡 Personal Insights (${proactiveInsights.length})` 
                : (proactiveInsights.length === 0 ? "🔗 Get Insights" : `Insights (${proactiveInsights.length})`)
              }
            </button>
            <button 
              className={styles.clearButton}
              onClick={() => setMessages([])}
              disabled={messages.length === 0}
              aria-label="Clear chat history"
            >
              Clear Chat
            </button>
          </div>
        </div>
      </div>

      {/* Insights Panel Backdrop */}
      {showInsights && proactiveInsights.length > 0 && (
        <div 
          className={styles.insightsPanelBackdrop}
          onClick={toggleInsights}
        />
      )}

      {/* Proactive Insights Panel */}
      {showInsights && (
        <div className={styles.insightsPanel}>
          <div className={styles.insightsPanelHeader}>
            <h3>AI Financial Insights</h3>
            <button onClick={toggleInsights} className={styles.closeInsights}>×</button>
          </div>
          <div className={styles.insightsList}>
            {isConnected ? (
              // When Fi is connected
              <>
                <div className={styles.connectionStatus}>
                  <span className={styles.statusText}>✅ Fi Money Connected</span>
                  <button 
                    className={styles.refreshButton}
                    onClick={loadPersonalizedData}
                  >
                    🔄 Refresh
                  </button>
                </div>
                
                {proactiveInsights.length > 0 ? (
                  proactiveInsights.map((insight, index) => (
                    <div key={index} className={styles.insightCard}>
                      <div className={styles.insightHeader}>
                        <h4>{insight.title || 'Financial Insight'}</h4>
                        {insight.priority && (
                          <span className={`${styles.priorityBadge} ${styles[`priority${insight.priority.charAt(0).toUpperCase() + insight.priority.slice(1)}`]}`}>
                            {insight.priority.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p>{insight.description || insight.message || insight.details || 'No description available'}</p>
                      
                      {/* Display recommended actions if available */}
                      {insight.recommended_actions && insight.recommended_actions.length > 0 && (
                        <div className={styles.insightActions}>
                          <strong>Recommended Actions:</strong>
                          <ul>
                            {insight.recommended_actions.map((action, i) => (
                              <li key={i}>{action}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Display impact if available */}
                      {insight.impact && (
                        <div className={styles.insightImpact}>
                          <strong>Impact:</strong> {insight.impact}
                        </div>
                      )}
                      
                      {/* Display action if available */}
                      {insight.action && (
                        <div className={styles.insightAction}>
                          <strong>Action:</strong> {insight.action}
                        </div>
                      )}
                      
                      <div className={styles.insightMeta}>
                        <span className={styles.insightType}>
                          {insight.type || insight.category || 'Financial Insight'}
                        </span>
                        <span className={styles.insightDate}>
                          {new Date().toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.noInsights}>
                    <p>No insights available yet. Check back later.</p>
                  </div>
                )}
              </>
            ) : (
              // When Fi is not connected
              <>
                <div className={styles.connectPrompt}>
                  <h4>Connect Fi Money for Personalized Insights</h4>
                  <p>Connect your Fi Money account to get AI-powered insights based on your actual financial data.</p>
                  <button 
                    className={styles.connectButton}
                    onClick={handleFiConnect}
                  >
                    🔗 Connect Fi Money
                  </button>
                </div>
                
                {proactiveInsights.length > 0 && (
                  <>
                    <div className={styles.divider}>
                      <span>General Insights</span>
                    </div>
                    
                    {proactiveInsights.map((insight, index) => (
                      <div key={index} className={styles.insightCard}>
                        <div className={styles.insightHeader}>
                          <h4>{insight.title}</h4>
                        </div>
                        <p>{insight.description}</p>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className={styles.chatMessages}>
        {messages.length === 0 ? (
          <div className={styles.welcomeMessage}>
            <h2>🤖 Welcome to your AI Financial Assistant!</h2>
            <p>I'm powered by Google's Vertex AI. {!isConnected && "Connect your Fi Money account for personalized financial insights!"}</p>
            
            <div className={styles.capabilities}>
              <p>I can help you with:</p>
              <ul>
                <li>📊 Portfolio performance analysis</li>
                <li>💰 Expense tracking and optimization</li>
                <li>🎯 Investment recommendations</li>
                <li>📈 Financial goal planning</li>
                <li>🏠 Loan affordability analysis</li>
                <li>💡 Proactive financial insights</li>
              </ul>
            </div>
            
            <div className={styles.suggestions}>
              <p>Try asking:</p>
              <div className={styles.suggestionButtons}>
                {!isConnected && (
                  <button 
                    className={`${styles.suggestionButton} ${styles.connectButton}`}
                    onClick={handleFiConnect}
                  >
                    🔗 Connect Fi Money Account
                  </button>
                )}
                <button 
                  className={styles.suggestionButton}
                  onClick={() => handleSendMessage("How is my portfolio performing?")}
                >
                  How is my portfolio performing?
                </button>
                <button 
                  className={styles.suggestionButton}
                  onClick={() => handleSendMessage("What are mutual funds?")}
                >
                  What are mutual funds?
                </button>
                <button 
                  className={styles.suggestionButton}
                  onClick={() => handleSendMessage("Can I afford a ₹50L home loan?")}
                >
                  Can I afford a ₹50L home loan?
                </button>
                <button 
                  className={styles.suggestionButton}
                  onClick={() => handleSendMessage("What should be my next financial goal?")}
                >
                  What should be my next financial goal?
                </button>
              </div>
            </div>
            
            {proactiveInsights.length > 0 && (
              <p className={styles.insightsNote}>
                💡 I've found {proactiveInsights.length} insights about your finances. Click "Insights" above to view them!
              </p>
            )}
          </div>
        ) : (
          messages.map((message, index) => (
            <React.Fragment key={message.id || index}>
              <ChatMessage 
                message={message}
                onSuggestionClick={handleSuggestionClick}
                onActionButtonClick={handleActionButton}
              />
              
              {/* Show inline Fi login after system prompts */}
              {message.fiPrompt && showInlineFiLogin && (
                <InlineFiLogin 
                  onConnect={handleInlineFiConnect}
                  queryType={message.queryType || 'general'}
                />
              )}
            </React.Fragment>
          ))
        )}
        
        {isLoading && (
          <div className={styles.typingIndicator}>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading}
        disabled={isLoading}
      />

      {/* Fi Login Modal */}
      <FiLoginModal
        open={showFiLoginModal}
        onClose={() => setShowFiLoginModal(false)}
        onSuccess={(result) => {
          setShowFiLoginModal(false);
          dispatch(setConnected({
            mobile: result.mobile,
            sessionId: result.sessionId,
            loginTime: result.loginTime,
            scenario: result.scenario
          }));
          loadPersonalizedData();
        }}
      />

      {/* Connect Account Modal */}
      <ConnectAccountModal
        open={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConnect={(provider) => {
          setShowConnectModal(false);
          if (provider === 'fi-money') {
            setShowFiLoginModal(true);
          }
        }}
      />

      {/* 🚀 MASTER VOICE INTEGRATION - Most Advanced Voice Assistant */}
      {voiceEnabled && (
        <>
          {/* Floating Master Voice Button */}
          <Fab
            color="primary"
            aria-label="master voice assistant"
            onClick={toggleVoiceInterface}
            sx={{
              position: 'fixed',
              bottom: 100,
              right: 24,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                transform: 'scale(1.1)',
              },
              boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
              zIndex: 1000,
              animation: 'masterPulse 3s ease-in-out infinite',
              '@keyframes masterPulse': {
                '0%': { 
                  boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)' 
                },
                '50%': { 
                  boxShadow: '0 16px 50px rgba(102, 126, 234, 0.6)' 
                },
                '100%': { 
                  boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)' 
                }
              }
            }}
          >
            <Tooltip title="🚀 Master AI Voice Assistant - Most Advanced Financial Voice Interface">
              <Badge badgeContent="AI" color="secondary">
                <AutoAwesomeIcon />
              </Badge>
            </Tooltip>
          </Fab>

          {/* Master Voice Interface Panel */}
          <Collapse in={showVoiceInterface}>
            <Box
              sx={{
                position: 'fixed',
                bottom: 180,
                right: 24,
                width: 420,
                maxWidth: 'calc(100vw - 48px)',
                zIndex: 1001
              }}
            >
              <Paper
                elevation={12}
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  border: '2px solid rgba(102, 126, 234, 0.2)'
                }}
              >
                {/* Master Voice Panel Header */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}
                >
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesomeIcon />
                    Master AI Voice Assistant
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title="🚀 Most Advanced Voice Features">
                      <IconButton size="small" sx={{ color: 'white' }}>
                        <SettingsIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Close Master Voice Panel">
                      <IconButton 
                        size="small" 
                        onClick={toggleVoiceInterface}
                        sx={{ color: 'white' }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Advanced Voice Settings */}
                <Box sx={{ p: 2, borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    🚀 Advanced AI Features Enabled:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={autoSpeak}
                          onChange={(e) => handleVoiceSettings('autoSpeak', e.target.checked)}
                          size="small"
                        />
                      }
                      label="🔊 Auto-speak AI responses"
                      sx={{ fontSize: '0.875rem' }}
                    />
                    <Typography variant="caption" color="primary">
                      ✨ Real-time market insights • 🧠 Emotional financial coaching • 🎯 Predictive commands
                    </Typography>
                  </Box>
                </Box>

                {/* Master Voice Integration Component */}
                <MasterVoiceIntegration
                  onVoiceMessage={handleVoiceMessage}
                  onVoiceError={handleVoiceError}
                  userContext={{
                    userId: user?.uid,
                    isConnected,
                    userData,
                    financialProfile: userData
                  }}
                  disabled={isLoading}
                />
              </Paper>
            </Box>
          </Collapse>
        </>
      )}

      {/* 🌌 4D FINANCIAL EXPERIENCE INTEGRATION */}
      {fourDEnabled && (
        <FourDimensionalChatIntegration
          lastMessage={lastProcessedMessage}
          fiMcpData={userData}
          isVisible={true}
          onExperienceComplete={handle4DExperienceComplete}
        />
      )}
    </div>
  );
};

export default Chat;
