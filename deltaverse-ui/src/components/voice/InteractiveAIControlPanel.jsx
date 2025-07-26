import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
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
  Alert,
  Switch,
  FormControlLabel,
  Slider,
  Divider,
  Card,
  CardContent,
  CardActions,
  Grid
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Settings as SettingsIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Close as CloseIcon,
  WifiOff as WifiOffIcon,
  Wifi as WifiIcon
} from '@mui/icons-material';
import {
  updateTranscript,
  clearTranscript,
  setTranscriptEditable,
  updatePreference,
  toggleSettings,
  toggleTranscript,
  setVisualMode,
  clearError
} from '../../store/slices/aiVoiceSlice';
import { useVoiceWebSocket } from '../../hooks/useVoiceWebSocket';

const InteractiveAIControlPanel = () => {
  const dispatch = useDispatch();
  const {
    isListening,
    isPaused,
    isProcessing,
    transcript,
    confidence,
    isTranscriptEditable,
    preferences,
    showSettings,
    showTranscript,
    visualMode,
    error,
    totalListeningTime,
    sessionStats
  } = useSelector(state => state.aiVoice);

  const {
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
    updateTranscriptOnServer,
    emergencyStop,
    getConnectionStatus,
    isConnected
  } = useVoiceWebSocket();

  const [anchorEl, setAnchorEl] = useState(null);
  const [localTranscript, setLocalTranscript] = useState(transcript);
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');
  const transcriptRef = useRef(null);

  // Update local transcript when Redux state changes
  useEffect(() => {
    setLocalTranscript(transcript);
  }, [transcript]);

  // Monitor connection status
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionStatus(getConnectionStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, [getConnectionStatus]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  const handleStartListening = async () => {
    await startListening();
  };

  const handleStopListening = async () => {
    await stopListening();
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resumeListening();
    } else {
      pauseListening();
    }
  };

  const handleEmergencyStop = () => {
    emergencyStop();
  };

  const handleTranscriptEdit = () => {
    dispatch(setTranscriptEditable(!isTranscriptEditable));
    if (isTranscriptEditable) {
      dispatch(updateTranscript({ text: localTranscript, confidence }));
      updateTranscriptOnServer(localTranscript);
    }
  };

  const handleTranscriptChange = (event) => {
    setLocalTranscript(event.target.value);
  };

  const handleClearTranscript = () => {
    dispatch(clearTranscript());
    setLocalTranscript('');
  };

  const handlePreferenceChange = (key, value) => {
    dispatch(updatePreference({ key, value }));
  };

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#4CAF50';
    if (confidence >= 60) return '#FF9800';
    return '#F44336';
  };

  const getStatusText = () => {
    if (!isConnected) return 'Disconnected';
    if (isProcessing) return 'Processing...';
    if (isListening && isPaused) return 'Paused';
    if (isListening) return 'Listening...';
    return 'Ready';
  };

  const getStatusColor = () => {
    if (!isConnected) return '#F44336';
    if (isProcessing) return '#2196F3';
    if (isListening && isPaused) return '#FF9800';
    if (isListening) return '#4CAF50';
    return '#757575';
  };

  const getConnectionIcon = () => {
    return isConnected ? <WifiIcon /> : <WifiOffIcon />;
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', padding: 2 }}>
      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => dispatch(clearError())}
          sx={{ mb: 2 }}
        >
          {typeof error === 'string' ? error : error.message || 'An error occurred'}
        </Alert>
      )}

      {/* Connection Status Alert */}
      {!isConnected && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Voice service disconnected. Attempting to reconnect...
        </Alert>
      )}

      {/* Main Control Panel */}
      <Card elevation={3} sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            {/* Status Display */}
            <Grid item size={{ xs: 12, md: 4 }}>
              <Box textAlign="center">
                <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
                  <Typography variant="h6">
                    AI Voice Assistant
                  </Typography>
                  <Tooltip title={`Connection: ${connectionStatus}`}>
                    <IconButton size="small" color={isConnected ? 'success' : 'error'}>
                      {getConnectionIcon()}
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Chip
                  label={getStatusText()}
                  color={isListening ? 'success' : 'default'}
                  sx={{ 
                    backgroundColor: getStatusColor(),
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
                
                {totalListeningTime > 0 && (
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Session: {formatTime(totalListeningTime)}
                  </Typography>
                )}
              </Box>
            </Grid>

            {/* Main Controls */}
            <Grid item size={{ xs: 12, md: 4 }}>
              <Box display="flex" justifyContent="center" gap={1}>
                {!isListening ? (
                  <Tooltip title="Start Listening">
                    <span>
                      <IconButton
                        onClick={handleStartListening}
                        disabled={isProcessing || !isConnected}
                        sx={{
                          width: 60,
                          height: 60,
                          background: isConnected 
                            ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
                            : 'linear-gradient(135deg, #ccc 0%, #999 100%)',
                          color: 'white',
                          '&:hover': {
                            background: isConnected 
                              ? 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)'
                              : 'linear-gradient(135deg, #ccc 0%, #999 100%)',
                            transform: isConnected ? 'scale(1.05)' : 'none'
                          },
                          '&:disabled': {
                            background: '#ccc'
                          }
                        }}
                      >
                        {isProcessing ? <CircularProgress size={24} color="inherit" /> : <MicIcon />}
                      </IconButton>
                    </span>
                  </Tooltip>
                ) : (
                  <>
                    <Tooltip title={isPaused ? "Resume" : "Pause"}>
                      <IconButton
                        onClick={handlePauseResume}
                        disabled={!isConnected}
                        sx={{
                          width: 50,
                          height: 50,
                          background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
                          color: 'white',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          },
                          '&:disabled': {
                            background: '#ccc'
                          }
                        }}
                      >
                        {isPaused ? <PlayIcon /> : <PauseIcon />}
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Stop Listening">
                      <IconButton
                        onClick={handleStopListening}
                        disabled={isProcessing}
                        sx={{
                          width: 50,
                          height: 50,
                          background: 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)',
                          color: 'white',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          },
                          '&:disabled': {
                            background: '#ccc'
                          }
                        }}
                      >
                        <StopIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                )}

                <Tooltip title="Emergency Stop">
                  <IconButton
                    onClick={handleEmergencyStop}
                    sx={{
                      width: 40,
                      height: 40,
                      background: '#D32F2F',
                      color: 'white',
                      '&:hover': {
                        background: '#B71C1C'
                      }
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            {/* Confidence & Settings */}
            <Grid item size={{ xs: 12, md: 4 }}>
              <Box textAlign="center">
                <Typography variant="body2" gutterBottom>
                  Confidence: {confidence}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={confidence}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getConfidenceColor(confidence),
                      borderRadius: 4
                    }
                  }}
                />
                <Box mt={1}>
                  <IconButton
                    onClick={() => dispatch(toggleSettings())}
                    size="small"
                  >
                    <SettingsIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => setAnchorEl(anchorEl ? null : document.body)}
                    size="small"
                  >
                    <AnalyticsIcon />
                  </IconButton>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Settings Panel */}
      <Fade in={showSettings}>
        <Card elevation={2} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              AI Voice Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.autoStart}
                      onChange={(e) => handlePreferenceChange('autoStart', e.target.checked)}
                    />
                  }
                  label="Auto-start listening"
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.showRealTimeTranscript}
                      onChange={(e) => handlePreferenceChange('showRealTimeTranscript', e.target.checked)}
                    />
                  }
                  label="Real-time transcript"
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <Typography gutterBottom>
                  Confidence Threshold: {preferences.confidenceThreshold}%
                </Typography>
                <Slider
                  value={preferences.confidenceThreshold}
                  onChange={(e, value) => handlePreferenceChange('confidenceThreshold', value)}
                  min={50}
                  max={95}
                  step={5}
                  marks
                  valueLabelDisplay="auto"
                />
              </Grid>
              <Grid item size={{ xs: 12, sm: 6 }}>
                <Typography gutterBottom>
                  Max Listening Time: {preferences.maxListeningTime}s
                </Typography>
                <Slider
                  value={preferences.maxListeningTime}
                  onChange={(e, value) => handlePreferenceChange('maxListeningTime', value)}
                  min={30}
                  max={300}
                  step={30}
                  marks
                  valueLabelDisplay="auto"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Fade>

      {/* Transcript Panel */}
      {showTranscript && (
        <Card elevation={2}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Live Transcript
              </Typography>
              <Box>
                <IconButton onClick={handleTranscriptEdit} size="small">
                  {isTranscriptEditable ? <SaveIcon /> : <EditIcon />}
                </IconButton>
                <IconButton onClick={handleClearTranscript} size="small">
                  <ClearIcon />
                </IconButton>
                <IconButton onClick={() => dispatch(toggleTranscript())} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
            
            <Paper
              variant="outlined"
              sx={{
                minHeight: 120,
                maxHeight: 200,
                overflow: 'auto',
                p: 2,
                backgroundColor: isTranscriptEditable ? '#f5f5f5' : 'transparent'
              }}
            >
              {isTranscriptEditable ? (
                <textarea
                  ref={transcriptRef}
                  value={localTranscript}
                  onChange={handleTranscriptChange}
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    border: 'none',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    backgroundColor: 'transparent'
                  }}
                  placeholder="AI will transcribe your speech here..."
                />
              ) : (
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    minHeight: '100px'
                  }}
                >
                  {transcript || 'AI will transcribe your speech here...'}
                </Typography>
              )}
            </Paper>

            {transcript && (
              <CardActions>
                <Button size="small" variant="outlined">
                  Save Transcript
                </Button>
                <Button size="small" variant="outlined">
                  Send to AI
                </Button>
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => navigator.clipboard.writeText(transcript)}
                >
                  Copy Text
                </Button>
              </CardActions>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analytics Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem>
          <Typography variant="body2">
            Total Sessions: {sessionStats.totalSessions}
          </Typography>
        </MenuItem>
        <MenuItem>
          <Typography variant="body2">
            Avg Confidence: {sessionStats.averageConfidence.toFixed(1)}%
          </Typography>
        </MenuItem>
        <MenuItem>
          <Typography variant="body2">
            Total Words: {sessionStats.totalWords}
          </Typography>
        </MenuItem>
        <MenuItem>
          <Typography variant="body2">
            Success Rate: {sessionStats.successfulTranscriptions}
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default InteractiveAIControlPanel;
