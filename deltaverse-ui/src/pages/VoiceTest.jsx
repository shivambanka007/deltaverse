import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Alert,
  Chip
} from '@mui/material';
import { InteractiveAIControlPanel } from '../components';
import { loadPreferences } from '../store/slices/aiVoiceSlice';

const VoiceTest = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Load user preferences on component mount
    dispatch(loadPreferences());
  }, [dispatch]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Interactive AI Voice Assistant
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center" paragraph>
          Test the enhanced voice recognition system with full user control
        </Typography>
      </Box>

      {/* Feature Overview */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Features
        </Typography>
        <Grid container spacing={2}>
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <Chip 
              label="Start/Stop Control" 
              color="primary" 
              variant="outlined" 
              sx={{ mb: 1, mr: 1 }} 
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <Chip 
              label="Pause/Resume" 
              color="secondary" 
              variant="outlined" 
              sx={{ mb: 1, mr: 1 }} 
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <Chip 
              label="Real-time Confidence" 
              color="success" 
              variant="outlined" 
              sx={{ mb: 1, mr: 1 }} 
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <Chip 
              label="Editable Transcript" 
              color="info" 
              variant="outlined" 
              sx={{ mb: 1, mr: 1 }} 
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <Chip 
              label="User Preferences" 
              color="warning" 
              variant="outlined" 
              sx={{ mb: 1, mr: 1 }} 
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <Chip 
              label="Session Analytics" 
              color="error" 
              variant="outlined" 
              sx={{ mb: 1, mr: 1 }} 
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <Chip 
              label="Emergency Stop" 
              color="default" 
              variant="outlined" 
              sx={{ mb: 1, mr: 1 }} 
            />
          </Grid>
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <Chip 
              label="WebSocket Connection" 
              color="primary" 
              variant="outlined" 
              sx={{ mb: 1, mr: 1 }} 
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Instructions */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>How to use:</strong>
          <br />
          1. Click the green microphone button to start listening
          <br />
          2. Use pause/resume controls during active sessions
          <br />
          3. Adjust settings for confidence threshold and timing
          <br />
          4. Edit transcripts in real-time by clicking the edit button
          <br />
          5. Use emergency stop for immediate termination
        </Typography>
      </Alert>

      {/* Main Voice Interface */}
      <InteractiveAIControlPanel />

      {/* Technical Information */}
      <Paper elevation={1} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Technical Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" paragraph>
              <strong>Frontend:</strong> React + Redux with Material-UI components
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Backend:</strong> FastAPI with WebSocket support
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Speech Recognition:</strong> Google Speech Recognition API
            </Typography>
          </Grid>
          <Grid item size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" paragraph>
              <strong>Real-time Communication:</strong> WebSocket connection
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>State Management:</strong> Redux with persistent preferences
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Deployment:</strong> Google Cloud Run
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default VoiceTest;
