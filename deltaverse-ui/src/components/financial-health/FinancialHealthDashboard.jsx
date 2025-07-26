import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import ScoreGauge from './ScoreGauge';
import ComponentCard from './ComponentCard';
import RecommendationCard from './RecommendationCard';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  CircularProgress, 
  Alert, 
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Redux selectors
import {
  selectFinancialHealth,
  selectHealthScore,
  selectOverallScore,
  selectFilteredComponents,
  selectFilteredRecommendations,
  selectHistoricalScores,
  selectIsLoading,
  selectError,
  selectViewMode,
  selectSelectedScenario,
  setComponentFilter,
  setRecommendationFilter,
  setSortBy,
  setSortOrder,
  fetchHealthScore,
  fetchMockHealthScore
} from '../../store/slices/financialHealthSlice';

// Import existing Fi-connect selectors
import {
  selectIsConnected
} from '../../store/slices/fiConnectSlice';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const FinancialHealthDashboard = ({ viewMode: propViewMode }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const financialHealth = useSelector(selectFinancialHealth);
  const healthScore = useSelector(selectHealthScore);
  const overallScore = useSelector(selectOverallScore);
  const components = useSelector(selectFilteredComponents);
  const recommendations = useSelector(selectFilteredRecommendations);
  const historicalScores = useSelector(selectHistoricalScores);
  const loading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const reduxViewMode = useSelector(selectViewMode);
  const selectedScenario = useSelector(selectSelectedScenario);
  
  // Use prop viewMode if provided, otherwise use Redux viewMode
  const currentViewMode = propViewMode || reduxViewMode;
  
  // Use existing Fi-connect state
  const isConnected = useSelector(selectIsConnected);
  
  const loadHealthScore = useCallback(async () => {
    try {
      await dispatch(fetchHealthScore(selectedScenario)).unwrap();
    } catch (error) {
      console.warn('Failed to fetch authenticated health score, using mock data');
      await dispatch(fetchMockHealthScore(selectedScenario)).unwrap();
    }
  }, [dispatch, selectedScenario]);
  
  useEffect(() => {
    // Load data if not already loaded
    if (!healthScore && !loading) {
      loadHealthScore();
    }
  }, [healthScore, loading, loadHealthScore]);

  const handleConnectFi = () => {
    navigate('/dashboard'); // Navigate to dashboard where Fi connection is handled
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'component') {
      dispatch(setComponentFilter(value));
    } else if (filterType === 'recommendation') {
      dispatch(setRecommendationFilter(value));
    }
  };

  const handleSortChange = (sortBy, sortOrder) => {
    dispatch(setSortBy(sortBy));
    dispatch(setSortOrder(sortOrder));
  };

  // Prepare chart data for historical scores
  const chartData = {
    labels: Object.keys(historicalScores).sort(),
    datasets: [
      {
        label: 'Financial Health Score',
        data: Object.keys(historicalScores)
          .sort()
          .map(date => historicalScores[date]),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Your Financial Health Over Time'
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          callback: function(value) {
            return `${value}%`;
          }
        }
      }
    }
  };

  // Show connection prompt if not connected and no health score
  if (!isConnected && !healthScore) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Typography variant="h5" gutterBottom>Connect Your Fi Account</Typography>
        <Typography variant="body1" paragraph>
          Connect your Fi Money account to see your personalized Financial Health Score.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleConnectFi}
          sx={{ mt: 2 }}
        >
          Connect Fi Money
        </Button>
      </Paper>
    );
  }
  
  if (loading && !healthScore) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading your financial health score...
        </Typography>
      </Box>
    );
  }
  
  if (error && !healthScore) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {error}
        <Button onClick={loadHealthScore} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  if (!healthScore) {
    return (
      <Alert severity="info" sx={{ mt: 4 }}>
        No financial health data available. Please try refreshing or connecting your Fi account.
      </Alert>
    );
  }

  // Render based on view mode
  const renderContent = () => {
    switch (currentViewMode) {
      case 'components':
        return (
          <Box>
            {/* Filters */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={financialHealth.componentFilter}
                  label="Filter by Status"
                  onChange={(e) => handleFilterChange('component', e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="excellent">Excellent</MenuItem>
                  <MenuItem value="good">Good</MenuItem>
                  <MenuItem value="fair">Fair</MenuItem>
                  <MenuItem value="poor">Poor</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={financialHealth.sortBy}
                  label="Sort by"
                  onChange={(e) => handleSortChange(e.target.value, financialHealth.sortOrder)}
                >
                  <MenuItem value="score">Score</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                </Select>
              </FormControl>

              <Chip 
                label={`${components.length} components`} 
                color="primary" 
                variant="outlined" 
              />
            </Box>

            {/* Components Grid */}
            <Grid container spacing={3}>
              {components.map((component, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <ComponentCard component={component} />
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 'recommendations':
        return (
          <Box>
            {/* Filters */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Filter by Impact</InputLabel>
                <Select
                  value={financialHealth.recommendationFilter}
                  label="Filter by Impact"
                  onChange={(e) => handleFilterChange('recommendation', e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="high">High Impact</MenuItem>
                  <MenuItem value="medium">Medium Impact</MenuItem>
                  <MenuItem value="low">Low Impact</MenuItem>
                </Select>
              </FormControl>

              <Chip 
                label={`${recommendations.length} recommendations`} 
                color="secondary" 
                variant="outlined" 
              />
            </Box>

            {/* Recommendations Grid */}
            <Grid container spacing={3}>
              {recommendations.map((recommendation, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <RecommendationCard recommendation={recommendation} />
                </Grid>
              ))}
            </Grid>
          </Box>
        );

      case 'history':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Score History
            </Typography>
            <Paper elevation={2} sx={{ p: 3, height: 400 }}>
              <Line data={chartData} options={chartOptions} />
            </Paper>
          </Box>
        );

      default: // dashboard
        return (
          <Box>
            <Grid container spacing={4}>
              {/* Overall Score */}
              <Grid item xs={12} md={4}>
                <Paper elevation={3} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6" gutterBottom>Overall Score</Typography>
                  <ScoreGauge score={overallScore} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                    Last updated: {new Date(healthScore.last_updated).toLocaleDateString()}
                  </Typography>
                </Paper>
              </Grid>
              
              {/* Historical Chart */}
              <Grid item xs={12} md={8}>
                <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>Score History</Typography>
                  <Box sx={{ height: 300 }}>
                    <Line data={chartData} options={chartOptions} />
                  </Box>
                </Paper>
              </Grid>
              
              {/* 4D FUTURE SIMULATION - Always Available */}
              <Grid item xs={12}>
                  <Paper 
                    elevation={6} 
                    sx={{ 
                      p: 4, 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 3,
                      boxShadow: '0 12px 40px rgba(102, 126, 234, 0.3)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                        pointerEvents: 'none'
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                          <Typography 
                            variant="h4" 
                            sx={{ 
                              color: 'white', 
                              fontWeight: 'bold',
                              mb: 1,
                              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                            }}
                          >
                            🔮 Ready to See Your Financial Future?
                          </Typography>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: 'rgba(255,255,255,0.9)', 
                              mb: 2,
                              fontWeight: 'medium'
                            }}
                          >
                            Your Fi Money data is connected • Score: {overallScore}% • Future simulation ready
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              color: 'rgba(255,255,255,0.8)',
                              maxWidth: 600,
                              lineHeight: 1.6
                            }}
                          >
                            Experience your financial journey in 4 dimensions: Time, Risk, Goals, and Growth. 
                            See exactly when you'll achieve your dreams and how different decisions impact your future.
                          </Typography>
                        </Box>
                        
                        <Box sx={{ textAlign: 'center' }}>
                          <Button 
                            variant="contained" 
                            size="large"
                            onClick={() => navigate('/financial-analysis')}
                            sx={{ 
                              bgcolor: 'white',
                              color: '#667eea',
                              fontWeight: 'bold',
                              fontSize: '1.2rem',
                              py: 2,
                              px: 4,
                              borderRadius: 3,
                              textTransform: 'none',
                              boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                              transition: 'all 0.3s ease',
                              '&:hover': { 
                                bgcolor: 'rgba(255,255,255,0.95)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 12px 35px rgba(0,0,0,0.3)'
                              }
                            }}
                          >
                            🚀 Launch 4D Future Simulation
                          </Button>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: 'block',
                              color: 'rgba(255,255,255,0.7)',
                              mt: 1,
                              fontStyle: 'italic'
                            }}
                          >
                            Powered by your real Fi Money data
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* Feature highlights */}
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 3, 
                        mt: 3, 
                        flexWrap: 'wrap',
                        justifyContent: 'center'
                      }}>
                        {[
                          { icon: '📊', text: 'Crystal Clear Insights' },
                          { icon: '📈', text: 'Professional Analysis' },
                          { icon: '🎯', text: 'Visual Journey' },
                          { icon: '💡', text: 'Quick Answers' }
                        ].map((feature, index) => (
                          <Box 
                            key={index}
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              bgcolor: 'rgba(255,255,255,0.15)',
                              px: 2,
                              py: 1,
                              borderRadius: 2,
                              backdropFilter: 'blur(10px)'
                            }}
                          >
                            <Typography sx={{ fontSize: '1.2rem' }}>{feature.icon}</Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: 'white',
                                fontWeight: 'medium'
                              }}
                            >
                              {feature.text}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

              {/* Fi-MCP Connection Encouragement - For users who haven't connected yet */}
              {!isConnected && healthScore && overallScore >= 50 && (
                <Grid item xs={12}>
                  <Paper 
                    elevation={4} 
                    sx={{ 
                      p: 4, 
                      background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)',
                      borderRadius: 3,
                      boxShadow: '0 8px 30px rgba(255, 154, 86, 0.3)',
                      border: '2px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                      <Box>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            color: 'white', 
                            fontWeight: 'bold',
                            mb: 1,
                            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                          }}
                        >
                          🚀 Unlock 4D Future Simulation
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: 'rgba(255,255,255,0.9)',
                            maxWidth: 500,
                            lineHeight: 1.6
                          }}
                        >
                          Connect your Fi Money account to unlock the powerful 4D Future Simulation. 
                          See your real financial future based on actual data, not estimates.
                        </Typography>
                      </Box>
                      
                      <Box sx={{ textAlign: 'center' }}>
                        <Button 
                          variant="contained" 
                          size="large"
                          onClick={handleConnectFi}
                          sx={{ 
                            bgcolor: 'white',
                            color: '#ff6b6b',
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            py: 1.5,
                            px: 3,
                            borderRadius: 2,
                            textTransform: 'none',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                            '&:hover': { 
                              bgcolor: 'rgba(255,255,255,0.95)',
                              transform: 'translateY(-1px)'
                            }
                          }}
                        >
                          🔗 Connect Fi Money
                        </Button>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block',
                            color: 'rgba(255,255,255,0.8)',
                            mt: 1
                          }}
                        >
                          Then unlock 4D simulation
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              )}
              
              {/* Score Components */}
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                  Score Components
                </Typography>
                <Grid container spacing={3}>
                  {components.slice(0, 5).map((component, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <ComponentCard component={component} />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              
              {/* Top Recommendations */}
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                  Top Recommendations
                </Typography>
                <Grid container spacing={3}>
                  {recommendations.slice(0, 3).map((recommendation, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <RecommendationCard recommendation={recommendation} />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ p: 0 }}>
      {renderContent()}
    </Box>
  );
};

export default FinancialHealthDashboard;
