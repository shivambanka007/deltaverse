import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Auth steps for multi-step authentication
export const AUTH_STEPS = {
  UNAUTHENTICATED: 'unauthenticated',
  EMAIL_VERIFICATION: 'email_verification',
  OTP_VERIFICATION: 'otp_verification',
  AUTHENTICATED: 'authenticated',
};

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  authStep: AUTH_STEPS.UNAUTHENTICATED,
  tempToken: null,
  phoneNumber: null,
};

// Async thunks for Firebase authentication
export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
  // Firebase auth state listener will handle initialization
  return { success: true };
});

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      if (!auth.user) {
        throw new Error('No user to refresh token for');
      }

      // Firebase handles token refresh automatically
      return auth.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // User management
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
      state.error = null;
      if (action.payload) {
        state.authStep = AUTH_STEPS.AUTHENTICATED;
      }
    },

    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    // Loading state
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    // Error handling
    clearError: state => {
      state.error = null;
    },

    clearAllErrors: state => {
      state.error = null;
    },

    // Auth steps
    setAuthStep: (state, action) => {
      state.authStep = action.payload;
    },

    // Temp token for multi-step auth
    setTempToken: (state, action) => {
      state.tempToken = action.payload;
    },

    clearTempToken: state => {
      state.tempToken = null;
    },

    // Phone number for OTP verification
    setPhoneNumber: (state, action) => {
      state.phoneNumber = action.payload;
    },

    // Logout
    logout: state => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.authStep = AUTH_STEPS.UNAUTHENTICATED;
      state.tempToken = null;
      state.phoneNumber = null;
    },

    // Reset auth state
    resetAuth: state => {
      return { ...initialState };
    },
  },
  extraReducers: builder => {
    builder
      // Initialize auth
      .addCase(initializeAuth.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
          state.authStep = AUTH_STEPS.AUTHENTICATED;
        }
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Refresh token
      .addCase(refreshToken.pending, state => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // If refresh fails, logout user
        state.user = null;
        state.isAuthenticated = false;
        state.authStep = AUTH_STEPS.UNAUTHENTICATED;
      });
  },
});

// Action creators
export const {
  setUser,
  updateUser,
  setLoading,
  clearError,
  clearAllErrors,
  setAuthStep,
  setTempToken,
  clearTempToken,
  setPhoneNumber,
  logout,
  resetAuth,
} = authSlice.actions;

// Selectors
export const selectAuth = state => state.auth;
export const selectUser = state => state.auth.user;
export const selectIsAuthenticated = state => state.auth.isAuthenticated;
export const selectAuthLoading = state => state.auth.isLoading;
export const selectAuthError = state => state.auth.error;
export const selectAuthStep = state => state.auth.authStep;
export const selectTempToken = state => state.auth.tempToken;
export const selectPhoneNumber = state => state.auth.phoneNumber;
export const selectRequiresOTP = state =>
  state.auth.authStep === AUTH_STEPS.OTP_VERIFICATION;
export const selectIsTokenExpired = state => {
  if (!state.auth.user?.tokenExpiry) return false;
  return Date.now() > new Date(state.auth.user.tokenExpiry).getTime();
};

// Get current user helper
export const getCurrentUser = state => state.auth.user;

export default authSlice.reducer;
