import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  Box,
  Divider
} from '@mui/material';
import fiLoginPopup from '../../../services/fiLoginPopup';

const FiLoginModal = ({ open, onClose, onSuccess, scenarioPhone = '8888888888' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [popupBlocked, setPopupBlocked] = useState(false);

  const handleLogin = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPopupBlocked(false);

    try {
      // First check if popups are supported
      const popupsAllowed = await fiLoginPopup.isPopupSupported();
      if (!popupsAllowed) {
        setPopupBlocked(true);
        setError('Please enable popups for this site to continue.');
        return;
      }

      console.log('Starting Fi login process...');
      const result = await fiLoginPopup.openLoginPopup(scenarioPhone);
      
      console.log('Fi login successful:', result);
      onSuccess(result);
      onClose();
    } catch (error) {
      console.error('Fi login error:', error);
      
      if (error.code === 'POPUP_BLOCKED') {
        setPopupBlocked(true);
        setError('Please enable popups and try again.');
      } else if (error.code === 'LOGIN_TIMEOUT') {
        setError('Login timed out. Please try again.');
      } else {
        setError(error.message || 'Failed to complete login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [scenarioPhone, onSuccess, onClose]);

  const handleClose = () => {
    fiLoginPopup.cleanup();
    setError(null);
    setPopupBlocked(false);
    onClose();
  };

  const handleRetry = () => {
    setError(null);
    setPopupBlocked(false);
    handleLogin();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Connect Your Fi Account (Optional)
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert 
            severity={popupBlocked ? "warning" : "error"}
            action={
              popupBlocked && (
                <Button 
                  color="inherit" 
                  size="small"
                  onClick={handleRetry}
                >
                  Try Again
                </Button>
              )
            }
            sx={{ mb: 2 }}
          >
            <AlertTitle>
              {popupBlocked ? 'Popup Blocked' : 'Error'}
            </AlertTitle>
            {error}
            {popupBlocked && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Look for the popup blocker icon in your browser's address bar.
              </Typography>
            )}
          </Alert>
        )}

        <Typography variant="body1" gutterBottom>
          Connect your Fi account to get personalized financial insights and recommendations.
        </Typography>
        
        <Box sx={{ my: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" color="primary">
            Benefits of connecting:
          </Typography>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>Get personalized portfolio analysis</li>
            <li>Receive spending pattern insights</li>
            <li>Track your financial goals</li>
            <li>Get tailored investment recommendations</li>
          </ul>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="body2" color="text.secondary">
          This is completely optional. You can still use the app without connecting your Fi account.
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Make sure popups are enabled for this site.
        </Typography>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Skip for Now
        </Button>
        <Button 
          onClick={handleLogin}
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect Fi Account'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FiLoginModal;
