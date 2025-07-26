/**
 * Chat API Service
 * Handles communication with the backend API for chat and insights
 */

import { auth } from '../firebase/config';
import { getApiUrl, debugLog, ENV_CONFIG } from '../../utils/envConfig';

// Get the appropriate API URL based on environment
const API_BASE_URL = getApiUrl();

/**
 * Get Firebase auth token for API requests
 */
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      // Get fresh token
      return await user.getIdToken(true);
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }
  return null;
};

/**
 * Get Fi session token if available
 */
const getFiSessionToken = () => {
  return localStorage.getItem('fi_session_token');
};

/**
 * Generic API request handler for chat with authentication
 */
const chatApiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = await getAuthToken();
  const fiToken = getFiSessionToken();
  
  // Log API requests in development mode
  if (ENV_CONFIG.DEBUG) {
    debugLog(`API Request: ${options.method || 'GET'} ${url}`);
    if (options.body) {
      try {
        debugLog('Request body:', JSON.parse(options.body));
      } catch (e) {
        debugLog('Request body:', options.body);
      }
    }
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(fiToken && { 'X-Fi-Session-Token': fiToken }),
    ...options.headers,
  };

  const config = {
    headers,
    ...options,
    // Ensure we're not using cached responses for important data
    cache: options.cache || (endpoint.includes('/fi/') ? 'no-cache' : 'default')
  };

  try {
    debugLog('Making API request with config:', { url, method: config.method || 'GET', headers: config.headers });
    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (e) {
        // If we can't parse the error response, just use the status
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    // Log API responses in development mode
    if (ENV_CONFIG.DEBUG) {
      debugLog(`API Response: ${endpoint}`, { success: true });
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Chat API Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate insights from Fi data
 * @param {Object} fiData - Fi data object
 * @returns {Array} - Array of insight objects
 */
const generateInsightsFromFiData = (fiData) => {
  console.log('Generating insights from Fi data:', fiData);
  const insights = [];
  
  try {
    // Portfolio Performance Insight
    if (fiData.investments) {
      const portfolioData = fiData.investments;
      const totalValue = portfolioData.totalValue || 0;
      const returns = portfolioData.returns || 0;
      const returnsPercentage = portfolioData.returnsPercentage || 0;
      
      insights.push({
        id: `insight-portfolio-${Date.now()}`,
        type: 'investment',
        title: 'Your Portfolio Performance',
        description: `Your investment portfolio is currently valued at ₹${totalValue.toLocaleString('en-IN')} with overall returns of ₹${returns.toLocaleString('en-IN')} (${returnsPercentage.toFixed(2)}%). ${returnsPercentage > 10 ? 'Your portfolio is performing well above market average.' : returnsPercentage > 0 ? 'Your portfolio is performing in line with market expectations.' : 'Your portfolio needs attention as returns are below expectations.'}`,
        priority: returnsPercentage < 0 ? 'high' : returnsPercentage < 5 ? 'medium' : 'low',
        recommended_actions: [
          'Review your asset allocation',
          'Consider rebalancing your portfolio',
          'Schedule a portfolio review with a financial advisor'
        ],
        action: 'Review your investment portfolio allocation',
        impact: 'Optimize returns and reduce risk through proper diversification'
      });
    }
    
    // Spending Pattern Analysis
    if (fiData.expenses) {
      const expensesData = fiData.expenses;
      const totalExpenses = expensesData.totalExpenses || 0;
      const largestCategory = expensesData.largestCategory || 'general';
      const largestAmount = expensesData.largestAmount || 0;
      const percentageOfTotal = expensesData.percentageOfTotal || 0;
      
      insights.push({
        id: `insight-spending-${Date.now()}`,
        type: 'spending',
        title: 'Spending Pattern Analysis',
        description: `Your total expenses this month are ₹${totalExpenses.toLocaleString('en-IN')}. Your largest spending category is ${largestCategory} at ₹${largestAmount.toLocaleString('en-IN')}, which represents ${percentageOfTotal.toFixed(0)}% of your total expenses. ${percentageOfTotal > 40 ? 'This category might need attention as it represents a significant portion of your spending.' : 'Your spending appears to be well-distributed across categories.'}`,
        priority: percentageOfTotal > 50 ? 'high' : percentageOfTotal > 30 ? 'medium' : 'low',
        recommended_actions: [
          `Review your ${largestCategory} expenses`,
          'Set a budget for each spending category',
          'Track your expenses regularly'
        ],
        action: `Set a budget limit for ${largestCategory} expenses`,
        impact: 'Better control over spending and increased savings potential'
      });
    }
    
    // Home Purchase Goal
    if (fiData.goals && fiData.goals.homePurchase) {
      const goalData = fiData.goals.homePurchase;
      const targetAmount = goalData.targetAmount || 0;
      const currentSavings = goalData.currentSavings || 0;
      const progressPercentage = goalData.progressPercentage || (currentSavings / targetAmount * 100);
      const timeRemaining = goalData.timeRemaining || 0;
      
      insights.push({
        id: `insight-home-${Date.now()}`,
        type: 'goal',
        title: 'Home Purchase Goal',
        description: `You've saved ₹${currentSavings.toLocaleString('en-IN')} towards your home purchase goal of ₹${targetAmount.toLocaleString('en-IN')}. You're ${progressPercentage.toFixed(0)}% of the way there with ${timeRemaining} months remaining. ${progressPercentage < 30 ? 'You may need to increase your monthly contributions to reach your goal on time.' : progressPercentage < 60 ? 'You\'re making good progress towards your goal.' : 'You\'re well on your way to achieving your home purchase goal!'}`,
        priority: progressPercentage < 30 ? 'high' : progressPercentage < 60 ? 'medium' : 'low',
        recommended_actions: [
          'Review your monthly savings rate',
          'Explore higher-yield investment options for your down payment fund',
          'Consider adjusting your timeline or target amount'
        ],
        action: 'Increase monthly contributions to your home fund',
        impact: 'Stay on track to achieve your home purchase goal on time'
      });
    }
    
    // Credit Utilization
    if (fiData.creditScore) {
      const creditData = fiData.creditScore;
      const score = creditData.score || 0;
      const utilization = creditData.utilization || 0;
      
      insights.push({
        id: `insight-credit-${Date.now()}`,
        type: 'credit',
        title: 'Credit Utilization',
        description: `Your credit score is ${score} and your credit utilization is ${utilization.toFixed(0)}%. ${utilization > 30 ? 'Your credit utilization is higher than the recommended 30%, which may be negatively impacting your credit score.' : 'Your credit utilization is within the recommended range, which is good for your credit score.'}`,
        priority: utilization > 50 ? 'high' : utilization > 30 ? 'medium' : 'low',
        recommended_actions: [
          'Pay down high-interest credit card debt',
          'Consider requesting a credit limit increase',
          'Maintain low balances on revolving credit accounts'
        ],
        action: 'Reduce credit utilization to below 30%',
        impact: 'Improve credit score and qualify for better interest rates'
      });
    }
    
    // If we couldn't generate any insights, add a generic one
    if (insights.length === 0) {
      insights.push({
        id: `insight-generic-${Date.now()}`,
        type: 'general',
        title: 'Financial Health Overview',
        description: 'Based on your Fi Money data, we\'ve analyzed your financial health. Connect your accounts to get more personalized insights.',
        priority: 'medium',
        recommended_actions: [
          'Review your monthly budget',
          'Track your expenses regularly',
          'Set clear financial goals'
        ],
        action: 'Create a monthly budget',
        impact: 'Better financial planning and decision making'
      });
    }
    
    return insights;
  } catch (error) {
    console.error('Error generating insights from Fi data:', error);
    
    // Return a generic insight if there was an error
    return [{
      id: `insight-error-${Date.now()}`,
      type: 'general',
      title: 'Financial Data Analysis',
      description: 'We encountered an issue analyzing your financial data. Please try refreshing your data.',
      priority: 'medium',
      recommended_actions: [
        'Refresh your financial data',
        'Ensure all accounts are properly connected',
        'Contact support if the issue persists'
      ],
      action: 'Refresh financial data',
      impact: 'Get accurate and up-to-date financial insights'
    }];
  }
};

/**
 * Generate a mock AI response for development
 */
const generateMockAIResponse = (message) => {
  // Simple keyword-based responses for development
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('portfolio') || lowerMessage.includes('investment')) {
    return {
      message: "Based on your portfolio data, your investments have grown by 12.3% over the past year, outperforming the market average of 8.7%. Your equity allocation is currently at 65%, which aligns well with your risk profile.",
      suggestions: [
        "How can I optimize my portfolio?",
        "Should I increase my SIP amounts?",
        "What's my asset allocation?"
      ]
    };
  } else if (lowerMessage.includes('expense') || lowerMessage.includes('spending')) {
    return {
      message: "Your spending this month is 15% higher than your monthly average. The largest increase was in the 'Dining Out' category, which was ₹4,500 more than usual. Consider setting a budget for this category next month.",
      suggestions: [
        "Where am I spending the most?",
        "How can I reduce my expenses?",
        "Create a budget for me"
      ]
    };
  } else if (lowerMessage.includes('loan') || lowerMessage.includes('home')) {
    return {
      message: "Based on your current income and expenses, you could afford a home loan of approximately ₹50L with a 20-year term. This would result in an EMI of around ₹41,500, which is 32% of your monthly income.",
      suggestions: [
        "What's the best interest rate I can get?",
        "How much down payment should I make?",
        "How does this affect my monthly budget?"
      ]
    };
  } else if (lowerMessage.includes('goal') || lowerMessage.includes('save')) {
    return {
      message: "Based on your current financial situation, I recommend focusing on building an emergency fund of ₹5L (6 months of expenses). You currently have ₹2.3L saved, so you're 46% of the way there. By saving ₹45,000 per month, you can reach this goal in 6 months.",
      suggestions: [
        "What other goals should I prioritize?",
        "How can I save more each month?",
        "Where should I invest my emergency fund?"
      ]
    };
  } else if (lowerMessage.includes('mutual fund') || lowerMessage.includes('sip')) {
    return {
      message: "Mutual funds are investment vehicles that pool money from multiple investors to purchase securities like stocks and bonds. They offer diversification, professional management, and liquidity. SIPs (Systematic Investment Plans) allow you to invest a fixed amount regularly, benefiting from rupee-cost averaging and compounding.",
      suggestions: [
        "Which mutual funds are best for beginners?",
        "How much should I invest in SIPs monthly?",
        "What's the difference between active and passive funds?"
      ]
    };
  } else {
    return {
      message: "I'm your AI financial assistant. I can help you with portfolio analysis, expense tracking, investment recommendations, financial goal planning, and more. What would you like to know about your finances today?",
      suggestions: [
        "How is my portfolio performing?",
        "Where am I spending the most?",
        "What should be my next financial goal?"
      ]
    };
  }
};

// Export the chatAPI object with all methods
export const chatAPI = {
  /**
   * Send a message to the chat API
   * @param {string} userId - User ID
   * @param {string} message - Message text
   * @param {string} conversationId - Optional conversation ID for context
   */
  sendMessage: async (userId, message, conversationId = null) => {
    try {
      debugLog('Sending chat message:', { userId, message, conversationId });
      
      // Try production API first
      const response = await chatApiRequest('/api/v1/chat/message', {
        method: 'POST',
        body: JSON.stringify({
          message,
          conversation_id: conversationId
        }),
      });

      if (response.success) {
        const backendData = response.data;
        
        return {
          success: true,
          data: {
            message: backendData.message, // Backend returns 'message' field
            suggestions: backendData.follow_up_questions || [],
            insights: backendData.insights || [],
            action_items: backendData.action_items || [],
            confidence: backendData.confidence || 0.8,
            query_id: backendData.query_id || backendData.conversation_id,
            conversation_id: backendData.conversation_id
          }
        };
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.warn('Production API failed, using mock response:', error.message);
      
      // Fallback to mock response for development
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockResponse = generateMockAIResponse(message);
          resolve({ success: true, data: mockResponse });
        }, 1000 + Math.random() * 2000);
      });
    }
  },

  /**
   * Get proactive financial insights
   * @param {boolean} tryFiLogin - Whether to try Fi login if primary endpoint fails (default: false)
   */
  getProactiveInsights: async (tryFiLogin = false) => {
    try {
      console.log('Fetching proactive insights from API...');
      
      // Check if we have a Fi session token
      const fiToken = getFiSessionToken();
      const hasFiToken = !!fiToken;
      
      // If we have a Fi token or tryFiLogin is true, try the Fi insights endpoint first
      if (hasFiToken || tryFiLogin) {
        console.log('Using Fi-specific insights endpoint first...');
        const fiResponse = await chatApiRequest('/api/v1/fi/insights', {
          cache: 'no-cache' // Ensure we're not using cached responses
        });
        
        console.log('Fi insights response:', fiResponse);
        
        if (fiResponse.success) {
          // Check for personalizedInsights or insights field
          const rawInsights = fiResponse.data.personalizedInsights || fiResponse.data.insights || [];
          
          if (rawInsights.length > 0) {
            console.log('Successfully fetched insights from Fi endpoint:', rawInsights);
            
            // Ensure each insight has all required fields
            const enhancedInsights = rawInsights.map(insight => ({
              id: insight.id || `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              title: insight.title || 'Financial Insight',
              description: insight.description || insight.message || insight.details || 'No description available',
              priority: insight.priority || 'medium',
              type: insight.type || insight.category || 'general',
              recommended_actions: insight.recommended_actions || insight.actions || [],
              action: insight.action || null,
              impact: insight.impact || null,
              timestamp: insight.timestamp || new Date().toISOString()
            }));
            
            return {
              success: true,
              data: {
                insights: enhancedInsights,
                source: 'fi_api'
              }
            };
          }
        }
      }
      
      // If Fi endpoint failed or returned no insights, try the primary insights endpoint
      console.log('Trying primary insights endpoint...');
      const response = await chatApiRequest('/api/v1/chat/insights');
      
      if (response.success) {
        console.log('Response from primary endpoint:', response.data);
        
        // Check if we have valid insights data
        if (response.data?.insights && response.data.insights.length > 0) {
          console.log('Successfully fetched insights from primary endpoint');
          
          // Ensure each insight has all required fields
          const enhancedInsights = response.data.insights.map(insight => ({
            id: insight.id || `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: insight.title || 'Financial Insight',
            description: insight.description || insight.message || insight.details || 'No description available',
            priority: insight.priority || 'medium',
            type: insight.type || insight.category || 'general',
            recommended_actions: insight.recommended_actions || insight.actions || [],
            action: insight.action || null,
            impact: insight.impact || null,
            timestamp: insight.timestamp || new Date().toISOString()
          }));
          
          return {
            success: true,
            data: {
              insights: enhancedInsights,
              source: 'primary_api'
            }
          };
        }
      }
      
      // If we have a Fi token but both endpoints failed, make one more attempt with the Fi data endpoint
      if (hasFiToken) {
        console.log('Both endpoints failed, trying Fi data endpoint...');
        const fiDataResponse = await chatApiRequest('/api/v1/mcp/fi-data', {
          cache: 'no-cache'
        });
        
        if (fiDataResponse.success && fiDataResponse.data) {
          console.log('Successfully fetched Fi data:', fiDataResponse.data);
          
          // Generate insights from Fi data
          const generatedInsights = generateInsightsFromFiData(fiDataResponse.data);
          
          if (generatedInsights.length > 0) {
            return {
              success: true,
              data: {
                insights: generatedInsights,
                source: 'generated_from_fi_data'
              }
            };
          }
        }
      }
      
      // If we've tried all real API endpoints and still have no insights, throw an error
      throw new Error('No insights data returned from any API endpoint');
    } catch (error) {
      console.warn('All insights API endpoints failed:', error.message);
      
      // Check if we should use mock data
      const useMockData = ENV_CONFIG.IS_DEVELOPMENT || !getFiSessionToken();
      
      if (useMockData) {
        console.log('Using mock insights data for development or when not connected to Fi');
        
        // If user is not connected to Fi, only show general insights
        if (!getFiSessionToken()) {
          const generalInsights = [
            {
              id: 'connect-prompt',
              type: 'connection_required',
              title: 'Connect Your Financial Data',
              description: 'Connect your Fi Money account to get personalized AI-powered insights based on your actual financial data.',
              priority: 'high',
              action_required: true,
              recommended_actions: [
                'Click "Connect to Fi" in the top navigation', 
                'Complete the authentication process',
                'Get personalized financial insights'
              ],
              action: 'Connect your Fi Money account',
              impact: 'Unlock personalized financial recommendations'
            },
            {
              id: 'general-tip',
              type: 'financial_education',
              title: 'Financial Wellness Tip',
              description: 'Creating a budget is the first step toward financial freedom. Track your income and expenses to understand your spending patterns.',
              priority: 'medium',
              action_required: false,
              recommended_actions: [
                'Start with a simple 50/30/20 budget', 
                'Track expenses for at least 30 days',
                'Identify areas where you can reduce spending'
              ],
              action: 'Create a monthly budget',
              impact: 'Better financial awareness and control'
            }
          ];
          
          return { 
            success: true, 
            data: { 
              insights: generalInsights,
              source: 'general_education'
            } 
          };
        }
        
        // Enhanced mock insights with more realistic data for connected users
        const mockInsights = [
          {
            id: 'insight-1',
            type: 'spending_anomaly',
            title: 'Unusual Spending Pattern Detected',
            description: 'Your dining expenses increased by 40% this month compared to your average. Consider reviewing your recent transactions and setting a budget for dining out.',
            priority: 'medium',
            action_required: true,
            recommended_actions: [
              'Review recent dining transactions', 
              'Set a monthly dining budget',
              'Use the 50/30/20 rule for better budget management'
            ],
            action: 'Set a dining budget of ₹5,000 for next month',
            impact: 'Potential savings of ₹3,500 monthly'
          },
          {
            id: 'insight-2',
            type: 'investment_opportunity',
            title: 'SIP Performance Review',
            description: 'Your HDFC Equity Fund SIP has outperformed the market by 3.2% this quarter. This fund has shown consistent performance over the last 3 years with an average return of 12.8% annually.',
            priority: 'low',
            action_required: false,
            recommended_actions: [
              'Consider increasing SIP amount by ₹2,000', 
              'Explore similar performing funds for diversification',
              'Review your asset allocation strategy'
            ],
            action: 'Increase SIP amount from ₹5,000 to ₹7,000',
            impact: 'Potential additional returns of ₹24,000 over 5 years'
          },
          {
            id: 'insight-3',
            type: 'tax_planning',
            title: 'Tax Saving Opportunity',
            description: 'You can save up to ₹46,800 in taxes by maximizing your 80C investments. You have currently utilized only 60% of your ₹1.5L limit under Section 80C.',
            priority: 'high',
            action_required: true,
            recommended_actions: [
              'Invest in ELSS funds for tax benefits with equity exposure', 
              'Maximize PPF contribution for the year',
              'Consider NPS for additional tax benefits under Section 80CCD(1B)'
            ],
            action: 'Invest remaining ₹60,000 in ELSS funds before March 31st',
            impact: 'Tax savings of ₹18,720 for this financial year'
          },
          {
            id: 'insight-4',
            type: 'credit_score',
            title: 'Credit Score Improvement',
            description: 'Your credit score has improved by 25 points since last quarter, now at 780. This puts you in the excellent credit category, making you eligible for better loan rates and higher credit limits.',
            priority: 'low',
            action_required: false,
            recommended_actions: [
              'Continue timely bill payments', 
              'Maintain low credit utilization (below 30%)',
              'Consider requesting a credit limit increase'
            ],
            action: 'Maintain current credit habits',
            impact: 'Potential savings on future loan interest rates'
          }
        ];
        
        return { 
          success: true, 
          data: { 
            insights: mockInsights,
            source: 'mock_data'
          } 
        };
      } else {
        // If we're in production and have a Fi token, we should return the error
        // rather than falling back to mock data
        return { 
          success: false, 
          error: error.message,
          data: { insights: [] }
        };
      }
    }
  },

  /**
   * Get financial summary
   * @param {boolean} tryFiLogin - Whether to try Fi login if primary endpoint fails
   */
  getFinancialSummary: async (tryFiLogin = false) => {
    try {
      debugLog('Fetching financial summary...');
      
      // Try the primary endpoint first
      const response = await chatApiRequest('/api/v1/mcp/summary', {
        params: { include_fi_data: tryFiLogin }
      });
      
      if (response.success && response.data) {
        debugLog('Successfully fetched financial summary');
        return response;
      }
      
      // If primary endpoint fails and tryFiLogin is true, try the Fi endpoint
      if (tryFiLogin) {
        debugLog('Primary endpoint failed, trying Fi endpoint...');
        const fiResponse = await chatApiRequest('/api/v1/fi/summary');
        
        if (fiResponse.success && fiResponse.data) {
          debugLog('Successfully fetched Fi financial summary');
          return fiResponse;
        }
      } else {
        debugLog('Basic summary failed, but not trying Fi endpoint (tryFiLogin=false)');
      }
      
      throw new Error('Failed to fetch financial summary');
    } catch (error) {
      console.warn('Financial summary API failed:', error.message);
      
      // Return mock data for development
      return {
        success: true,
        data: {
          net_worth: 2456800, // In rupees
          total_assets: 3256800,
          total_liabilities: 800000,
          monthly_income: 85000,
          monthly_expenses: 52340,
          savings_rate: 0.38, // 38%
          investment_returns: 0.124, // 12.4%
          credit_score: 780,
          emergency_fund_months: 4.7
        }
      };
    }
  }
};

export default chatAPI;
