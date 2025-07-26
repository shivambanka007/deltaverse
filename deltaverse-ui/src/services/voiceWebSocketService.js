class VoiceWebSocketService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.connectionTimeout = 10000; // 10 second timeout
    this.fallbackMode = false; // Use local speech recognition as fallback
    this.callbacks = {
      onMessage: null,
      onConnect: null,
      onDisconnect: null,
      onError: null,
      onTranscript: null,
      onConfidence: null,
      onFallback: null // New callback for fallback mode
    };
    
    // WebSocket URLs to try in order
    this.wsUrls = [
      process.env.REACT_APP_WS_URL,
      'wss://deltaverse-api-1029461078184.us-central1.run.app/ws/speech',
      'ws://localhost:8000/ws/speech', // Local development fallback
    ].filter(Boolean); // Remove null/undefined values
    
    this.currentUrlIndex = 0;
  }

  connect(apiUrl = null) {
    return new Promise((resolve, reject) => {
      try {
        // Use provided URL or try URLs in order
        const wsUrl = apiUrl || this.wsUrls[this.currentUrlIndex];
        
        if (!wsUrl) {
          console.warn('⚠️ No WebSocket URL available, switching to fallback mode');
          this.enableFallbackMode();
          resolve({ mode: 'fallback', message: 'Using local speech recognition' });
          return;
        }
        
        console.log(`🔌 Attempting WebSocket connection to: ${wsUrl} (attempt ${this.reconnectAttempts + 1})`);
        
        // Set connection timeout
        const connectionTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
            console.error('⏱️ WebSocket connection timeout');
            this.ws.close();
            this.tryNextUrl(resolve, reject);
          }
        }, this.connectionTimeout);
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('✅ WebSocket connected successfully');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.currentUrlIndex = 0; // Reset to first URL for future connections
          this.fallbackMode = false;
          
          if (this.callbacks.onConnect) {
            this.callbacks.onConnect();
          }
          
          resolve({ mode: 'websocket', url: wsUrl });
        };
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);
            
            // Handle different message types
            switch (data.type) {
              case 'transcript':
                if (this.callbacks.onTranscript) {
                  this.callbacks.onTranscript(data.text, data.confidence);
                }
                break;
                
              case 'confidence':
                if (this.callbacks.onConfidence) {
                  this.callbacks.onConfidence(data.confidence);
                }
                break;
                
              case 'status':
                console.log('Voice recognition status:', data.status);
                break;
                
              case 'error':
                console.error('Voice recognition error:', data.message);
                if (this.callbacks.onError) {
                  this.callbacks.onError(data.message);
                }
                break;
                
              default:
                if (this.callbacks.onMessage) {
                  this.callbacks.onMessage(data);
                }
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnected = false;
          
          if (this.callbacks.onDisconnect) {
            this.callbacks.onDisconnect(event);
          }
          
          // Attempt to reconnect if not a normal closure
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect();
          }
        };
        
        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error('🚨 WebSocket error:', {
            url: wsUrl,
            readyState: this.ws?.readyState,
            error: error
          });
          
          // Categorize the error
          const errorInfo = this.categorizeWebSocketError(error, wsUrl);
          console.error('📊 Error details:', errorInfo);
          
          // Try next URL or enable fallback
          this.tryNextUrl(resolve, reject, errorInfo);
        };
        
      } catch (error) {
        console.error('🚨 Failed to create WebSocket connection:', error);
        this.tryNextUrl(resolve, reject, { type: 'connection_failed', error });
      }
    });
  }

  /**
   * Try the next WebSocket URL or enable fallback mode
   */
  tryNextUrl(resolve, reject, errorInfo = null) {
    this.currentUrlIndex++;
    
    // If we have more URLs to try
    if (this.currentUrlIndex < this.wsUrls.length) {
      console.log(`🔄 Trying next WebSocket URL (${this.currentUrlIndex + 1}/${this.wsUrls.length})`);
      setTimeout(() => {
        this.connect().then(resolve).catch(reject);
      }, 1000);
    } else {
      // All URLs failed, enable fallback mode
      console.warn('⚠️ All WebSocket URLs failed, enabling fallback mode');
      this.enableFallbackMode();
      
      if (this.callbacks.onError) {
        this.callbacks.onError({
          type: 'websocket_unavailable',
          message: 'WebSocket connection failed, using local speech recognition',
          fallbackEnabled: true,
          lastError: errorInfo
        });
      }
      
      resolve({ 
        mode: 'fallback', 
        message: 'WebSocket unavailable, using local speech recognition',
        lastError: errorInfo 
      });
    }
  }

  /**
   * Categorize WebSocket errors for better debugging
   */
  categorizeWebSocketError(error, url) {
    const wsReadyState = this.ws?.readyState;
    
    let errorType = 'unknown';
    let description = 'Unknown WebSocket error';
    let suggestions = [];
    
    // Analyze based on ready state
    switch (wsReadyState) {
      case WebSocket.CONNECTING:
        errorType = 'connection_timeout';
        description = 'Connection attempt timed out';
        suggestions = ['Check network connectivity', 'Verify server is running', 'Check firewall settings'];
        break;
      case WebSocket.CLOSED:
        errorType = 'connection_refused';
        description = 'Connection was refused or closed immediately';
        suggestions = ['Server may be down', 'Check URL correctness', 'Verify SSL/TLS configuration'];
        break;
      default:
        errorType = 'connection_error';
        description = 'General connection error';
        suggestions = ['Check network connectivity', 'Try again later'];
    }
    
    // Additional analysis based on URL
    if (url.includes('localhost')) {
      suggestions.push('Make sure local development server is running');
    } else if (url.includes('run.app')) {
      suggestions.push('Google Cloud Run service may be unavailable');
    }
    
    return {
      type: errorType,
      description,
      url,
      readyState: wsReadyState,
      suggestions,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Enable fallback mode using local speech recognition
   */
  enableFallbackMode() {
    this.fallbackMode = true;
    console.log('🔄 Fallback mode enabled - using local speech recognition');
    
    if (this.callbacks.onFallback) {
      this.callbacks.onFallback({
        mode: 'local',
        message: 'Using browser\'s built-in speech recognition',
        features: ['Basic speech-to-text', 'No server processing', 'Limited language support']
      });
    }
  }

  /**
   * Check if service is in fallback mode
   */
  isFallbackMode() {
    return this.fallbackMode;
  }

  disconnect() {
    if (this.fallbackMode) {
      console.log('🔄 Disconnecting from fallback mode');
      this.fallbackMode = false;
      return;
    }
    
    if (this.ws && this.isConnected) {
      console.log('🔌 Disconnecting WebSocket');
      this.ws.close(1000, 'User initiated disconnect');
      this.ws = null;
      this.isConnected = false;
    }
  }

  attemptReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
    
    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
          if (this.callbacks.onError) {
            this.callbacks.onError('Failed to reconnect to voice service');
          }
        }
      });
    }, delay);
  }

  send(message) {
    // If in fallback mode, simulate local processing
    if (this.fallbackMode) {
      console.log('🔄 Fallback mode: Simulating message processing locally', message);
      
      // Simulate successful response for certain actions
      if (typeof message === 'object' && message.action) {
        setTimeout(() => {
          switch (message.action) {
            case 'start':
              if (this.callbacks.onMessage) {
                this.callbacks.onMessage({
                  type: 'status',
                  message: 'Listening started (fallback mode)',
                  mode: 'fallback'
                });
              }
              break;
            case 'stop':
              if (this.callbacks.onMessage) {
                this.callbacks.onMessage({
                  type: 'status',
                  message: 'Listening stopped (fallback mode)',
                  mode: 'fallback'
                });
              }
              break;
          }
        }, 100);
      }
      
      return true; // Simulate successful send
    }
    
    // Normal WebSocket sending
    if (this.ws && this.isConnected) {
      try {
        const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
        this.ws.send(messageStr);
        console.log('📤 WebSocket message sent:', message);
        return true;
      } catch (error) {
        console.error('🚨 Failed to send WebSocket message:', error);
        return false;
      }
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message');
      
      // Try to reconnect if not in fallback mode
      if (!this.fallbackMode) {
        console.log('🔄 Attempting to reconnect WebSocket...');
        this.connect().catch(err => {
          console.error('🚨 Reconnection failed:', err);
        });
      }
      
      return false;
    }
  }

  startListening(preferences = {}) {
    return this.send({
      action: 'start',
      preferences: {
        confidenceThreshold: 70,
        maxListeningTime: 60,
        language: 'en-US',
        ...preferences
      }
    });
  }

  stopListening() {
    return this.send({
      action: 'stop'
    });
  }

  pauseListening() {
    return this.send({
      action: 'pause'
    });
  }

  resumeListening() {
    return this.send({
      action: 'resume'
    });
  }

  updateTranscript(transcript) {
    return this.send({
      action: 'update_transcript',
      transcript: transcript
    });
  }

  // Callback setters
  onConnect(callback) {
    this.callbacks.onConnect = callback;
  }

  onDisconnect(callback) {
    this.callbacks.onDisconnect = callback;
  }

  onMessage(callback) {
    this.callbacks.onMessage = callback;
  }

  onError(callback) {
    this.callbacks.onError = callback;
  }

  onTranscript(callback) {
    this.callbacks.onTranscript = callback;
  }

  onConfidence(callback) {
    this.callbacks.onConfidence = callback;
  }

  // Utility methods
  getConnectionState() {
    if (!this.ws) return 'DISCONNECTED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'CONNECTED';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'CLOSED';
      default:
        return 'UNKNOWN';
    }
  }

  isReady() {
    return this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
const voiceWebSocketService = new VoiceWebSocketService();

export default voiceWebSocketService;
