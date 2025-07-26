/**
 * Advanced Voice Interface Hook for DeltaVerse
 * Expert-level React integration with cutting-edge features
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import AdvancedVoiceService from '../services/voice/VoiceService';

export const useAdvancedVoice = (options = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en-US');
  const [voiceAnalytics, setVoiceAnalytics] = useState(null);
  const [lastProcessedResult, setLastProcessedResult] = useState(null);
  const [error, setError] = useState(null);

  const voiceServiceRef = useRef(null);
  const onVoiceResult = options.onVoiceResult;
  const onVoiceError = options.onVoiceError;

  // Initialize voice service
  useEffect(() => {
    try {
      voiceServiceRef.current = new AdvancedVoiceService();
      setVoiceSupported(true);

      // Setup event handlers
      voiceServiceRef.current.onListeningStart = () => {
        setIsListening(true);
        setError(null);
      };

      voiceServiceRef.current.onListeningEnd = () => {
        setIsListening(false);
      };

      voiceServiceRef.current.onSpeechStart = (text) => {
        setIsSpeaking(true);
      };

      voiceServiceRef.current.onSpeechEnd = (text) => {
        setIsSpeaking(false);
      };

      voiceServiceRef.current.onSpeechRecognized = (result) => {
        setCurrentTranscript(result.enhancedTranscript);
        setLastProcessedResult(result);
        onVoiceResult?.(result);
      };

      voiceServiceRef.current.onInterimResult = (transcript) => {
        setInterimTranscript(transcript);
      };

      voiceServiceRef.current.onSpeechError = (errorData) => {
        console.error('🚨 Speech error in hook:', errorData);
        setError(errorData.message);
        setIsListening(false);
        onVoiceError?.(errorData);
      };

      voiceServiceRef.current.onSpeechTimeout = (timeoutData) => {
        console.log('⏱️ Speech timeout in hook:', timeoutData);
        // Don't set error for no-speech timeouts as they're normal
        if (timeoutData.error !== 'no-speech') {
          setError(timeoutData.message);
        }
        // Don't stop listening for timeouts as auto-restart will handle it
      };

      // Configure auto-restart for better user experience
      voiceServiceRef.current.configureAutoRestart({
        enabled: options.autoRestart !== false,
        maxAttempts: options.maxRestartAttempts || 3,
        delay: options.restartDelay || 1000
      });

    } catch (err) {
      console.error('Voice service initialization failed:', err);
      setVoiceSupported(false);
      setError(err.message);
    }

    return () => {
      if (voiceServiceRef.current) {
        voiceServiceRef.current.destroy();
      }
    };
  }, [onVoiceResult]);

  // Start listening
  const startListening = useCallback(async (voiceOptions = {}) => {
    if (!voiceServiceRef.current || isListening) return;

    try {
      await voiceServiceRef.current.startListening({
        language: currentLanguage,
        continuous: true,
        interimResults: true,
        timeout: voiceOptions.timeout || 30000,
        ...voiceOptions
      });
    } catch (err) {
      setError(err.message);
      onVoiceError?.(err);
    }
  }, [isListening, currentLanguage, onVoiceError]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.stopListening();
    }
  }, []);

  // Speak text with advanced options
  const speak = useCallback(async (text, speakOptions = {}) => {
    if (!voiceServiceRef.current) return;

    try {
      await voiceServiceRef.current.speak(text, {
        language: currentLanguage,
        interrupt: true,
        emotion: speakOptions.emotion,
        financialContext: speakOptions.financialContext,
        ...speakOptions
      });
    } catch (err) {
      setError(err.message);
      onVoiceError?.(err);
    }
  }, [currentLanguage, onVoiceError]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.synthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  // Switch language
  const switchLanguage = useCallback((languageCode) => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.switchLanguage(languageCode);
      setCurrentLanguage(languageCode);
    }
  }, []);

  // Get voice analytics
  const getAnalytics = useCallback(() => {
    if (voiceServiceRef.current) {
      const analytics = voiceServiceRef.current.getAnalytics();
      setVoiceAnalytics(analytics);
      return analytics;
    }
    return null;
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Clear transcripts
  const clearTranscripts = useCallback(() => {
    setCurrentTranscript('');
    setInterimTranscript('');
    setLastProcessedResult(null);
  }, []);

  return {
    // State
    isListening,
    isSpeaking,
    currentTranscript,
    interimTranscript,
    voiceSupported,
    currentLanguage,
    voiceAnalytics,
    lastProcessedResult,
    error,

    // Actions
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    switchLanguage,
    toggleListening,
    clearTranscripts,
    getAnalytics,

    // Supported languages
    supportedLanguages: voiceServiceRef.current?.supportedLanguages || {},
  };
};
