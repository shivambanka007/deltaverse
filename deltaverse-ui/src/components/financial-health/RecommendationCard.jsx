import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Button, 
  Collapse, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText 
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { styled } from '@mui/material/styles';

const ImpactChip = styled(Chip)(({ theme, impact }) => {
  const colorMap = {
    high: theme.palette.error.main,
    medium: theme.palette.warning.main,
    low: theme.palette.success.main,
  };
  
  return {
    backgroundColor: colorMap[impact] || theme.palette.primary.main,
    color: theme.palette.common.white,
    fontWeight: 'bold',
  };
});

const DifficultyChip = styled(Chip)(({ theme, difficulty }) => {
  const colorMap = {
    easy: theme.palette.success.main,
    moderate: theme.palette.warning.main,
    challenging: theme.palette.error.main,
  };
  
  return {
    backgroundColor: theme.palette.grey[100],
    color: colorMap[difficulty] || theme.palette.text.primary,
    border: `1px solid ${colorMap[difficulty] || theme.palette.divider}`,
  };
});

const RecommendationCard = ({ recommendation }) => {
  const [expanded, setExpanded] = useState(false);
  const { title, description, impact, difficulty, potential_improvement, action_steps, category } = recommendation;
  
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };
  
  return (
    <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="div" sx={{ mb: 1 }}>
            {title}
          </Typography>
          <Box>
            <TrendingUpIcon color="primary" />
          </Box>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <ImpactChip 
            label={`Impact: ${impact}`} 
            size="small" 
            impact={impact} 
          />
          <DifficultyChip 
            label={`Difficulty: ${difficulty}`} 
            size="small" 
            difficulty={difficulty} 
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AssignmentIcon color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Category: {category.split('_').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" fontWeight="medium" color="primary">
            Potential improvement: +{potential_improvement} points
          </Typography>
          <Button 
            endIcon={<ArrowForwardIcon />} 
            onClick={handleExpandClick}
            size="small"
          >
            {expanded ? 'Hide Steps' : 'Show Steps'}
          </Button>
        </Box>
        
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <List dense sx={{ mt: 1 }}>
            {action_steps.map((step, index) => (
              <ListItem key={index} disablePadding>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircleOutlineIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={step} />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;
