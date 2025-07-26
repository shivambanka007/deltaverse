import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Date.now() // Unique error ID
    };
  }

  componentDidCatch(error, errorInfo) {
    // Handle different types of errors
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Handle timeout errors specifically
    if (error.message?.includes('Timeout') || error.message?.includes('timeout')) {
      // Timeout error - try to recover
      setTimeout(() => {
        this.setState({ hasError: false, error: null, errorInfo: null });
      }, 2000);
    }

    // Handle network errors
    if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      // Network error - show retry option
    }

    // Silent error handling in production
    if (process.env.NODE_ENV === 'development') {
      // Only log in development mode
    }
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    });
  };

  render() {
    if (this.state.hasError) {
      const isTimeoutError = this.state.error?.message?.includes('Timeout') || 
                            this.state.error?.message?.includes('timeout');
      const isNetworkError = this.state.error?.message?.includes('Network') || 
                            this.state.error?.message?.includes('fetch');

      // Auto-retry for timeout errors
      if (isTimeoutError) {
        return (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#f9fafb',
            }}
          >
            <div
              style={{
                maxWidth: '500px',
                padding: '2rem',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    border: '4px solid #f3f4f6',
                    borderTop: '4px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto',
                  }}
                ></div>
              </div>
              <h2 style={{ color: '#3b82f6', marginBottom: '1rem' }}>
                Connection Timeout
              </h2>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                The request is taking longer than expected. We're automatically retrying...
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={this.handleRetry}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  Retry Now
                </button>
                <button
                  onClick={this.handleGoHome}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  Go Home
                </button>
              </div>
            </div>
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        );
      }

      // General error fallback
      return (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f9fafb',
          }}
        >
          <div
            style={{
              maxWidth: '500px',
              padding: '2rem',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>
              {isNetworkError ? 'Connection Error' : 'Something went wrong'}
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              {isNetworkError 
                ? 'Unable to connect to the server. Please check your internet connection.'
                : 'We\'re sorry, but something unexpected happened. Please try refreshing the page.'
              }
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={this.handleRefresh}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Refresh Page
              </button>
              <button
                onClick={this.handleRetry}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Go Home
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details
                style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  backgroundColor: '#fef2f2',
                  borderRadius: '8px',
                  textAlign: 'left',
                }}
              >
                <summary style={{ cursor: 'pointer', fontWeight: '500' }}>
                  Error Details (Development)
                </summary>
                <pre
                  style={{
                    marginTop: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#dc2626',
                    overflow: 'auto',
                  }}
                >
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
