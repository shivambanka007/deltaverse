import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Slide,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Mic as MicIcon,
  Close as CloseIcon,
  VoiceChat as VoiceChatIcon
} from '@mui/icons-material';
import InteractiveAIControlPanel from './InteractiveAIControlPanel';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const VoiceAssistantWidget = ({ 
  position = 'bottom-right',
  size = 'medium',
  showOnMobile = true 
}) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { isListening, confidence } = useSelector(state => state.aiVoice);

  // Don't show on mobile if disabled
  if (isMobile && !showOnMobile) {
    return null;
  }

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed',
      zIndex: 1000,
    };

    switch (position) {
      case 'bottom-right':
        return { ...baseStyles, bottom: 20, right: 20 };
      case 'bottom-left':
        return { ...baseStyles, bottom: 20, left: 20 };
      case 'top-right':
        return { ...baseStyles, top: 20, right: 20 };
      case 'top-left':
        return { ...baseStyles, top: 20, left: 20 };
      default:
        return { ...baseStyles, bottom: 20, right: 20 };
    }
  };

  const getFabSize = () => {
    switch (size) {
      case 'small':
        return 'small';
      case 'large':
        return 'large';
      default:
        return 'medium';
    }
  };

  const getFabColor = () => {
    if (isListening) {
      return confidence >= 70 ? '#4CAF50' : '#FF9800';
    }
    return '#2196F3';
  };

  const handleToggle = () => {
    setOpen(!open);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        size={getFabSize()}
        onClick={handleToggle}
        sx={{
          ...getPositionStyles(),
          backgroundColor: getFabColor(),
          '&:hover': {
            backgroundColor: getFabColor(),
            transform: 'scale(1.1)',
          },
          transition: 'all 0.3s ease',
          boxShadow: isListening 
            ? `0 0 20px ${getFabColor()}40`
            : '0 4px 20px rgba(0,0,0,0.3)',
          animation: isListening ? 'pulse 2s infinite' : 'none',
          '@keyframes pulse': {
            '0%': {
              boxShadow: `0 0 0 0 ${getFabColor()}40`,
            },
            '70%': {
              boxShadow: `0 0 0 10px ${getFabColor()}00`,
            },
            '100%': {
              boxShadow: `0 0 0 0 ${getFabColor()}00`,
            },
          },
        }}
      >
        {isListening ? <MicIcon /> : <VoiceChatIcon />}
      </Fab>

      {/* Voice Assistant Dialog */}
      <Dialog
        open={open}
        onClose={handleToggle}
        TransitionComponent={Transition}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            minHeight: isMobile ? '100vh' : '600px',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          AI Voice Assistant
          <IconButton
            onClick={handleToggle}
            size="small"
            sx={{ 
              color: 'grey.500',
              '&:hover': {
                backgroundColor: 'grey.100'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 2 }}>
            <InteractiveAIControlPanel />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VoiceAssistantWidget;
