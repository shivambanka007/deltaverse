import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../services/api';

// Async thunks for user operations
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to fetch user profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await apiClient.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to update profile');
    }
  }
);

// Initial state
const initialState = {
  profile: null,
  preferences: {
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
  },
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: state => {
      state.error = null;
    },
    updatePreferences: (state, action) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload,
      };
      state.lastUpdated = Date.now();
    },
    setTheme: (state, action) => {
      state.preferences.theme = action.payload;
    },
    setLanguage: (state, action) => {
      state.preferences.language = action.payload;
    },
    updateNotificationSettings: (state, action) => {
      state.preferences.notifications = {
        ...state.preferences.notifications,
        ...action.payload,
      };
    },
    clearUserData: state => {
      state.profile = null;
      state.error = null;
      state.isLoading = false;
      state.lastUpdated = null;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch user profile
      .addCase(fetchUserProfile.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.lastUpdated = Date.now();
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update user profile
      .addCase(updateUserProfile.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = { ...state.profile, ...action.payload };
        state.lastUpdated = Date.now();
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  clearUserError,
  updatePreferences,
  setTheme,
  setLanguage,
  updateNotificationSettings,
  clearUserData,
} = userSlice.actions;

// Selectors
export const selectUser = state => state.user;
export const selectUserProfile = state => state.user.profile;
export const selectUserPreferences = state => state.user.preferences;
export const selectUserTheme = state => state.user.preferences.theme;
export const selectUserLanguage = state => state.user.preferences.language;
export const selectUserNotifications = state => state.user.preferences.notifications;
export const selectUserLoading = state => state.user.isLoading;
export const selectUserError = state => state.user.error;

// Export reducer
export default userSlice.reducer;
