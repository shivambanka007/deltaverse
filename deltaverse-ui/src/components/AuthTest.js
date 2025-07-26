import React, { useState, useEffect } from 'react';
import { auth } from '../services/firebase/config';
import { authenticatedApi, publicApi, apiUtils } from '../services/api/authenticatedApi';
import { onAuthStateChanged } from 'firebase/auth';

const AuthTest = () => {
  const [user, setUser] = useState(null);
  const [apiHealth, setApiHealth] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      console.log('🔐 Auth state changed:', currentUser ? 'Authenticated' : 'Not authenticated');
    });

    // Check API health on component mount
    checkApiHealth();

    return () => unsubscribe();
  }, []);

  const checkApiHealth = async () => {
    setLoading(true);
    try {
      const health = await apiUtils.checkApiHealth();
      setApiHealth(health);
      console.log('🏥 API Health Check:', health);
    } catch (error) {
      console.error('❌ Health check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const testPublicEndpoints = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test health endpoint
      console.log('🌐 Testing public endpoints...');
      const health = await publicApi.getHealth();
      results.health = health;

      // Test Fi scenarios
      const scenarios = await publicApi.getFiScenarios();
      results.scenarios = scenarios;

      setTestResults(prev => ({ ...prev, public: results }));
      console.log('✅ Public endpoints test completed:', results);
    } catch (error) {
      console.error('❌ Public endpoints test failed:', error);
      results.error = error.message;
      setTestResults(prev => ({ ...prev, public: results }));
    } finally {
      setLoading(false);
    }
  };

  const testAuthenticatedEndpoints = async () => {
    if (!user) {
      alert('Please sign in first to test authenticated endpoints');
      return;
    }

    setLoading(true);
    const results = {};

    try {
      console.log('🔐 Testing authenticated endpoints...');

      // Test chat insights
      const insights = await authenticatedApi.getChatInsights();
      results.insights = insights;

      // Test chat message
      const chatResponse = await authenticatedApi.sendChatMessage(
        'What is my net worth?',
        'auth-test-conversation'
      );
      results.chat = chatResponse;

      // Test Fi login initiation
      const fiLogin = await authenticatedApi.initiateFiLogin('8888888888');
      results.fiLogin = fiLogin;

      setTestResults(prev => ({ ...prev, authenticated: results }));
      console.log('✅ Authenticated endpoints test completed:', results);
    } catch (error) {
      console.error('❌ Authenticated endpoints test failed:', error);
      results.error = error.message;
      setTestResults(prev => ({ ...prev, authenticated: results }));
    } finally {
      setLoading(false);
    }
  };

  const testFiMcpFlow = async () => {
    if (!user) {
      alert('Please sign in first to test Fi-MCP flow');
      return;
    }

    setLoading(true);
    try {
      console.log('💰 Testing complete Fi-MCP flow...');

      // Step 1: Initiate Fi login
      const loginResult = await authenticatedApi.initiateFiLogin('8888888888');
      
      if (loginResult.success) {
        const { session_id, login_url } = loginResult.data;
        console.log('✅ Fi login initiated:', { session_id, login_url });

        // Step 2: Open popup (user would authenticate here)
        const popup = window.open(
          login_url,
          'fi-login',
          'width=500,height=700,scrollbars=yes,resizable=yes'
        );

        // Step 3: Simulate completion (in real flow, this would happen after popup closes)
        setTimeout(async () => {
          try {
            const completeResult = await authenticatedApi.completeFiLogin(
              session_id,
              '8888888888'
            );
            
            setTestResults(prev => ({
              ...prev,
              fiMcp: {
                initiate: loginResult,
                complete: completeResult,
              }
            }));

            console.log('✅ Fi-MCP flow test completed:', completeResult);
            
            if (popup && !popup.closed) {
              popup.close();
            }
          } catch (error) {
            console.error('❌ Fi-MCP completion failed:', error);
          }
        }, 3000);

      } else {
        console.error('❌ Fi login initiation failed:', loginResult);
        setTestResults(prev => ({
          ...prev,
          fiMcp: { error: loginResult.error }
        }));
      }
    } catch (error) {
      console.error('❌ Fi-MCP flow test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>🔐 Firebase Authentication Test</h2>
      
      {/* Authentication Status */}
      <div style={{ 
        padding: '15px', 
        marginBottom: '20px', 
        backgroundColor: user ? '#d4edda' : '#f8d7da',
        border: `1px solid ${user ? '#c3e6cb' : '#f5c6cb'}`,
        borderRadius: '5px'
      }}>
        <h3>Authentication Status</h3>
        {user ? (
          <div>
            ✅ <strong>Authenticated</strong>
            <br />
            User: {user.email || user.uid}
            <br />
            UID: {user.uid}
          </div>
        ) : (
          <div>
            ❌ <strong>Not Authenticated</strong>
            <br />
            Please sign in to test authenticated endpoints
          </div>
        )}
      </div>

      {/* API Health Status */}
      <div style={{ 
        padding: '15px', 
        marginBottom: '20px', 
        backgroundColor: '#e2e3e5',
        border: '1px solid #d6d8db',
        borderRadius: '5px'
      }}>
        <h3>API Health Status</h3>
        {apiHealth ? (
          <div>
            <div>Status: <strong>{apiHealth.data?.status || 'Unknown'}</strong></div>
            <div>Backend Mode: <strong>{apiHealth.data?.security_level || 'Unknown'}</strong></div>
            <div>Authentication: <strong>{apiHealth.data?.authentication || 'Unknown'}</strong></div>
            <div>User Authenticated: <strong>{apiHealth.user_authenticated ? 'Yes' : 'No'}</strong></div>
          </div>
        ) : (
          <div>Loading...</div>
        )}
        <button 
          onClick={checkApiHealth} 
          disabled={loading}
          style={{ marginTop: '10px', padding: '5px 10px' }}
        >
          Refresh Health Check
        </button>
      </div>

      {/* Test Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <h3>API Tests</h3>
        <button 
          onClick={testPublicEndpoints}
          disabled={loading}
          style={{ 
            padding: '10px 15px', 
            marginRight: '10px', 
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Public Endpoints
        </button>
        
        <button 
          onClick={testAuthenticatedEndpoints}
          disabled={loading || !user}
          style={{ 
            padding: '10px 15px', 
            marginRight: '10px', 
            backgroundColor: user ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: user ? 'pointer' : 'not-allowed'
          }}
        >
          Test Authenticated Endpoints
        </button>

        <button 
          onClick={testFiMcpFlow}
          disabled={loading || !user}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: user ? '#ffc107' : '#6c757d',
            color: user ? 'black' : 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: user ? 'pointer' : 'not-allowed'
          }}
        >
          Test Fi-MCP Flow
        </button>
      </div>

      {/* Test Results */}
      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '5px'
      }}>
        <h3>Test Results</h3>
        <pre style={{ 
          backgroundColor: '#e9ecef', 
          padding: '10px', 
          borderRadius: '3px',
          overflow: 'auto',
          maxHeight: '400px',
          fontSize: '12px'
        }}>
          {JSON.stringify(testResults, null, 2)}
        </pre>
      </div>

      {loading && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '20px',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: 'white',
          borderRadius: '5px'
        }}>
          Testing API endpoints...
        </div>
      )}
    </div>
  );
};

export default AuthTest;
