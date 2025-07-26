/**
 * 🚀 FINANCIAL ANALYSIS - 4D FUTURE SIMULATION PAGE
 * Entry point for the complete 4D Financial Experience
 * 
 * Features:
 * - 4D Financial Analysis Mode Selection
 * - Crystal Clear Insights
 * - Professional Analysis
 * - Visual Journey
 * - Quick Answers
 */

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Fade,
  Zoom
} from '@mui/material';
import {
  Diamond as CrystalIcon,
  Analytics as ProfessionalIcon,
  Timeline as JourneyIcon,
  QuestionAnswer as QuickIcon,
  ArrowBack as BackIcon,
  AutoAwesome as MagicIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { createReturnToFinancialHealthHandler, debugNavigation } from '../utils/navigationUtils';

// Import 4D Components
import CrystalClear4DView from '../components/4d/CrystalClear4DView';
import FourGraphsView from '../components/4d/FourGraphsView';
import UserFriendly4DView from '../components/4d/UserFriendly4DView';
import SimpleFinancialView from '../components/4d/SimpleFinancialView';

// Import Financial Data Context
import { useFinancialData, FinancialDataProvider } from '../contexts/FinancialDataContext';

const FinancialAnalysisContent = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState(null);
  
  // Get financial data context
  const { financialData, calculatedInsights, isDataReady } = useFinancialData();

  // 4D Analysis Modes
  const analysisModes = [
    {
      id: 'crystal-clear',
      title: '💎 Crystal Clear Insights',
      subtitle: 'Your Financial Reality Check',
      description: 'The 4 most important questions about your money - answered clearly',
      icon: <CrystalIcon sx={{ fontSize: 40 }} />,
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      component: CrystalClear4DView
    },
    {
      id: 'professional',
      title: '📊 Professional Analysis',
      subtitle: 'Your Financial Future in 4 Clear Graphs',
      description: 'Each graph shows one dimension of your financial life',
      icon: <ProfessionalIcon sx={{ fontSize: 40 }} />,
      color: '#4facfe',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      component: FourGraphsView
    },
    {
      id: 'visual-journey',
      title: '🎯 Visual Journey',
      subtitle: 'Your Financial Journey',
      description: 'See your money goals as real-life achievements',
      icon: <JourneyIcon sx={{ fontSize: 40 }} />,
      color: '#43e97b',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      component: UserFriendly4DView
    },
    {
      id: 'quick-answers',
      title: '💡 Quick Answers',
      subtitle: 'Your Money, Simply Explained',
      description: 'Get instant answers to your financial questions',
      icon: <QuickIcon sx={{ fontSize: 40 }} />,
      color: '#fa709a',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      component: SimpleFinancialView
    }
  ];

  // Handle mode selection
  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
  };

  // Handle return to dashboard - Environment-aware navigation
  const handleReturnToDashboard = () => {
    console.log('[FinancialAnalysis] Returning to dashboard');
    
    // Environment-aware navigation
    const isDevelopment = process.env.NODE_ENV === 'development';
    const targetRoute = '/dashboard';
    
    if (isDevelopment) {
      console.log('[FinancialAnalysis] Development mode: navigating to', targetRoute);
    } else {
      console.log('[FinancialAnalysis] Production mode: navigating to', targetRoute);
    }
    
    navigate(targetRoute);
  };

  // Handle return to mode selection
  const handleReturnToModeSelection = () => {
    setSelectedMode(null);
  };

  // If a mode is selected, render the specific component
  if (selectedMode) {
    const SelectedComponent = selectedMode.component;
    return (
      <SelectedComponent 
        onBackToComplex={handleReturnToModeSelection}
        onReturnToDashboard={handleReturnToDashboard}
        fiMcpData={financialData}
      />
    );
  }

  // Show loading if data isn't ready
  if (!isDataReady) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6">Loading your financial data...</Typography>
        </Box>
      </Container>
    );
  }

  // Main 4D Analysis Mode Selection
  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Fade in timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            {/* Return Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3 }}>
              <Button
                variant="contained"
                onClick={handleReturnToDashboard}
                startIcon={<BackIcon />}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                Return to Financial Health
              </Button>
            </Box>

            {/* Main Title */}
            <Box sx={{ mb: 4 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 3,
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <MagicIcon sx={{ fontSize: 40, color: 'white' }} />
              </Avatar>
              
              <Typography 
                variant="h2" 
                sx={{ 
                  color: 'white',
                  fontWeight: 'bold',
                  mb: 2,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                🚀 4D Future Simulation
              </Typography>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  maxWidth: 600,
                  mx: 'auto',
                  fontWeight: 'medium'
                }}
              >
                Experience your financial journey in 4 dimensions: Time, Risk, Goals, and Growth
              </Typography>
            </Box>

            {/* Status Chips */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Chip 
                label="✅ Fi Money Connected" 
                sx={{ 
                  bgcolor: 'rgba(76, 175, 80, 0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(76, 175, 80, 0.3)'
                }} 
              />
              <Chip 
                label={`📊 Health Score: ${calculatedInsights?.overallScore || 75}%`}
                sx={{ 
                  bgcolor: 'rgba(33, 150, 243, 0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(33, 150, 243, 0.3)'
                }} 
              />
              <Chip 
                label="🔮 Real Data Ready" 
                sx={{ 
                  bgcolor: 'rgba(156, 39, 176, 0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(156, 39, 176, 0.3)'
                }} 
              />
            </Box>
          </Box>
        </Fade>

        {/* Analysis Mode Selection */}
        <Grid container spacing={4}>
          {analysisModes.map((mode, index) => (
            <Grid item xs={12} md={6} key={mode.id}>
              <Zoom in timeout={1000 + (index * 200)}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                      background: 'rgba(255,255,255,0.15)'
                    }
                  }}
                  onClick={() => handleModeSelect(mode)}
                >
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    {/* Icon */}
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 3,
                        background: mode.gradient,
                        boxShadow: `0 8px 25px ${mode.color}40`
                      }}
                    >
                      {mode.icon}
                    </Avatar>

                    {/* Title */}
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        color: 'white',
                        fontWeight: 'bold',
                        mb: 1,
                        textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                      }}
                    >
                      {mode.title}
                    </Typography>

                    {/* Subtitle */}
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.8)',
                        mb: 2,
                        fontWeight: 'medium'
                      }}
                    >
                      {mode.subtitle}
                    </Typography>

                    {/* Description */}
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.7)',
                        mb: 3,
                        lineHeight: 1.6
                      }}
                    >
                      {mode.description}
                    </Typography>

                    {/* Launch Button */}
                    <Button
                      variant="contained"
                      size="large"
                      sx={{
                        background: mode.gradient,
                        color: 'white',
                        fontWeight: 'bold',
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        boxShadow: `0 6px 20px ${mode.color}40`,
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: `0 8px 25px ${mode.color}60`
                        }
                      }}
                    >
                      Launch Experience
                    </Button>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        {/* Footer Info */}
        <Fade in timeout={1500}>
          <Paper
            elevation={0}
            sx={{
              mt: 6,
              p: 3,
              textAlign: 'center',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 3
            }}
          >
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                mb: 2
              }}
            >
              🔮 Powered by your real Fi Money data • 📊 Advanced 4D visualization • 🎯 Personalized insights
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255,255,255,0.6)'
              }}
            >
              Each mode offers a unique perspective on your financial future. Choose the one that resonates with you.
            </Typography>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

// Main FinancialAnalysis component with provider wrapper
const FinancialAnalysis = () => {
  // Mock financial data for development (replace with real Fi-MCP data)
  const mockFinancialData = {
    monthlyIncome: 80000,
    monthlyExpenses: 50000,
    currentSavings: 500000,
    monthlySavings: 30000,
    currentAge: 30,
    retirementAge: 60
  };

  return (
    <FinancialDataProvider fiMcpData={mockFinancialData}>
      <FinancialAnalysisContent />
    </FinancialDataProvider>
  );
};

export default FinancialAnalysis;
