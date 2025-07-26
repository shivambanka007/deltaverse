import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Import Fi-MCP API functions for status checking only
import { checkFiMcpStatus } from '../../services/api/financial-health';
import { isProduction } from '../../utils/environment';

// Get Fi-MCP server URL based on environment
const getFiMcpServerUrl = () => {
  if (isProduction()) {
    return process.env.REACT_APP_FI_MCP_URL || 'https://fi-mcp.deltaverse.app';
  }
  // Development: Use localhost
  return process.env.REACT_APP_FI_MCP_URL || 'http://localhost:8080';
};

// Initial state
const initialState = {
  isConnected: false,
  userData: null,
  connectionTimestamp: null,
  lastSyncTimestamp: null,
  sessionExpiryTime: null, // When the session will expire
  insights: [],
  isLoading: false,
  error: null,
  
  // Fi-MCP server status (not connection status)
  fiMcp: {
    status: 'unknown', // 'unknown', 'available', 'unavailable', 'authentication_required'
    serverUrl: getFiMcpServerUrl(),
    lastStatusCheck: null
  }
};

// Async thunk for checking Fi-MCP server status
export const checkFiMcpServerStatus = createAsyncThunk(
  'fiConnect/checkFiMcpStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await checkFiMcpStatus();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Load persisted state from localStorage if available
const loadPersistedState = () => {
  try {
    const storedState = localStorage.getItem('fi_connection_state');
    if (storedState) {
      const parsedState = JSON.parse(storedState);
      
      // Check if session has expired
      if (parsedState.sessionExpiryTime && new Date(parsedState.sessionExpiryTime) > new Date()) {
        console.log('🔄 Restoring Fi connection state from localStorage');
        return { ...initialState, ...parsedState };
      } else {
        console.log('⏰ Fi session has expired, using initial state');
        localStorage.removeItem('fi_connection_state');
      }
    }
    return initialState;
  } catch (error) {
    console.error('Error loading persisted Fi state:', error);
    return initialState;
  }
};

const fiConnectSlice = createSlice({
  name: 'fiConnect',
  initialState: loadPersistedState(),
  reducers: {
    setConnecting: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setConnected: (state, action) => {
      state.isConnected = true;
      state.userData = action.payload;
      state.connectionTimestamp = new Date().toISOString();
      // Set session expiry time (e.g., 24 hours from now)
      state.sessionExpiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      state.isLoading = false;
      
      // Persist to localStorage
      localStorage.setItem('fi_connection_state', JSON.stringify({
        ...state,
        isLoading: false, // Don't persist loading state
        error: null // Don't persist errors
      }));
    },
    setInsights: (state, action) => {
      state.insights = action.payload;
      state.lastSyncTimestamp = new Date().toISOString();
      
      // Update localStorage
      localStorage.setItem('fi_connection_state', JSON.stringify({
        ...state,
        insights: action.payload,
        lastSyncTimestamp: new Date().toISOString(),
        isLoading: false,
        error: null
      }));
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    disconnect: (state) => {
      // Clear state and localStorage
      localStorage.removeItem('fi_connection_state');
      return initialState;
    },
    refreshSession: (state) => {
      // Extend session expiry time
      state.sessionExpiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      // Update localStorage
      localStorage.setItem('fi_connection_state', JSON.stringify({
        ...state,
        sessionExpiryTime: state.sessionExpiryTime,
        isLoading: false,
        error: null
      }));
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Check Fi-MCP Server Status
      .addCase(checkFiMcpServerStatus.fulfilled, (state, action) => {
        const response = action.payload;
        state.fiMcp.status = response.status;
        state.fiMcp.serverUrl = response.url || state.fiMcp.serverUrl;
        state.fiMcp.lastStatusCheck = new Date().toISOString();
        
        // Update localStorage
        localStorage.setItem('fi_connection_state', JSON.stringify({
          ...state,
          isLoading: false,
          error: null
        }));
      })
      .addCase(checkFiMcpServerStatus.rejected, (state, action) => {
        state.fiMcp.status = 'unavailable';
        state.fiMcp.lastStatusCheck = new Date().toISOString();
      });
  }
});

export const { 
  setConnecting, 
  setConnected, 
  setInsights, 
  setError, 
  disconnect,
  refreshSession
} = fiConnectSlice.actions;

// Selectors
export const selectFiConnect = (state) => state.fiConnect;
export const selectIsConnected = (state) => state.fiConnect.isConnected;
export const selectFiMcpStatus = (state) => state.fiConnect.fiMcp;
export const selectFiMcpConnecting = (state) => state.fiConnect.isLoading; // Use general loading state

export default fiConnectSlice.reducer;
