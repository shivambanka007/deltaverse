/**
 * 💎 CRYSTAL CLEAR 4D FINANCIAL VISUALIZATION
 * Expert Solution: Remove confusion, maximize impact
 * 
 * FOCUS: What you need to know about your money
 * REMOVE: Technical jargon and useless controls
 * RESULT: Clear, actionable financial insights
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  Divider
} from '@mui/material';
import {
  TrendingUp as GrowthIcon,
  Warning as RiskIcon,
  CheckCircle as SuccessIcon,
  Info as InfoIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

// Import the centralized financial data context
import { useFinancialData } from '../../contexts/FinancialDataContext';

// Import the simple report generator
import { handleSimpleReportDownload } from '../../utils/simpleReportGenerator';

import { debugNavigation } from '../../utils/navigationUtils';

const CrystalClear4DView = ({ onBackToComplex, onReturnToDashboard }) => {
  const navigate = useNavigate(); // Add backup navigation
  
  // Debug navigation props
  React.useEffect(() => {
    debugNavigation('CrystalClear4DView', { onBackToComplex, onReturnToDashboard });
  }, [onBackToComplex, onReturnToDashboard]);
  // 🎯 Use centralized financial data (always in sync)
  const { 
    financialData, 
    calculatedInsights, 
    isDataReady,
    monthlySavings 
  } = useFinancialData();

  // Show loading if data isn't ready
  if (!isDataReady) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Loading your financial insights...</Typography>
      </Box>
    );
  }

  const { monthlyIncome, monthlyExpenses, currentSavings } = financialData;
  const { retirement, goals, risks, cashFlow } = calculatedInsights;

  return (
    <Box sx={{ 
      width: '100%',
      height: '100vh',
      overflowY: 'auto', // Enable vertical scrolling
      overflowX: 'hidden', // Prevent horizontal scroll
      bgcolor: '#f8f9fa',
      position: 'relative'
    }}>
      <Box sx={{ 
        p: 3, 
        maxWidth: 1200, 
        mx: 'auto', 
        minHeight: '100vh',
        paddingBottom: 6 // Extra padding at bottom for complete visibility
      }}>
      {/* Enhanced Header with Return Button */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: 4,
        flexWrap: 'wrap',
        gap: 2
      }}>
        {/* Return Button - Left Side */}
        <Button
          variant="contained"
          onClick={() => {
            console.log('🔍 [CrystalClear4DView] Return to Dashboard clicked');
            console.log('🔍 [CrystalClear4DView] onReturnToDashboard type:', typeof onReturnToDashboard);
            console.log('🔍 [CrystalClear4DView] Current URL:', window.location.href);
            
            if (onReturnToDashboard) {
              console.log('🔍 [CrystalClear4DView] Calling onReturnToDashboard...');
              try {
                onReturnToDashboard();
                console.log('✅ [CrystalClear4DView] onReturnToDashboard called successfully');
              } catch (error) {
                console.error('❌ [CrystalClear4DView] Error calling onReturnToDashboard:', error);
              }
            } else {
              console.error('❌ [CrystalClear4DView] onReturnToDashboard is not provided!');
              
              // Fallback navigation using useNavigate hook
              console.log('🔄 [CrystalClear4DView] Attempting fallback navigation...');
              try {
                navigate('/financial-health');
                console.log('✅ [CrystalClear4DView] Fallback navigation initiated');
              } catch (navigateError) {
                console.error('❌ [CrystalClear4DView] useNavigate failed:', navigateError);
                
                // Last resort: window.location
                try {
                  window.location.href = '/financial-health';
                  console.log('✅ [CrystalClear4DView] Last resort navigation initiated');
                } catch (fallbackError) {
                  console.error('❌ [CrystalClear4DView] All navigation methods failed:', fallbackError);
                }
              }
            }
          }}
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
              fontWeight: 'bold', 
              color: '#1a1a1a',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            💎 Your Financial Reality Check
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#424242', 
              maxWidth: 600, 
              mx: 'auto',
              fontWeight: 'medium'
            }}
          >
            The 4 most important questions about your money - answered clearly
          </Typography>
        </Box>

        {/* Download Button - Right Side */}
        <Button
          variant="contained"
          color="success"
          startIcon={<DownloadIcon />}
          onClick={() => handleSimpleReportDownload('crystal-clear', financialData, calculatedInsights)}
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

      {/* Current Financial Status */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: '#fff' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          📊 Your Current Financial Snapshot
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                ₹{(monthlyIncome/1000).toFixed(0)}k
              </Typography>
              <Typography variant="body2">Monthly Income</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#ffebee', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                ₹{(monthlyExpenses/1000).toFixed(0)}k
              </Typography>
              <Typography variant="body2">Monthly Expenses</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e8f5e8', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                ₹{(monthlySavings/1000).toFixed(0)}k
              </Typography>
              <Typography variant="body2">Monthly Savings</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                ₹{(currentSavings/100000).toFixed(1)}L
              </Typography>
              <Typography variant="body2">Total Savings</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* The 4 Critical Financial Questions */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        
        {/* 1. RETIREMENT QUESTION */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: 'auto', minHeight: 480, bgcolor: '#fff', mb: { xs: 2, lg: 0 } }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <GrowthIcon sx={{ fontSize: 40, color: '#2196F3', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  1. RETIREMENT READINESS
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem' }}>
                {retirement.question}
              </Typography>
              
              <Alert severity={retirement.color} sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {retirement.status}
                </Typography>
                <Typography variant="body2">
                  At 60, you'll have ₹{(retirement.projectedAmount/10000000).toFixed(1)} Crores
                </Typography>
              </Alert>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>Progress to ₹2 Crore Goal</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={retirement.progressPercentage}
                  sx={{ height: 10, borderRadius: 5 }}
                  color={retirement.color === 'success' ? 'success' : 'warning'}
                />
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {retirement.progressPercentage.toFixed(0)}% of target
                </Typography>
              </Box>
              
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                💡 Action: {retirement.recommendation}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 2. GOALS QUESTION */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: 'auto', minHeight: 480, bgcolor: '#fff', mb: { xs: 2, lg: 0 } }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SuccessIcon sx={{ fontSize: 40, color: '#4CAF50', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  2. LIFE GOALS PROGRESS
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem' }}>
                {goals.question}
              </Typography>
              
              <Alert severity={goals.color} sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {goals.status}
                </Typography>
                <Typography variant="body2">
                  {goals.recommendation}
                </Typography>
              </Alert>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" gutterBottom sx={{ fontWeight: 'medium', mb: 2 }}>
                  Goal Progress:
                </Typography>
                {[goals.emergencyGoal, goals.houseGoal, goals.educationGoal].map((goal, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{goal.name}</Typography>
                      <Chip 
                        size="small" 
                        label={`${((goal.current / goal.target) * 100).toFixed(0)}%`}
                        color={(goal.current / goal.target) > 0.5 ? 'success' : 'warning'}
                      />
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((goal.current / goal.target) * 100, 100)}
                      sx={{ height: 8, borderRadius: 4, mb: 1 }}
                      color={(goal.current / goal.target) > 0.5 ? 'success' : 'warning'}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Target: ₹{(goal.target/100000).toFixed(1)}L | 
                      Current: ₹{(goal.current/100000).toFixed(1)}L | 
                      Remaining: ₹{((goal.target - goal.current)/100000).toFixed(1)}L
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 3. RISK QUESTION */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: 'auto', minHeight: 480, bgcolor: '#fff', mb: { xs: 2, lg: 0 } }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <RiskIcon sx={{ fontSize: 40, color: '#FF9800', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  3. FINANCIAL RISKS
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem' }}>
                {risks.question}
              </Typography>
              
              <Alert severity={risks.color} sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {risks.status}
                </Typography>
                <Typography variant="body2">
                  {risks.recommendation}
                </Typography>
              </Alert>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" gutterBottom sx={{ fontWeight: 'medium', mb: 2 }}>
                  Risk Assessment:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2, 
                      bgcolor: risks.marketRisk === 'HIGH' ? '#ffebee' : '#e8f5e8', 
                      borderRadius: 2,
                      minHeight: 80,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="h6" sx={{ 
                        color: risks.marketRisk === 'HIGH' ? '#d32f2f' : '#388e3c',
                        fontWeight: 'bold',
                        mb: 1
                      }}>
                        {risks.marketRisk}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        Market Risk
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2, 
                      bgcolor: risks.inflationRisk === 'HIGH' ? '#ffebee' : '#e8f5e8', 
                      borderRadius: 2,
                      minHeight: 80,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="h6" sx={{ 
                        color: risks.inflationRisk === 'HIGH' ? '#d32f2f' : '#388e3c',
                        fontWeight: 'bold',
                        mb: 1
                      }}>
                        {risks.inflationRisk}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        Inflation Risk
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 2, 
                      bgcolor: risks.emergencyRisk === 'HIGH' ? '#ffebee' : '#e8f5e8', 
                      borderRadius: 2,
                      minHeight: 80,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="h6" sx={{ 
                        color: risks.emergencyRisk === 'HIGH' ? '#d32f2f' : '#388e3c',
                        fontWeight: 'bold',
                        mb: 1
                      }}>
                        {risks.emergencyRisk}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        Emergency Risk
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 4. CASH FLOW QUESTION */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: 'auto', minHeight: 480, bgcolor: '#fff', mb: { xs: 2, lg: 0 } }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InfoIcon sx={{ fontSize: 40, color: '#9C27B0', mr: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  4. MONEY EFFICIENCY
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem' }}>
                {cashFlow.question}
              </Typography>
              
              <Alert severity={cashFlow.color} sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {cashFlow.status}
                </Typography>
                <Typography variant="body2">
                  {cashFlow.recommendation}
                </Typography>
              </Alert>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom sx={{ fontWeight: 'medium' }}>
                  Savings Rate: {cashFlow.savingsRate.toFixed(0)}% (Target: 30%)
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min((cashFlow.savingsRate / 30) * 100, 100)}
                  sx={{ 
                    height: 12, 
                    borderRadius: 6,
                    backgroundColor: '#f0f0f0',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 6
                    }
                  }}
                  color={cashFlow.color === 'success' ? 'success' : cashFlow.color === 'info' ? 'info' : 'warning'}
                />
                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
                  {cashFlow.savingsRate >= 30 ? 'Excellent savings rate!' : 
                   cashFlow.savingsRate >= 20 ? 'Good savings rate, try to reach 30%' : 
                   'Increase your savings rate for better financial health'}
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-around', 
                p: 3, 
                bgcolor: '#f8f9fa', 
                borderRadius: 2,
                border: '1px solid #e9ecef'
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                    ₹{(monthlySavings/1000).toFixed(0)}k
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>
                    You Save Monthly
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                    ₹{(cashFlow.monthlyGap/1000).toFixed(0)}k
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>
                    Gap to Ideal (30%)
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Crystal Clear Action Plan */}
      <Paper elevation={3} sx={{ p: 3, mt: 4, mb: 4, bgcolor: '#fff' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          🎯 Your 3-Step Action Plan
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 3, bgcolor: '#e3f2fd', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ mb: 2 }}>1️⃣</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Build Emergency Fund</Typography>
              <Typography variant="body2">
                Save ₹{Math.max(0, Math.ceil((300000 - currentSavings * 0.6) / 1000))}k more for 6 months of expenses
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 3, bgcolor: '#e8f5e8', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ mb: 2 }}>2️⃣</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Increase Savings Rate</Typography>
              <Typography variant="body2">
                Try to save ₹{Math.ceil((monthlyIncome * 0.3) / 1000)}k per month (30% of income)
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 3, bgcolor: '#fff3e0', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ mb: 2 }}>3️⃣</Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>Invest for Growth</Typography>
              <Typography variant="body2">
                Put ₹{Math.ceil(monthlySavings * 0.7 / 1000)}k in mutual funds for long-term growth
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Bottom Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4, mb: 6 }}>
        <Button
          variant="contained"
          onClick={onBackToComplex}
          startIcon={<span>←</span>}
          size="large"
          sx={{ bgcolor: '#2196F3', '&:hover': { bgcolor: '#1976D2' } }}
        >
          Back to Menu
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={<DownloadIcon />}
          onClick={() => handleSimpleReportDownload('crystal-clear', financialData, calculatedInsights)}
          size="large"
        >
          Download Report
        </Button>
        <Button
          variant="contained"
          color="warning"
          startIcon={<span>🎯</span>}
          size="large"
        >
          Get Personal Advice
        </Button>
      </Box>
      </Box>
    </Box>
  );
};

export default CrystalClear4DView;
