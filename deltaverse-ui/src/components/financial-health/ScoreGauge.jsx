import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const GaugeContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '200px',
  height: '100px',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
}));

const GaugeBackground = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '200px',
  height: '200px',
  borderRadius: '50%',
  background: `conic-gradient(
    #e53935 0% 20%,
    #ff9800 20% 40%,
    #fdd835 40% 60%,
    #66bb6a 60% 80%,
    #43a047 80% 100%
  )`,
  bottom: 0,
}));

const GaugeMask = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '160px',
  height: '160px',
  borderRadius: '50%',
  background: theme.palette.background.paper,
  bottom: 0,
  left: '50%',
  transform: 'translateX(-50%)',
}));

const GaugeNeedle = styled(Box)(({ theme, rotation }) => ({
  position: 'absolute',
  width: '4px',
  height: '100px',
  background: theme.palette.text.primary,
  bottom: 0,
  left: '50%',
  transform: `translateX(-50%) rotate(${rotation}deg)`,
  transformOrigin: 'bottom center',
  transition: 'transform 1s ease-out',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: theme.palette.text.primary,
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
  },
}));

const ScoreText = styled(Typography)(({ theme, color }) => ({
  fontSize: '2rem',
  fontWeight: 'bold',
  color: color,
  marginTop: '60px',
  zIndex: 2,
}));

const ScoreLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  marginTop: '4px',
  zIndex: 2,
}));

const getScoreColor = (score) => {
  if (score >= 80) return '#43a047'; // Excellent
  if (score >= 70) return '#66bb6a'; // Good
  if (score >= 60) return '#fdd835'; // Fair
  if (score >= 40) return '#ff9800'; // Poor
  return '#e53935'; // Critical
};

const getScoreLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Critical';
};

const ScoreGauge = ({ score }) => {
  // Calculate needle rotation (0 = -90deg, 100 = 90deg)
  const rotation = -90 + (score / 100) * 180;
  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);
  
  return (
    <GaugeContainer>
      <GaugeBackground />
      <GaugeMask />
      <GaugeNeedle rotation={rotation} />
      <ScoreText color={scoreColor}>{Math.round(score)}</ScoreText>
      <ScoreLabel>{scoreLabel}</ScoreLabel>
    </GaugeContainer>
  );
};

export default ScoreGauge;
