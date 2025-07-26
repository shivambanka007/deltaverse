import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import voiceWebSocketService from '../services/voiceWebSocketService';
import {
  setListening,
  setPaused,
  setProcessing,
  updateTranscript,
  setError,
  clearError,
  updateListeningTime,
  updateSessionStats
} from '../store/slices/aiVoiceSlice';

export const useVoiceWebSocket = () => {
  const dispatch = useDispatch();
  const {
    isListening,
    isPaused,
    preferences,
    sessionId
  } = useSelector(state => state.aiVoice);
  
  const intervalRef = useRef(null);
  const isInitialized = useRef(false);

  // Initialize WebSocket connection
  const initializeConnection = useCallback(async () => {
    if (isInitialized.current) return;
    
    try {
      dispatch(setProcessing(true));
      dispatch(clearError());
      
      // Set up event handlers
      voiceWebSocketService.onConnect(() => {
        console.log('Voice WebSocket connected');
        dispatch(setProcessing(false));
        dispatch(clearError());
      });

      voiceWebSocketService.onDisconnect((event) => {
        console.log('Voice WebSocket disconnected');
        dispatch(setListening(false));
        dispatch(setPaused(false));
        dispatch(setProcessing(false));
        
        if (event.code !== 1000) {
          dispatch(setError('Connection lost. Attempting to reconnect...'));
        }
      });

      voiceWebSocketService.onTranscript((text, confidence) => {
        dispatch(updateTranscript({ text, confidence }));
        
        // Update session statistics
        const wordCount = text.split(' ').length;
        dispatch(updateSessionStats({ confidence, wordCount }));
      });

      voiceWebSocketService.onConfidence((confidence) => {
        dispatch(updateTranscript({ text: '', confidence }));
      });

      voiceWebSocketService.onError((error) => {
        console.error('Voice WebSocket error:', error);
        dispatch(setError(typeof error === 'string' ? error : error.message || 'Voice service error'));
        dispatch(setListening(false));
        dispatch(setProcessing(false));
      });

      // Connect to WebSocket
      await voiceWebSocketService.connect();
      isInitialized.current = true;
      
    } catch (error) {
      console.error('Failed to initialize voice WebSocket:', error);
      dispatch(setError('Failed to connect to voice service'));
      dispatch(setProcessing(false));
    }
  }, [dispatch]);

  // Start listening
  const startListening = useCallback(async () => {
    try {
      if (!voiceWebSocketService.isReady()) {
        await initializeConnection();
      }

      dispatch(setProcessing(true));
      dispatch(clearError());

      const success = voiceWebSocketService.startListening(preferences);
      
      if (success) {
        dispatch(setListening(true));
        dispatch(setPaused(false));
        
        // Start timing interval
        intervalRef.current = setInterval(() => {
          dispatch(updateListeningTime());
        }, 1000);
        
      } else {
        throw new Error('Failed to send start command');
      }
      
      dispatch(setProcessing(false));
      
    } catch (error) {
      console.error('Failed to start listening:', error);
      dispatch(setError('Failed to start voice recognition'));
      dispatch(setProcessing(false));
    }
  }, [dispatch, preferences, initializeConnection]);

  // Stop listening
  const stopListening = useCallback(async () => {
    try {
      dispatch(setProcessing(true));
      
      const success = voiceWebSocketService.stopListening();
      
      if (success) {
        dispatch(setListening(false));
        dispatch(setPaused(false));
        
        // Clear timing interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        throw new Error('Failed to send stop command');
      }
      
      dispatch(setProcessing(false));
      
    } catch (error) {
      console.error('Failed to stop listening:', error);
      dispatch(setError('Failed to stop voice recognition'));
      dispatch(setProcessing(false));
    }
  }, [dispatch]);

  // Pause/Resume listening
  const pauseListening = useCallback(() => {
    try {
      const success = voiceWebSocketService.pauseListening();
      
      if (success) {
        dispatch(setPaused(true));
      } else {
        throw new Error('Failed to send pause command');
      }
      
    } catch (error) {
      console.error('Failed to pause listening:', error);
      dispatch(setError('Failed to pause voice recognition'));
    }
  }, [dispatch]);

  const resumeListening = useCallback(() => {
    try {
      const success = voiceWebSocketService.resumeListening();
      
      if (success) {
        dispatch(setPaused(false));
      } else {
        throw new Error('Failed to send resume command');
      }
      
    } catch (error) {
      console.error('Failed to resume listening:', error);
      dispatch(setError('Failed to resume voice recognition'));
    }
  }, [dispatch]);

  // Update transcript
  const updateTranscriptOnServer = useCallback((transcript) => {
    try {
      const success = voiceWebSocketService.updateTranscript(transcript);
      
      if (!success) {
        console.warn('Failed to send transcript update to server');
      }
      
    } catch (error) {
      console.error('Failed to update transcript:', error);
    }
  }, []);

  // Emergency stop
  const emergencyStop = useCallback(() => {
    try {
      // Stop WebSocket communication
      voiceWebSocketService.stopListening();
      
      // Clear any intervals
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      // Reset Redux state
      dispatch(setListening(false));
      dispatch(setPaused(false));
      dispatch(setProcessing(false));
      dispatch(clearError());
      
    } catch (error) {
      console.error('Emergency stop failed:', error);
    }
  }, [dispatch]);

  // Get connection status
  const getConnectionStatus = useCallback(() => {
    return voiceWebSocketService.getConnectionState();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      if (isListening) {
        voiceWebSocketService.stopListening();
      }
      
      // Don't disconnect WebSocket on unmount to allow reconnection
      // voiceWebSocketService.disconnect();
    };
  }, [isListening]);

  // Auto-initialize connection when component mounts
  useEffect(() => {
    if (!isInitialized.current) {
      initializeConnection();
    }
  }, [initializeConnection]);

  return {
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
    updateTranscriptOnServer,
    emergencyStop,
    getConnectionStatus,
    isConnected: voiceWebSocketService.isReady()
  };
};
