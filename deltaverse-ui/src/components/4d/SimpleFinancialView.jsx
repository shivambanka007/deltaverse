/**
 * 💡 SIMPLE FINANCIAL VIEW
 * What normal people actually need to see about their money
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Button,
  Grid,
  Chip,
  Divider,
  Avatar,
  Slider
} from '@mui/material';
import {
  TrendingUp as GrowthIcon,
  Home as HouseIcon,
  Security as SafetyIcon,
  Warning as WarningIcon,
  Download as DownloadIcon,
  Timeline as TimelineIcon,
  PieChart as PieIcon,
  BarChart as BarIcon,
  ShowChart as LineIcon
} from '@mui/icons-material';

// Import Chart.js components for 4D visualizations
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Import the centralized financial data context
import { useFinancialData } from '../../contexts/FinancialDataContext';

// Import the simple report generator
import { handleSimpleReportDownload } from '../../utils/simpleReportGenerator';
import { debugNavigation } from '../../utils/navigationUtils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SimpleFinancialView = ({ onBackToComplex, onReturnToDashboard }) => {
  const navigate = useNavigate(); // Add backup navigation
  
  // Debug navigation props
  React.useEffect(() => {
    debugNavigation('SimpleFinancialView', { onBackToComplex, onReturnToDashboard });
  }, [onBackToComplex, onReturnToDashboard]);
  // 🎮 State hooks must be called before any conditional returns
  const [selectedQuestion, setSelectedQuestion] = useState('retirement');

  // 🎯 Use centralized financial data (always in sync)
  const { 
    financialData, 
    calculatedInsights, 
    isDataReady 
  } = useFinancialData();

  // Show loading if data isn't ready (after all hooks are called)
  if (!isDataReady) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Loading your quick answers...</Typography>
      </Box>
    );
  }

  // Simple calculations based on real data
  const currentAge = financialData.currentAge;
  const currentSavings = financialData.currentSavings;
  const monthlyIncome = financialData.monthlyIncome;
  const monthlyExpenses = financialData.monthlyExpenses;
  const monthlySavings = financialData.monthlySavings;

  // Simple projections
  const retirementAge = 60;
  const yearsToRetirement = retirementAge - currentAge;
  const projectedRetirementFund = currentSavings + (monthlySavings * 12 * yearsToRetirement * 1.12); // 12% growth

  const questions = {
    retirement: {
      title: "Will I have enough money to retire?",
      answer: projectedRetirementFund > 20000000 ? "YES, you're on track!" : "You need to save more",
      color: projectedRetirementFund > 20000000 ? "success" : "warning",
      details: `At 60, you'll have ₹${(projectedRetirementFund/100000).toFixed(1)} lakhs`,
      recommendation: projectedRetirementFund > 20000000 
        ? "Keep doing what you're doing!" 
        : `Save ₹${Math.ceil((20000000 - projectedRetirementFund) / (yearsToRetirement * 12) / 1000)}k more per month`
    },
    house: {
      title: "Can I afford to buy a house?",
      answer: monthlySavings > 25000 ? "YES, you can afford it!" : "Not quite ready yet",
      color: monthlySavings > 25000 ? "success" : "error",
      details: `You save ₹${monthlySavings.toLocaleString()} per month`,
      recommendation: monthlySavings > 25000 
        ? "Look for houses under ₹50 lakhs" 
        : "Reduce expenses by ₹10,000/month first"
    },
    emergency: {
      title: "Do I have enough emergency money?",
      answer: currentSavings > (monthlyExpenses * 6) ? "YES, you're safe!" : "Build emergency fund first",
      color: currentSavings > (monthlyExpenses * 6) ? "success" : "error",
      details: `You have ${Math.floor(currentSavings / monthlyExpenses)} months of expenses saved`,
      recommendation: currentSavings > (monthlyExpenses * 6)
        ? "Emergency fund looks good!"
        : "Save 6 months of expenses (₹3 lakhs) first"
    }
  };

  const currentQuestion = questions[selectedQuestion];

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
        maxWidth: 800, 
        mx: 'auto',
        minHeight: '100vh',
        paddingBottom: 6 // Extra padding for complete visibility
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
            console.log('🔍 [SimpleFinancialView] Return to Dashboard clicked');
            console.log('🔍 [SimpleFinancialView] onReturnToDashboard type:', typeof onReturnToDashboard);
            console.log('🔍 [SimpleFinancialView] onReturnToDashboard function:', onReturnToDashboard);
            console.log('🔍 [SimpleFinancialView] Current URL:', window.location.href);
            console.log('🔍 [SimpleFinancialView] Current pathname:', window.location.pathname);
            
            if (onReturnToDashboard) {
              console.log('🔍 [SimpleFinancialView] Calling onReturnToDashboard...');
              try {
                onReturnToDashboard();
                console.log('✅ [SimpleFinancialView] onReturnToDashboard called successfully');
              } catch (error) {
                console.error('❌ [SimpleFinancialView] Error calling onReturnToDashboard:', error);
              }
            } else {
              console.error('❌ [SimpleFinancialView] onReturnToDashboard is not provided!');
              console.log('🔍 [SimpleFinancialView] Available props:', Object.keys({ onBackToComplex, onReturnToDashboard }));
              
              // Fallback navigation using useNavigate hook
              console.log('🔄 [SimpleFinancialView] Attempting fallback navigation with useNavigate...');
              try {
                navigate('/financial-health');
                console.log('✅ [SimpleFinancialView] Fallback navigation with useNavigate initiated');
              } catch (navigateError) {
                console.error('❌ [SimpleFinancialView] useNavigate failed:', navigateError);
                
                // Last resort: window.location
                console.log('🔄 [SimpleFinancialView] Attempting last resort navigation...');
                try {
                  window.location.href = '/financial-health';
                  console.log('✅ [SimpleFinancialView] Last resort navigation initiated');
                } catch (fallbackError) {
                  console.error('❌ [SimpleFinancialView] All navigation methods failed:', fallbackError);
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
            variant="h4" 
            gutterBottom
            sx={{ 
              color: '#1a1a1a', 
              fontWeight: 'bold',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            💰 Your Money, Simply Explained
          </Typography>
        </Box>

        {/* Download Button - Right Side */}
        <Button
          variant="contained"
          color="success"
          startIcon={<DownloadIcon />}
          onClick={() => handleSimpleReportDownload('quick-answers', financialData, calculatedInsights)}
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

      {/* Question Selector */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={4}>
          <Button
            fullWidth
            variant={selectedQuestion === 'retirement' ? 'contained' : 'outlined'}
            onClick={() => setSelectedQuestion('retirement')}
            startIcon={<GrowthIcon />}
          >
            Retirement
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Button
            fullWidth
            variant={selectedQuestion === 'house' ? 'contained' : 'outlined'}
            onClick={() => setSelectedQuestion('house')}
            startIcon={<HouseIcon />}
          >
            Buy House
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Button
            fullWidth
            variant={selectedQuestion === 'emergency' ? 'contained' : 'outlined'}
            onClick={() => setSelectedQuestion('emergency')}
            startIcon={<SafetyIcon />}
          >
            Emergency
          </Button>
        </Grid>
      </Grid>

      {/* Main Answer Card */}
      <Card sx={{ mb: 3, bgcolor: currentQuestion.color === 'success' ? '#e8f5e8' : currentQuestion.color === 'warning' ? '#fff3e0' : '#ffebee' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {currentQuestion.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Chip 
              label={currentQuestion.answer}
              color={currentQuestion.color}
              size="large"
              sx={{ fontSize: '1.1rem', py: 2 }}
            />
          </Box>

          <Typography variant="body1" sx={{ mb: 2, fontSize: '1.1rem' }}>
            {currentQuestion.details}
          </Typography>

          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            💡 What to do: {currentQuestion.recommendation}
          </Typography>
        </CardContent>
      </Card>

      {/* Simple Progress Bars */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>Monthly Savings</Typography>
            <Typography variant="h4" color="primary">₹{(monthlySavings/1000).toFixed(0)}k</Typography>
            <LinearProgress 
              variant="determinate" 
              value={Math.min((monthlySavings / 50000) * 100, 100)} 
              sx={{ mt: 1, height: 8 }}
            />
            <Typography variant="caption">Target: ₹50k/month</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>Emergency Fund</Typography>
            <Typography variant="h4" color="secondary">₹{(currentSavings/100000).toFixed(1)}L</Typography>
            <LinearProgress 
              variant="determinate" 
              value={Math.min((currentSavings / (monthlyExpenses * 6)) * 100, 100)} 
              color="secondary"
              sx={{ mt: 1, height: 8 }}
            />
            <Typography variant="caption">Target: 6 months expenses</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>Retirement Fund</Typography>
            <Typography variant="h4" color="success.main">₹{(projectedRetirementFund/10000000).toFixed(1)}Cr</Typography>
            <LinearProgress 
              variant="determinate" 
              value={Math.min((projectedRetirementFund / 20000000) * 100, 100)} 
              color="success"
              sx={{ mt: 1, height: 8 }}
            />
            <Typography variant="caption">Target: ₹2Cr by 60</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Simple Timeline */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>📅 Your Money Timeline</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6">Today</Typography>
            <Typography variant="body2">₹{(currentSavings/100000).toFixed(1)}L saved</Typography>
          </Box>
          <Box sx={{ flex: 1, mx: 2 }}>
            <LinearProgress variant="determinate" value={50} sx={{ height: 6 }} />
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6">Age 60</Typography>
            <Typography variant="body2">₹{(projectedRetirementFund/10000000).toFixed(1)}Cr projected</Typography>
          </Box>
        </Box>
      </Paper>

      {/* 4D FINANCIAL VISUALIZATIONS */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 'bold' }}>
          📊 Your Financial Future in 4D
        </Typography>

        {/* 4D Visualization Grid */}
        <Grid container spacing={4}>
          {/* 1. TIME DIMENSION - Financial Growth Timeline */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: 400 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#2196F3', mr: 2 }}>
                  <TimelineIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  🕐 Time Dimension: Wealth Growth
                </Typography>
              </Box>
              <Box sx={{ height: 300 }}>
                <Line
                  data={{
                    labels: ['2024', '2030', '2035', '2040', '2045', '2050', '2055', '2060'],
                    datasets: [
                      {
                        label: 'Net Worth (₹ Lakhs)',
                        data: [
                          currentSavings / 100000,
                          (currentSavings + monthlySavings * 12 * 6) / 100000,
                          (currentSavings + monthlySavings * 12 * 11) / 100000,
                          (currentSavings + monthlySavings * 12 * 16) / 100000,
                          (currentSavings + monthlySavings * 12 * 21) / 100000,
                          (currentSavings + monthlySavings * 12 * 26) / 100000,
                          (currentSavings + monthlySavings * 12 * 31) / 100000,
                          projectedRetirementFund / 100000
                        ],
                        borderColor: '#2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#2196F3',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 6
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: 'Your Wealth Journey Over Time'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return '₹' + value + 'L';
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* 2. RISK DIMENSION - Investment Risk vs Return */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: 400 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#FF9800', mr: 2 }}>
                  <BarIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  ⚡ Risk Dimension: Investment Mix
                </Typography>
              </Box>
              <Box sx={{ height: 300 }}>
                <Bar
                  data={{
                    labels: ['Low Risk\n(FD/Bonds)', 'Medium Risk\n(Mutual Funds)', 'High Risk\n(Stocks)', 'Emergency\n(Savings)'],
                    datasets: [
                      {
                        label: 'Current Allocation (%)',
                        data: [30, 40, 20, 10],
                        backgroundColor: [
                          'rgba(76, 175, 80, 0.8)',
                          'rgba(255, 193, 7, 0.8)',
                          'rgba(244, 67, 54, 0.8)',
                          'rgba(33, 150, 243, 0.8)'
                        ],
                        borderColor: [
                          'rgba(76, 175, 80, 1)',
                          'rgba(255, 193, 7, 1)',
                          'rgba(244, 67, 54, 1)',
                          'rgba(33, 150, 243, 1)'
                        ],
                        borderWidth: 2
                      },
                      {
                        label: 'Recommended (%)',
                        data: [25, 45, 25, 5],
                        backgroundColor: [
                          'rgba(76, 175, 80, 0.4)',
                          'rgba(255, 193, 7, 0.4)',
                          'rgba(244, 67, 54, 0.4)',
                          'rgba(33, 150, 243, 0.4)'
                        ],
                        borderColor: [
                          'rgba(76, 175, 80, 1)',
                          'rgba(255, 193, 7, 1)',
                          'rgba(244, 67, 54, 1)',
                          'rgba(33, 150, 243, 1)'
                        ],
                        borderWidth: 2,
                        borderDash: [5, 5]
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: 'Investment Risk Distribution'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 50,
                        ticks: {
                          callback: function(value) {
                            return value + '%';
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* 3. GOALS DIMENSION - Financial Goals Progress */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: 400 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#4CAF50', mr: 2 }}>
                  <PieIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  🎯 Goals Dimension: Achievement Progress
                </Typography>
              </Box>
              <Box sx={{ height: 300 }}>
                <Doughnut
                  data={{
                    labels: ['House Down Payment', 'Emergency Fund', 'Retirement Fund', 'Child Education', 'Vacation Fund'],
                    datasets: [
                      {
                        label: 'Progress (%)',
                        data: [
                          Math.min((currentSavings / 2000000) * 100, 100), // House: 20L down payment
                          Math.min((currentSavings / (monthlyExpenses * 6)) * 100, 100), // Emergency: 6 months
                          Math.min((currentSavings / 20000000) * 100, 100), // Retirement: 2Cr
                          Math.min((currentSavings / 5000000) * 100, 100), // Education: 50L
                          Math.min((currentSavings / 500000) * 100, 100) // Vacation: 5L
                        ],
                        backgroundColor: [
                          'rgba(255, 99, 132, 0.8)',
                          'rgba(54, 162, 235, 0.8)',
                          'rgba(255, 205, 86, 0.8)',
                          'rgba(75, 192, 192, 0.8)',
                          'rgba(153, 102, 255, 0.8)'
                        ],
                        borderColor: [
                          'rgba(255, 99, 132, 1)',
                          'rgba(54, 162, 235, 1)',
                          'rgba(255, 205, 86, 1)',
                          'rgba(75, 192, 192, 1)',
                          'rgba(153, 102, 255, 1)'
                        ],
                        borderWidth: 2
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                      title: {
                        display: true,
                        text: 'Financial Goals Achievement'
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return context.label + ': ' + context.parsed.toFixed(1) + '%';
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* 4. GROWTH DIMENSION - Compound Growth Scenarios */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, height: 400 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#9C27B0', mr: 2 }}>
                  <LineIcon />
                </Avatar>
                <Typography variant="h6" fontWeight="bold">
                  📈 Growth Dimension: Return Scenarios
                </Typography>
              </Box>
              <Box sx={{ height: 300 }}>
                <Line
                  data={{
                    labels: ['2024', '2030', '2035', '2040', '2045', '2050', '2055', '2060'],
                    datasets: [
                      {
                        label: 'Conservative (8%)',
                        data: [5, 12, 22, 38, 62, 98, 148, 220],
                        borderColor: 'rgba(76, 175, 80, 1)',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        fill: false,
                        tension: 0.4
                      },
                      {
                        label: 'Moderate (12%)',
                        data: [5, 15, 32, 60, 108, 188, 320, 540],
                        borderColor: 'rgba(255, 193, 7, 1)',
                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                        fill: false,
                        tension: 0.4
                      },
                      {
                        label: 'Aggressive (15%)',
                        data: [5, 18, 42, 88, 175, 340, 650, 1200],
                        borderColor: 'rgba(244, 67, 54, 1)',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        fill: false,
                        tension: 0.4
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: 'Wealth Growth Under Different Return Scenarios'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return '₹' + value + 'L';
                          }
                        }
                      }
                    }
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Interactive 4D Controls */}
        <Paper elevation={3} sx={{ p: 3, mt: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Typography variant="h6" gutterBottom sx={{ color: 'white', textAlign: 'center' }}>
            🎮 Interactive 4D Controls
          </Typography>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Time Horizon (Years):
              </Typography>
              <Slider
                defaultValue={30}
                min={10}
                max={40}
                step={5}
                marks
                valueLabelDisplay="auto"
                sx={{ color: 'white' }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Risk Tolerance:
              </Typography>
              <Slider
                defaultValue={50}
                min={0}
                max={100}
                step={10}
                marks
                valueLabelDisplay="auto"
                sx={{ color: 'white' }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Monthly Investment:
              </Typography>
              <Slider
                defaultValue={monthlySavings}
                min={10000}
                max={100000}
                step={5000}
                marks
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `₹${value/1000}k`}
                sx={{ color: 'white' }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Expected Return:
              </Typography>
              <Slider
                defaultValue={12}
                min={6}
                max={18}
                step={1}
                marks
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}%`}
                sx={{ color: 'white' }}
              />
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
        <Button 
          variant="contained"
          onClick={onBackToComplex}
          startIcon={<span>←</span>}
          size="large"
          sx={{
            bgcolor: '#4CAF50',
            '&:hover': { bgcolor: '#45a049' }
          }}
        >
          Back to 4D Menu
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={() => handleSimpleReportDownload('quick-answers', financialData, calculatedInsights)}
          size="large"
        >
          Download Report
        </Button>
      </Box>
      </Box>
    </Box>
  );
};

export default SimpleFinancialView;
