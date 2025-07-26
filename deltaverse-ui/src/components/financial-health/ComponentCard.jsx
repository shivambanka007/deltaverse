import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  LinearProgress, 
  Tooltip, 
  IconButton 
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';

const StyledLinearProgress = styled(LinearProgress)(({ theme, status }) => {
  const colorMap = {
    excellent: theme.palette.success.main,
    good: theme.palette.success.light,
    fair: theme.palette.warning.main,
    poor: theme.palette.warning.dark,
    critical: theme.palette.error.main,
    unknown: theme.palette.grey[500],
  };
  
  return {
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.palette.grey[200],
    '& .MuiLinearProgress-bar': {
      backgroundColor: colorMap[status] || theme.palette.primary.main,
    },
  };
});

const ComponentCard = ({ component }) => {
  const { name, score, description, status, data_points } = component;
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'success.dark';
      case 'good': return 'success.main';
      case 'fair': return 'warning.main';
      case 'poor': return 'warning.dark';
      case 'critical': return 'error.main';
      default: return 'text.secondary';
    }
  };
  
  const formatDataPoints = (dataPoints) => {
    return Object.entries(dataPoints).map(([key, value]) => {
      // Format keys by replacing underscores with spaces and capitalizing
      const formattedKey = key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Format values based on type
      let formattedValue = value;
      if (typeof value === 'number') {
        if (key.includes('ratio') || key.includes('rate')) {
          formattedValue = `${(value * 100).toFixed(1)}%`;
        } else if (value >= 1000) {
          formattedValue = `₹${value.toLocaleString()}`;
        }
      }
      
      return `${formattedKey}: ${formattedValue}`;
    }).join('\n');
  };
  
  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" component="div">
            {name}
          </Typography>
          <Tooltip title={formatDataPoints(data_points)} arrow placement="top">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body1" fontWeight="bold" sx={{ mr: 1 }}>
            {Math.round(score)}
          </Typography>
          <Box sx={{ flexGrow: 1 }}>
            <StyledLinearProgress 
              variant="determinate" 
              value={score} 
              status={status}
            />
          </Box>
        </Box>
        
        <Typography 
          variant="body2" 
          sx={{ 
            textTransform: 'capitalize', 
            color: getStatusColor(status),
            fontWeight: 'medium'
          }}
        >
          {status}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ComponentCard;
