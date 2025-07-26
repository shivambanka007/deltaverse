import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for starting voice recognition
export const startVoiceRecognition = createAsyncThunk(
  'aiVoice/startRecognition',
  async (preferences, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/voice/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });
      
      if (!response.ok) {
        throw new Error('Failed to start voice recognition');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for stopping voice recognition
export const stopVoiceRecognition = createAsyncThunk(
  'aiVoice/stopRecognition',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/voice/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to stop voice recognition');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // Voice Recognition State
  isListening: false,
  isPaused: false,
  isProcessing: false,
  
  // Transcript Data
  transcript: '',
  confidence: 0,
  isTranscriptEditable: false,
  
  // User Preferences
  preferences: {
    autoStart: false,
    confidenceThreshold: 70,
    maxListeningTime: 60,
    pauseOnLowConfidence: true,
    showRealTimeTranscript: true,
    language: 'en-US',
    voiceSpeed: 1.0,
    enableVisualFeedback: true
  },
  
  // Session Data
  sessionId: null,
  startTime: null,
  totalListeningTime: 0,
  
  // Error Handling
  error: null,
  lastError: null,
  
  // UI State
  showSettings: false,
  showTranscript: true,
  visualMode: 'waveform', // 'waveform', 'circular', 'minimal'
  
  // Analytics
  sessionStats: {
    totalSessions: 0,
    averageConfidence: 0,
    totalWords: 0,
    successfulTranscriptions: 0
  }
};

const aiVoiceSlice = createSlice({
  name: 'aiVoice',
  initialState,
  reducers: {
    // Voice Control Actions
    setListening: (state, action) => {
      state.isListening = action.payload;
      if (action.payload) {
        state.startTime = Date.now();
        state.sessionId = `session_${Date.now()}`;
      } else {
        state.startTime = null;
        state.sessionId = null;
      }
    },
    
    setPaused: (state, action) => {
      state.isPaused = action.payload;
    },
    
    setProcessing: (state, action) => {
      state.isProcessing = action.payload;
    },
    
    // Transcript Management
    updateTranscript: (state, action) => {
      state.transcript = action.payload.text;
      state.confidence = action.payload.confidence || state.confidence;
      
      // Update session stats
      if (action.payload.text) {
        const wordCount = action.payload.text.split(' ').length;
        state.sessionStats.totalWords = wordCount;
        state.sessionStats.successfulTranscriptions += 1;
      }
    },
    
    clearTranscript: (state) => {
      state.transcript = '';
      state.confidence = 0;
    },
    
    setTranscriptEditable: (state, action) => {
      state.isTranscriptEditable = action.payload;
    },
    
    // Preference Management
    updatePreference: (state, action) => {
      const { key, value } = action.payload;
      state.preferences[key] = value;
      
      // Save to localStorage
      localStorage.setItem('aiVoicePreferences', JSON.stringify(state.preferences));
    },
    
    loadPreferences: (state) => {
      const saved = localStorage.getItem('aiVoicePreferences');
      if (saved) {
        state.preferences = { ...state.preferences, ...JSON.parse(saved) };
      }
    },
    
    resetPreferences: (state) => {
      state.preferences = initialState.preferences;
      localStorage.removeItem('aiVoicePreferences');
    },
    
    // UI State Management
    toggleSettings: (state) => {
      state.showSettings = !state.showSettings;
    },
    
    toggleTranscript: (state) => {
      state.showTranscript = !state.showTranscript;
    },
    
    setVisualMode: (state, action) => {
      state.visualMode = action.payload;
    },
    
    // Error Handling
    setError: (state, action) => {
      state.error = action.payload;
      state.lastError = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Session Management
    updateListeningTime: (state) => {
      if (state.startTime && state.isListening) {
        state.totalListeningTime = Date.now() - state.startTime;
      }
    },
    
    // Analytics
    updateSessionStats: (state, action) => {
      const { confidence, wordCount } = action.payload;
      state.sessionStats.totalSessions += 1;
      
      if (confidence) {
        const currentAvg = state.sessionStats.averageConfidence;
        const sessions = state.sessionStats.totalSessions;
        state.sessionStats.averageConfidence = 
          (currentAvg * (sessions - 1) + confidence) / sessions;
      }
      
      if (wordCount) {
        state.sessionStats.totalWords += wordCount;
      }
    },
    
    // Emergency Stop
    emergencyStop: (state) => {
      state.isListening = false;
      state.isPaused = false;
      state.isProcessing = false;
      state.startTime = null;
      state.sessionId = null;
      state.error = null;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Start Voice Recognition
      .addCase(startVoiceRecognition.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(startVoiceRecognition.fulfilled, (state, action) => {
        state.isProcessing = false;
        state.isListening = true;
        state.sessionId = action.payload.sessionId;
        state.startTime = Date.now();
      })
      .addCase(startVoiceRecognition.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload;
        state.isListening = false;
      })
      
      // Stop Voice Recognition
      .addCase(stopVoiceRecognition.pending, (state) => {
        state.isProcessing = true;
      })
      .addCase(stopVoiceRecognition.fulfilled, (state) => {
        state.isProcessing = false;
        state.isListening = false;
        state.isPaused = false;
        state.startTime = null;
        state.sessionId = null;
      })
      .addCase(stopVoiceRecognition.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload;
      });
  }
});

export const {
  setListening,
  setPaused,
  setProcessing,
  updateTranscript,
  clearTranscript,
  setTranscriptEditable,
  updatePreference,
  loadPreferences,
  resetPreferences,
  toggleSettings,
  toggleTranscript,
  setVisualMode,
  setError,
  clearError,
  updateListeningTime,
  updateSessionStats,
  emergencyStop
} = aiVoiceSlice.actions;

export default aiVoiceSlice.reducer;
