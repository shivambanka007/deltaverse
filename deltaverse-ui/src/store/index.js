import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import fiConnectSlice from './slices/fiConnectSlice';
import financialHealthSlice from './slices/financialHealthSlice';
import aiVoiceSlice from './slices/aiVoiceSlice';
import authMiddleware from './middleware/authMiddleware';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    fiConnect: fiConnectSlice,
    financialHealth: financialHealthSlice,
    aiVoice: aiVoiceSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization check
        ignoredActions: [
          'auth/setUser', 
          'auth/setLoading', 
          'fiConnect/setConnected',
          'financialHealth/fetchHealthScore/fulfilled',
          'financialHealth/fetchMockHealthScore/fulfilled',
          'financialHealth/updateHealthScore',
          'aiVoice/startVoiceRecognition/fulfilled',
          'aiVoice/stopVoiceRecognition/fulfilled',
          'aiVoice/updateTranscript',
          'aiVoice/updateListeningTime'
        ],
        // Ignore these field paths in the state
        ignoredPaths: [
          'auth.user.profile', 
          'auth.user.profileData', 
          'fiConnect.userData',
          'financialHealth.healthScore.last_updated',
          'financialHealth.lastUpdated',
          'aiVoice.startTime',
          'aiVoice.sessionId',
          'aiVoice.sessionStats'
        ],
      },
    }).concat(authMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
