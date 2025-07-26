/**
 * Advanced Voice Interface Component
 * Cutting-edge voice interaction UI with innovative features
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  Tooltip,
  Menu,
  MenuItem,
  Badge,
  Fade,
  Zoom,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Language as LanguageIcon,
  Psychology as PsychologyIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Waveform as WaveformIcon,
  Stop as StopIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAdvancedVoice } from '../../hooks/useAdvancedVoice';

// Define style objects outside component to avoid parsing issues
const createVoiceButtonStyles = (isListening) => ({
  width: 80,
  height: 80,
  background: isListening 
    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  color: 'white',
  boxShadow: isListening 
    ? '0 8px 25px rgba(239, 68, 68, 0.4)'
    : '0 8px 25px rgba(16, 185, 129, 0.4)',
  '&:hover': {
    transform: 'scale(1.05)',
  },
  transition: 'all 0.3s ease'
});

const AdvancedVoiceInterface = ({ 
  onVoiceMessage, 
  onVoiceError,
  disabled = false,
  showAnalytics = true,
  compactMode = false 
}) => {
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState(null);
  const [showTranscript, setShowTranscript] = useState(true);
  const [voiceAnimation, setVoiceAnimation] = useState(false);
  const [confidenceLevel, setConfidenceLevel] = useState(0);
  const [emotionDetected, setEmotionDetected] = useState(null);
  const [securityStatus, setSecurityStatus] = useState('verified');
  const [showCancelButton, setShowCancelButton] = useState(false);

  const waveformRef = useRef(null);

  const {
    isListening,
    isSpeaking,
    currentTranscript,
    interimTranscript,
    voiceSupported,
    currentLanguage,
    voiceAnalytics,
    lastProcessedResult,
    error,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    switchLanguage,
    toggleListening,
    clearTranscripts,
    getAnalytics,
    supportedLanguages
  } = useAdvancedVoice({
    onVoiceResult: handleVoiceResult,
    onVoiceError: onVoiceError
  });

  // Handle voice result with advanced processing
  function handleVoiceResult(result) {
    console.log('🎤 Advanced voice result:', result);
    
    // Check for cancel commands first
    if (checkForCancelCommand(result.enhancedTranscript || result.transcript || '')) {
      handleCancel();
      return;
    }
    
    // Update UI state based on processing results
    setConfidenceLevel(result.confidence);
    setEmotionDetected(result.emotion);
    setSecurityStatus(result.biometricMatch?.isValid ? 'verified' : 'unverified');
    
    // Send processed message to parent
    onVoiceMessage?.({
      message: result.enhancedTranscript,
      metadata: {
        confidence: result.confidence,
        language: result.detectedLanguage,
        emotion: result.emotion,
        financialContext: result.financialContext,
        biometric: result.biometricMatch
      }
    });
  }

  // Handle cancel operation
  const handleCancel = () => {
    stopListening();
    stopSpeaking();
    setShowCancelButton(false);
    clearTranscripts();
    setVoiceAnimation(false);
    
    // Notify parent component
    onVoiceError?.({ 
      type: 'user_cancelled', 
      message: 'Voice operation cancelled by user' 
    });
  };

  // Check for cancel commands in transcript
  const checkForCancelCommand = (transcript) => {
    const cancelCommands = [
      'stop', 'cancel', 'quit', 'exit', 'nevermind', 'forget it', 'abort',
      'रुको', 'बंद करो', 'छोड़ो' // Hindi cancel commands
    ];
    
    const lowerTranscript = transcript.toLowerCase();
    return cancelCommands.some(cmd => lowerTranscript.includes(cmd));
  };

  // Handle ESC key for cancellation
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Escape' && (isListening || isSpeaking)) {
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isListening, isSpeaking]);

  // Show cancel button when voice is active
  useEffect(() => {
    setShowCancelButton(isListening || isSpeaking);
  }, [isListening, isSpeaking]);

  // Voice animation effect
  useEffect(() => {
    if (isListening || isSpeaking) {
      setVoiceAnimation(true);
      const interval = setInterval(() => {
        setVoiceAnimation(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setVoiceAnimation(false);
    }
  }, [isListening, isSpeaking]);

  // Waveform visualization
  useEffect(() => {
    if (isListening && waveformRef.current) {
      // Simulate waveform animation
      const canvas = waveformRef.current;
      const ctx = canvas.getContext('2d');
      let animationId;

      const drawWaveform = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i = 0; i < canvas.width; i += 4) {
          const amplitude = Math.random() * canvas.height * 0.5;
          const y = canvas.height / 2 + (Math.random() - 0.5) * amplitude;
          
          if (i === 0) {
            ctx.moveTo(i, y);
          } else {
            ctx.lineTo(i, y);
          }
        }
        
        ctx.stroke();
        animationId = requestAnimationFrame(drawWaveform);
      };

      drawWaveform();
      return () => cancelAnimationFrame(animationId);
    }
  }, [isListening]);

  const handleLanguageMenuOpen = (event) => {
    setLanguageMenuAnchor(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setLanguageMenuAnchor(null);
  };

  const handleLanguageChange = (languageCode) => {
    switchLanguage(languageCode);
    handleLanguageMenuClose();
  };

  if (!voiceSupported) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        Voice features are not supported in this browser. Please use Chrome, Edge, or Safari.
      </Alert>
    );
  }

  if (compactMode) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={isListening ? 'Stop Listening' : 'Start Voice Input'}>
          <IconButton
            onClick={toggleListening}
            disabled={disabled}
            sx={{
              color: isListening ? '#ef4444' : '#10b981',
              animation: voiceAnimation ? 'pulse 0.5s infinite' : 'none',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.1)' },
                '100%': { transform: 'scale(1)' }
              }
            }}
          >
            {isListening ? <MicOffIcon /> : <MicIcon />}
          </IconButton>
        </Tooltip>
        
        {(isListening || isSpeaking) && (
          <Chip
            size="small"
            label={isListening ? 'Listening...' : 'Speaking...'}
            color={isListening ? 'success' : 'primary'}
            variant="outlined"
          />
        )}
      </Box>
    );
  }

  return (
    <>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          m: 2, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}
      >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PsychologyIcon color="primary" />
          AI Voice Assistant
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Language Selector */}
          <Tooltip title="Select Language">
            <IconButton onClick={handleLanguageMenuOpen} size="small">
              <Badge badgeContent={supportedLanguages[currentLanguage]?.flag} color="primary">
                <LanguageIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* Security Status */}
          <Tooltip title={`Voice Security: ${securityStatus}`}>
            <IconButton size="small">
              <SecurityIcon color={securityStatus === 'verified' ? 'success' : 'warning'} />
            </IconButton>
          </Tooltip>
          
          {/* Analytics */}
          {showAnalytics && (
            <Tooltip title="Voice Analytics">
              <IconButton onClick={getAnalytics} size="small">
                <AnalyticsIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Main Voice Controls */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        
        {/* Primary Voice Button */}
        <Zoom in={true}>
          <IconButton
            onClick={toggleListening}
            disabled={disabled}
            sx={createVoiceButtonStyles(isListening)}
          >
            {isListening ? <MicOffIcon sx={{ fontSize: 40 }} /> : <MicIcon sx={{ fontSize: 40 }} />}
          </IconButton>
        </Zoom>

        {/* PROMINENT CANCEL BUTTON - Shows when voice is active */}
        <Fade in={showCancelButton}>
          <Box sx={{ position: 'relative', mt: 2 }}>
            <IconButton
              onClick={handleCancel}
              sx={{
                width: 60,
                height: 60,
                background: 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)',
                color: 'white',
                boxShadow: '0 6px 20px rgba(255, 68, 68, 0.5)',
                animation: 'cancelPulse 1.5s infinite',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 8px 25px rgba(255, 68, 68, 0.7)',
                },
                '@keyframes cancelPulse': {
                  '0%': { 
                    transform: 'scale(1)',
                    boxShadow: '0 6px 20px rgba(255, 68, 68, 0.5)'
                  },
                  '50%': { 
                    transform: 'scale(1.05)',
                    boxShadow: '0 8px 25px rgba(255, 68, 68, 0.7)'
                  },
                  '100%': { 
                    transform: 'scale(1)',
                    boxShadow: '0 6px 20px rgba(255, 68, 68, 0.5)'
                  }
                }
              }}
            >
              <StopIcon sx={{ fontSize: 32 }} />
            </IconButton>
            
            {/* Cancel Button Label */}
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 1,
                fontWeight: 600,
                color: '#ff4444',
                textAlign: 'center'
              }}
            >
              STOP
            </Typography>
            
            {/* ESC Key Hint */}
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block',
                textAlign: 'center',
                color: '#666',
                mt: 0.5
              }}
            >
              or press ESC
            </Typography>
          </Box>
        </Fade>

        {/* Status Text */}
        <Typography 
          variant="body1" 
          sx={{ 
            fontWeight: 600,
            color: isListening ? '#ef4444' : isSpeaking ? '#3b82f6' : '#6b7280'
          }}
        >
          {isListening ? '🎤 Listening...' : 
           isSpeaking ? '🔊 Speaking...' : 
           '💬 Tap to start voice chat'}
        </Typography>

        {/* Waveform Visualization */}
        {isListening && (
          <Fade in={isListening}>
            <Box sx={{ width: '100%', height: 60, position: 'relative' }}>
              <canvas
                ref={waveformRef}
                width={300}
                height={60}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.1)'
                }}
              />
            </Box>
          </Fade>
        )}

        {/* Confidence Level */}
        {confidenceLevel > 0 && (
          <Box sx={{ width: '100%' }}>
            <Typography variant="caption" color="text.secondary">
              Confidence: {Math.round(confidenceLevel * 100)}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={confidenceLevel * 100}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: confidenceLevel > 0.7 ? '#10b981' : 
                                   confidenceLevel > 0.5 ? '#f59e0b' : '#ef4444'
                }
              }}
            />
          </Box>
        )}

        {/* Emotion Detection */}
        {emotionDetected && (
          <Chip
            label={`😊 ${emotionDetected.type} (${Math.round(emotionDetected.confidence * 100)}%)`}
            variant="outlined"
            color="primary"
            size="small"
          />
        )}
      </Box>

      {/* Transcript Display */}
      {showTranscript && (currentTranscript || interimTranscript) && (
        <Fade in={true}>
          <Paper 
            sx={{ 
              p: 2, 
              mt: 2, 
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderLeft: '4px solid #10b981'
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Transcript:
            </Typography>
            <Typography variant="body1">
              {currentTranscript}
              {interimTranscript && (
                <span style={{ color: '#6b7280', fontStyle: 'italic' }}>
                  {interimTranscript}
                </span>
              )}
            </Typography>
          </Paper>
        </Fade>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {typeof error === 'string' ? error : error.message || 'An error occurred'}
        </Alert>
      )}

      {/* Language Menu */}
      <Menu
        anchorEl={languageMenuAnchor}
        open={Boolean(languageMenuAnchor)}
        onClose={handleLanguageMenuClose}
      >
        {Object.entries(supportedLanguages).map(([code, lang]) => (
          <MenuItem 
            key={code} 
            onClick={() => handleLanguageChange(code)}
            selected={code === currentLanguage}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Secondary Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
        {isSpeaking && (
          <Tooltip title="Stop Speaking">
            <IconButton onClick={stopSpeaking} size="small">
              <VolumeOffIcon />
            </IconButton>
          </Tooltip>
        )}
        
        {currentTranscript && (
          <Tooltip title="Clear Transcript">
            <IconButton onClick={clearTranscripts} size="small">
              <Typography variant="caption">Clear</Typography>
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Paper>

    {/* FLOATING CANCEL BUTTON - For full screen mode */}
    <Fade in={showCancelButton}>
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
        }}
      >
        <Tooltip title="Cancel Voice Operation (ESC)" placement="left">
          <IconButton
            onClick={handleCancel}
            sx={{
              width: 72,
              height: 72,
              background: 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)',
              color: 'white',
              boxShadow: '0 8px 30px rgba(255, 68, 68, 0.6)',
              animation: 'floatingCancelPulse 2s infinite',
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: '0 12px 40px rgba(255, 68, 68, 0.8)',
              },
              '@keyframes floatingCancelPulse': {
                '0%': { 
                  transform: 'scale(1)',
                  boxShadow: '0 8px 30px rgba(255, 68, 68, 0.6)'
                },
                '50%': { 
                  transform: 'scale(1.05)',
                  boxShadow: '0 12px 40px rgba(255, 68, 68, 0.8)'
                },
                '100%': { 
                  transform: 'scale(1)',
                  boxShadow: '0 8px 30px rgba(255, 68, 68, 0.6)'
                }
              }
            }}
          >
            <StopIcon sx={{ fontSize: 36 }} />
          </IconButton>
        </Tooltip>
        
        {/* Floating Cancel Label */}
        <Typography 
          variant="caption" 
          sx={{ 
            position: 'absolute',
            bottom: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#ff4444',
            fontWeight: 'bold',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}
        >
          CANCEL
        </Typography>
      </Box>
    </Fade>
    </>
  );
};

export default AdvancedVoiceInterface;
