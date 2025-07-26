/**
 * 🎯 USER-FRIENDLY 4D FINANCIAL VISUALIZATION
 * Solution Architect Approach: 60 Years of Experience
 * 
 * Transforms complex 4D concepts into understandable real-world metaphors
 * Uses story-based visualization instead of abstract graphics
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Slider,
  Grid,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import {
  Home as HouseIcon,
  DirectionsCar as CarIcon,
  School as EducationIcon,
  BeachAccess as RetirementIcon,
  Favorite as HealthIcon,
  Flight as VacationIcon,
  TrendingUp as GrowthIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

// Import the centralized financial data context
import { useFinancialData } from '../../contexts/FinancialDataContext';

// Import the simple report generator
import { handleSimpleReportDownload } from '../../utils/simpleReportGenerator';

import { debugNavigation } from '../../utils/navigationUtils';

const UserFriendly4DView = ({ fiMcpData, onBackToComplex, onReturnToDashboard }) => {
  // Debug navigation props
  React.useEffect(() => {
    debugNavigation('UserFriendly4DView', { onBackToComplex, onReturnToDashboard });
  }, [onBackToComplex, onReturnToDashboard]);
  // 🎯 Use centralized financial data (always in sync)
  const { 
    financialData, 
    calculatedInsights, 
    isDataReady 
  } = useFinancialData();

  // 🎯 User-friendly state management
  const [currentAge, setCurrentAge] = useState(30);
  const [selectedGoal, setSelectedGoal] = useState('house');
  const [timelinePosition, setTimelinePosition] = useState(2024);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGoalDetails, setShowGoalDetails] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('current');

  // 🏠 Real financial data with user-friendly calculations
  const monthlyIncome = financialData?.monthlyIncome || fiMcpData?.monthly_income || 80000;
  const monthlyExpenses = financialData?.monthlyExpenses || fiMcpData?.monthly_expenses || 50000;
  const currentSavings = financialData?.currentSavings || fiMcpData?.savings || 500000;
  const monthlySavings = monthlyIncome - monthlyExpenses;

  // 🎯 Life Goals with Real-World Context
  const lifeGoals = {
    house: {
      icon: <HouseIcon sx={{ fontSize: 40, color: '#2196F3' }} />,
      title: 'Dream Home',
      target: 5000000, // ₹50L
      current: currentSavings,
      timeNeeded: Math.ceil((5000000 - currentSavings) / (monthlySavings * 12)),
      monthlyNeed: Math.ceil((5000000 - currentSavings) / (5 * 12)),
      description: 'Your own 3BHK apartment',
      visual: '🏠',
      color: '#2196F3'
    },
    car: {
      icon: <CarIcon sx={{ fontSize: 40, color: '#4CAF50' }} />,
      title: 'New Car',
      target: 1200000, // ₹12L
      current: currentSavings * 0.3,
      timeNeeded: Math.ceil((1200000 - currentSavings * 0.3) / (monthlySavings * 12)),
      monthlyNeed: Math.ceil((1200000 - currentSavings * 0.3) / (2 * 12)),
      description: 'Honda City or similar',
      visual: '🚗',
      color: '#4CAF50'
    },
    education: {
      icon: <EducationIcon sx={{ fontSize: 40, color: '#FF9800' }} />,
      title: "Child's Education",
      target: 2500000, // ₹25L
      current: currentSavings * 0.2,
      timeNeeded: 15, // 15 years for child education
      monthlyNeed: Math.ceil((2500000 - currentSavings * 0.2) / (15 * 12)),
      description: 'Engineering/Medical college',
      visual: '🎓',
      color: '#FF9800'
    },
    retirement: {
      icon: <RetirementIcon sx={{ fontSize: 40, color: '#9C27B0' }} />,
      title: 'Retirement Fund',
      target: 20000000, // ₹2Cr
      current: currentSavings,
      timeNeeded: 30, // 30 years to retirement
      monthlyNeed: Math.ceil((20000000 - currentSavings) / (30 * 12)),
      description: 'Comfortable retirement life',
      visual: '🏖️',
      color: '#9C27B0'
    },
    vacation: {
      icon: <VacationIcon sx={{ fontSize: 40, color: '#E91E63' }} />,
      title: 'Dream Vacation',
      target: 300000, // ₹3L
      current: monthlySavings * 2,
      timeNeeded: 1,
      monthlyNeed: 25000,
      description: 'Europe trip for family',
      visual: '✈️',
      color: '#E91E63'
    }
  };

  // 📅 Life Timeline with Real Events
  const lifeTimeline = [
    { age: 25, year: 2024, event: 'Career Start', money: '₹5L', icon: '💼', status: 'completed' },
    { age: 30, year: 2029, event: 'Marriage', money: '₹15L', icon: '💑', status: 'current' },
    { age: 32, year: 2031, event: 'New Car', money: '₹12L', icon: '🚗', status: 'planned' },
    { age: 35, year: 2034, event: 'Dream House', money: '₹50L', icon: '🏠', status: 'planned' },
    { age: 40, year: 2039, event: 'Child Education', money: '₹25L', icon: '🎓', status: 'planned' },
    { age: 50, year: 2049, event: 'Health Insurance', money: '₹10L', icon: '🏥', status: 'planned' },
    { age: 60, year: 2059, event: 'Retirement', money: '₹2Cr', icon: '🏖️', status: 'planned' }
  ];

  // 🎮 Interactive Scenarios
  const scenarios = {
    current: { label: 'Current Plan', savings: monthlySavings, color: '#2196F3' },
    optimistic: { label: 'Save More (+₹10k)', savings: monthlySavings + 10000, color: '#4CAF50' },
    conservative: { label: 'Save Less (-₹5k)', savings: monthlySavings - 5000, color: '#FF9800' }
  };

  // 🎯 Calculate Goal Progress
  const calculateProgress = (goal) => {
    const progress = (goal.current / goal.target) * 100;
    return Math.min(progress, 100);
  };

  // 🎨 Get Status Color
  const getStatusColor = (goal) => {
    const progress = calculateProgress(goal);
    if (progress >= 80) return '#4CAF50'; // Green
    if (progress >= 50) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  // ⏰ Auto-play timeline
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimelinePosition(prev => {
          if (prev >= 2060) {
            setIsPlaying(false);
            return 2024;
          }
          return prev + 1;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // 🎯 Handle Goal Selection
  const handleGoalClick = (goalKey) => {
    setSelectedGoal(goalKey);
    setShowGoalDetails(true);
  };

  // 📊 Render Goal Card
  const renderGoalCard = (goalKey, goal) => {
    const progress = calculateProgress(goal);
    const statusColor = getStatusColor(goal);
    const isAffordable = goal.monthlyNeed <= monthlySavings;

    return (
      <Card
        key={goalKey}
        sx={{
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          },
          border: selectedGoal === goalKey ? `2px solid ${goal.color}` : '1px solid #e0e0e0'
        }}
        onClick={() => handleGoalClick(goalKey)}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {goal.icon}
            <Box sx={{ ml: 2, flex: 1 }}>
              <Typography variant="h6">{goal.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {goal.description}
              </Typography>
            </Box>
            <Chip
              label={isAffordable ? 'Achievable' : 'Need More'}
              color={isAffordable ? 'success' : 'warning'}
              size="small"
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Progress</Typography>
              <Typography variant="body2" fontWeight="bold">
                {progress.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#f0f0f0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: statusColor
                }
              }}
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Target</Typography>
              <Typography variant="body2" fontWeight="bold">
                ₹{(goal.target / 100000).toFixed(1)}L
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">Monthly Need</Typography>
              <Typography variant="body2" fontWeight="bold" color={statusColor}>
                ₹{(goal.monthlyNeed / 1000).toFixed(0)}k
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // 📅 Render Timeline
  const renderTimeline = () => {
    return (
      <Box sx={{ position: 'relative', py: 3 }}>
        <Typography variant="h6" gutterBottom textAlign="center">
          📅 Your Life Journey
        </Typography>
        
        {/* Timeline Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, gap: 2 }}>
          <Button
            variant={isPlaying ? 'contained' : 'outlined'}
            onClick={() => setIsPlaying(!isPlaying)}
            startIcon={isPlaying ? <PauseIcon /> : <PlayIcon />}
          >
            {isPlaying ? 'Pause' : 'Play'} Journey
          </Button>
          <Typography variant="body1" sx={{ alignSelf: 'center' }}>
            Year: {timelinePosition}
          </Typography>
        </Box>

        {/* Timeline Slider */}
        <Box sx={{ px: 3, mb: 3 }}>
          <Slider
            value={timelinePosition}
            min={2024}
            max={2060}
            onChange={(_, value) => setTimelinePosition(value)}
            marks={lifeTimeline.map(item => ({
              value: item.year,
              label: `${item.age}`
            }))}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}`}
          />
        </Box>

        {/* Timeline Events */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          {lifeTimeline.map((event, index) => {
            const isActive = timelinePosition >= event.year;
            const isCurrent = Math.abs(timelinePosition - event.year) <= 1;
            
            return (
              <Paper
                key={index}
                elevation={isCurrent ? 8 : 2}
                sx={{
                  p: 2,
                  textAlign: 'center',
                  minWidth: 120,
                  backgroundColor: isActive ? '#e3f2fd' : '#f5f5f5',
                  border: isCurrent ? '2px solid #2196F3' : 'none',
                  transform: isCurrent ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s ease'
                }}
              >
                <Typography variant="h4" sx={{ mb: 1 }}>
                  {event.icon}
                </Typography>
                <Typography variant="subtitle2" fontWeight="bold">
                  Age {event.age}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {event.event}
                </Typography>
                <Typography variant="caption" color="primary" fontWeight="bold">
                  {event.money}
                </Typography>
              </Paper>
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ 
      width: '100%',
      height: '100vh',
      overflowY: 'auto', // Enable vertical scrolling
      overflowX: 'hidden', // Prevent horizontal scroll
      bgcolor: '#f0f2f5',
      position: 'relative'
    }}>
      <Box sx={{ 
        p: 3, 
        maxWidth: 1200, 
        mx: 'auto', 
        minHeight: '100vh',
        paddingBottom: 6 // Extra padding for complete visibility
      }}>
      {/* Header with Return Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        {/* Return Button - Left Side */}
        <Button
          variant="contained"
          onClick={onReturnToDashboard}
          startIcon={<span>←</span>}
          sx={{
            bgcolor: '#667eea',
            color: 'white',
            fontWeight: 'bold',
            px: 3,
            py: 1.5,
            borderRadius: 3,
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease',
            '&:hover': { 
              bgcolor: '#5a67d8',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
            }
          }}
        >
          Return to Dashboard
        </Button>
        
        {/* Title - Center */}
        <Box sx={{ textAlign: 'center', flex: 1 }}>
          <Typography 
            variant="h3" 
            gutterBottom
            sx={{ 
              color: '#1a1a1a', 
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            🎯 Your Financial Journey
          </Typography>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              color: '#424242',
              fontWeight: 'medium'
            }}
          >
            See your money goals as real-life achievements
          </Typography>
        </Box>

        {/* Download Button - Right Side */}
        <Button
          variant="contained"
          color="success"
          startIcon={<DownloadIcon />}
          onClick={() => handleSimpleReportDownload('visual-journey', financialData, calculatedInsights)}
          sx={{
            fontWeight: 'bold',
            px: 3,
            py: 1.5,
            borderRadius: 3,
            boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
            '&:hover': { 
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)'
            }
          }}
        >
          Download Report
        </Button>
      </Box>

      {/* Scenario Selector */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 4 }}>
        {Object.entries(scenarios).map(([key, scenario]) => (
          <Button
            key={key}
            variant={selectedScenario === key ? 'contained' : 'outlined'}
            onClick={() => setSelectedScenario(key)}
            sx={{ color: scenario.color }}
          >
            {scenario.label}
          </Button>
        ))}
      </Box>

      {/* Life Timeline */}
      <Paper elevation={3} sx={{ mb: 4, p: 3 }}>
        {renderTimeline()}
      </Paper>

      {/* Financial Goals Grid */}
      <Typography variant="h5" gutterBottom textAlign="center">
        🎯 Your Money Goals
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Object.entries(lifeGoals).map(([key, goal]) => (
          <Grid item xs={12} sm={6} md={4} key={key}>
            {renderGoalCard(key, goal)}
          </Grid>
        ))}
      </Grid>

      {/* Current Status Summary */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          📊 Your Current Financial Health
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                ₹{(monthlyIncome / 1000).toFixed(0)}k
              </Typography>
              <Typography variant="body2">Monthly Income</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="secondary">
                ₹{(monthlySavings / 1000).toFixed(0)}k
              </Typography>
              <Typography variant="body2">Monthly Savings</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                ₹{(currentSavings / 100000).toFixed(1)}L
              </Typography>
              <Typography variant="body2">Current Savings</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {Math.ceil((20000000 - currentSavings) / (monthlySavings * 12))} years
              </Typography>
              <Typography variant="body2">To Retirement</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
        <Button
          variant="contained"
          onClick={onBackToComplex}
          startIcon={<span>←</span>}
          size="large"
          sx={{
            bgcolor: '#FF9800',
            '&:hover': { bgcolor: '#F57C00' }
          }}
        >
          Back to 4D Menu
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<GrowthIcon />}
          size="large"
        >
          Optimize My Plan
        </Button>
      </Box>

      {/* Goal Details Dialog */}
      <Dialog
        open={showGoalDetails}
        onClose={() => setShowGoalDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedGoal && lifeGoals[selectedGoal] && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {lifeGoals[selectedGoal].icon}
              <Typography variant="h5">
                {lifeGoals[selectedGoal].title}
              </Typography>
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          {selectedGoal && lifeGoals[selectedGoal] && (
            <Box>
              <Typography variant="body1" paragraph>
                {lifeGoals[selectedGoal].description}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="h6">Target Amount</Typography>
                  <Typography variant="h4" color="primary">
                    ₹{(lifeGoals[selectedGoal].target / 100000).toFixed(1)}L
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6">Monthly Savings Needed</Typography>
                  <Typography variant="h4" color="secondary">
                    ₹{(lifeGoals[selectedGoal].monthlyNeed / 1000).toFixed(0)}k
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>Progress</Typography>
                <LinearProgress
                  variant="determinate"
                  value={calculateProgress(lifeGoals[selectedGoal])}
                  sx={{ height: 10, borderRadius: 5 }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {calculateProgress(lifeGoals[selectedGoal]).toFixed(1)}% Complete
                </Typography>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>Recommendations</Typography>
                <Typography variant="body1">
                  {lifeGoals[selectedGoal].monthlyNeed <= monthlySavings
                    ? `✅ Great! You're on track to achieve this goal in ${lifeGoals[selectedGoal].timeNeeded} years.`
                    : `⚠️ You need to save ₹${((lifeGoals[selectedGoal].monthlyNeed - monthlySavings) / 1000).toFixed(0)}k more per month to reach this goal.`
                  }
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
      </Box>
    </Box>
  );
};

export default UserFriendly4DView;
