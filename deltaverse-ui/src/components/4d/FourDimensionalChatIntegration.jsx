/**
 * 🌌 4D FINANCIAL CHAT INTEGRATION
 * Seamlessly integrates 4D experience with existing chat interface
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createReturnToFinancialHealthHandler, debugNavigation } from '../../utils/navigationUtils';
import {
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Chip,
  Tooltip,
  Zoom,
  Alert
} from '@mui/material';
import {
  Close as CloseIcon,
  FourK as FourDIcon,
  Timeline as TimeIcon,
  ThreeDRotation as SpatialIcon,
  Psychology as EmotionIcon,
  Science as QuantumIcon
} from '@mui/icons-material';

import FourDimensionalExperience from './FourDimensionalExperience';

const FourDimensionalChatIntegration = ({ 
  lastMessage, 
  fiMcpData, 
  isVisible = true,
  onExperienceComplete 
}) => {
  const navigate = useNavigate();
  const [show4DDialog, setShow4DDialog] = useState(false);
  const [is4DCapable, setIs4DCapable] = useState(false);
  const [experienceType, setExperienceType] = useState(null);

  // Handle return to dashboard - Environment-aware navigation
  const handleReturnToDashboard = () => {
    console.log('[4D Navigation] Closing 4D dialog and navigating to dashboard');
    setShow4DDialog(false);
    
    // Environment-aware navigation
    const isDevelopment = process.env.NODE_ENV === 'development';
    const targetRoute = '/dashboard';
    
    if (isDevelopment) {
      console.log('[4D Navigation] Development mode: navigating to', targetRoute);
    } else {
      console.log('[4D Navigation] Production mode: navigating to', targetRoute);
    }
    
    navigate(targetRoute);
  };

  // Handle back to 4D menu (close dialog and return to chat)
  const handleBackTo4DMenu = () => {
    console.log('[4D Navigation] Closing 4D dialog, returning to chat');
    setShow4DDialog(false);
  };

  // Check if message is 4D-capable
  useEffect(() => {
    if (lastMessage) {
      const capable = check4DCapability(lastMessage);
      setIs4DCapable(capable.isCapable);
      setExperienceType(capable.type);
    }
  }, [lastMessage]);

  /**
   * 🔍 Check if message can benefit from 4D experience
   */
  const check4DCapability = (message) => {
    const text = message.text?.toLowerCase() || '';
    
    // Financial decision queries
    if (/should i|can i afford|what if|how much|when will/i.test(text)) {
      return { isCapable: true, type: 'decision_simulation' };
    }
    
    // Future planning queries
    if (/future|retirement|goal|plan|years|age/i.test(text)) {
      return { isCapable: true, type: 'future_simulation' };
    }
    
    // Investment queries
    if (/invest|portfolio|returns|risk|market/i.test(text)) {
      return { isCapable: true, type: 'investment_simulation' };
    }
    
    // Emotional financial queries
    if (/stress|worried|anxious|confident|feel/i.test(text)) {
      return { isCapable: true, type: 'emotional_simulation' };
    }
    
    return { isCapable: false, type: null };
  };

  /**
   * 🚀 Launch 4D Experience
   */
  const launch4DExperience = () => {
    setShow4DDialog(true);
  };

  /**
   * 🔚 Handle Experience Complete
   */
  const handleExperienceComplete = (result) => {
    setShow4DDialog(false);
    onExperienceComplete?.(result);
  };

  if (!isVisible || !is4DCapable) {
    return null;
  }

  return (
    <>
      {/* 🌌 4D Experience Trigger Button */}
      <Zoom in={is4DCapable}>
        <Fab
          size="medium"
          onClick={launch4DExperience}
          sx={{
            position: 'fixed',
            bottom: 200,
            right: 24,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
              transform: 'scale(1.1)',
            },
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
            zIndex: 1000,
            animation: 'fourDPulse 2s ease-in-out infinite',
            '@keyframes fourDPulse': {
              '0%': { 
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                transform: 'scale(1)'
              },
              '50%': { 
                boxShadow: '0 12px 48px rgba(102, 126, 234, 0.6)',
                transform: 'scale(1.05)'
              },
              '100%': { 
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                transform: 'scale(1)'
              }
            }
          }}
        >
          <Tooltip title="🌌 Experience in 4D - Time, Space, Emotion & Quantum">
            <FourDIcon sx={{ fontSize: 28 }} />
          </Tooltip>
        </Fab>
      </Zoom>

      {/* 🎯 Experience Type Indicator */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 270,
          right: 24,
          zIndex: 999
        }}
      >
        <Zoom in={is4DCapable}>
          <Chip
            label={`4D ${experienceType?.replace('_', ' ').toUpperCase()}`}
            size="small"
            sx={{
              background: 'rgba(102, 126, 234, 0.9)',
              color: 'white',
              fontWeight: 'bold',
              animation: 'fadeInOut 3s ease-in-out infinite',
              '@keyframes fadeInOut': {
                '0%': { opacity: 0.7 },
                '50%': { opacity: 1 },
                '100%': { opacity: 0.7 }
              }
            }}
            icon={getExperienceIcon(experienceType)}
          />
        </Zoom>
      </Box>

      {/* 🌌 4D Experience Dialog */}
      <Dialog
        open={show4DDialog}
        onClose={() => setShow4DDialog(false)}
        maxWidth={false}
        fullScreen
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
            color: 'white'
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FourDIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5">
                4D Financial Experience
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Time • Space • Emotion • Quantum Probability
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label="REVOLUTIONARY"
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
            <IconButton
              onClick={() => setShow4DDialog(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, height: 'calc(100vh - 64px)' }}>
          {/* 🌟 4D Experience Notice */}
          <Alert
            severity="info"
            sx={{
              position: 'absolute',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1001,
              background: 'rgba(33, 150, 243, 0.9)',
              color: 'white',
              '& .MuiAlert-icon': { color: 'white' }
            }}
          >
            🌌 You are now experiencing the world's first 4D Financial Interface. 
            Navigate through time, space, emotions, and quantum possibilities!
          </Alert>

          {/* 🚀 Main 4D Experience */}
          <FourDimensionalExperience
            userQuery={lastMessage}
            fiMcpData={fiMcpData}
            onExperienceComplete={handleExperienceComplete}
            onReturnToDashboard={handleReturnToDashboard}
            onBackToComplex={handleBackTo4DMenu}
            biometricData={{
              heartRate: 72,
              stressLevel: 0.3,
              emotionalState: 'curious'
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

/**
 * 🎯 Get Experience Type Icon
 */
const getExperienceIcon = (type) => {
  const icons = {
    decision_simulation: <TimeIcon fontSize="small" />,
    future_simulation: <SpatialIcon fontSize="small" />,
    investment_simulation: <QuantumIcon fontSize="small" />,
    emotional_simulation: <EmotionIcon fontSize="small" />
  };
  
  return icons[type] || <FourDIcon fontSize="small" />;
};

export default FourDimensionalChatIntegration;
