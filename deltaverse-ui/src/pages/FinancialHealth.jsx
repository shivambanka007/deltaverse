import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createReturnToDashboardHandler } from '../utils/navigationUtils';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Lightbulb as LightbulbIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
  CloudOff as CloudOffIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

// Import environment detection utility
import { isDevelopment, shouldShowTestScenarios, logEnvironmentInfo } from '../utils/environment';

import {
  fetchHealthScore,
  fetchMockHealthScore,
  fetchScenarios,
  fetchUserHistory,
  setViewMode,
  setSelectedScenario,
  selectFinancialHealth,
  selectIsLoading,
  selectError,
  selectViewMode,
  selectAvailableScenarios,
  selectSelectedScenario
} from '../store/slices/financialHealthSlice';

// Import existing Fi-connect functionality
import {
  checkFiMcpServerStatus,
  setConnected,
  selectFiConnect,
  selectIsConnected,
  selectFiMcpStatus,
  selectFiMcpConnecting
} from '../store/slices/fiConnectSlice';

// Import the same Fi login service used by AI page
import fiLoginPopup from '../services/fiLoginPopup';

import { FinancialHealthDashboard } from '../components/financial-health';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`financial-health-tabpanel-${index}`}
      aria-labelledby={`financial-health-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `financial-health-tab-${index}`,
    'aria-controls': `financial-health-tabpanel-${index}`,
  };
}

const FinancialHealth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    healthScore,
    overallScore,
    components,
    recommendations,
    historicalScores,
    userHistory,
    scenariosLoading,
    historyLoading
  } = useSelector(selectFinancialHealth);
  
  const loading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const viewMode = useSelector(selectViewMode);
  const availableScenarios = useSelector(selectAvailableScenarios);
  const selectedScenario = useSelector(selectSelectedScenario);
  
  // Use existing Fi-connect state
  const fiConnect = useSelector(selectFiConnect);
  const isConnectedToFi = useSelector(selectIsConnected);
  const fiMcpStatus = useSelector(selectFiMcpStatus);
  const mcpConnecting = useSelector(selectFiMcpConnecting);

  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // Log environment info on component mount
    logEnvironmentInfo();
    
    // Only load scenarios in development
    if (shouldShowTestScenarios()) {
      dispatch(fetchScenarios());
    }
    dispatch(checkFiMcpServerStatus());
    dispatch(fetchHealthScore(selectedScenario));
  }, [dispatch, selectedScenario]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Map tab index to view mode (removed scenarios)
    const viewModes = ['dashboard', 'components', 'recommendations', 'history'];
    dispatch(setViewMode(viewModes[newValue]));
    
    // Load data based on tab
    if (newValue === 3) { // History tab
      dispatch(fetchUserHistory());
    }
  };

  const handleScenarioChange = (event) => {
    const newScenario = event.target.value;
    dispatch(setSelectedScenario(newScenario));
    dispatch(fetchHealthScore(newScenario));
  };

  const handleRefreshData = () => {
    dispatch(fetchHealthScore(selectedScenario));
    dispatch(checkFiMcpServerStatus());
  };

  const handleUseMockData = () => {
    dispatch(fetchMockHealthScore(selectedScenario));
  };

  const handleReturnToDashboard = createReturnToDashboardHandler(navigate, 'FinancialHealth');

  const handleConnectToFiMcp = async () => {
    try {
      console.log('Starting Fi login process from Financial Health page...');
      
      // Use the same fiLoginPopup service as the AI page
      const loginData = await fiLoginPopup.openLoginPopup(selectedScenario);
      
      console.log('Fi login successful:', loginData);
      
      // Update Fi connection state in Redux (same as AI page)
      dispatch(setConnected({
        mobile: loginData.mobile,
        sessionId: loginData.sessionId,
        loginTime: loginData.loginTime,
        scenario: loginData.scenario,
        token: loginData.token
      }));

      // Refresh Fi-MCP status after successful connection
      dispatch(checkFiMcpServerStatus());
      
      // Refresh financial health score with real data
      dispatch(fetchHealthScore(selectedScenario));
      
      console.log('Fi connection completed successfully from Financial Health page');
      
    } catch (error) {
      console.error('Failed to connect to Fi from Financial Health page:', error);
      
      // Show user-friendly error message
      if (error.code === 'POPUP_BLOCKED') {
        alert('Popup was blocked. Please allow popups for this site and try again.');
      } else if (error.code === 'LOGIN_TIMEOUT') {
        alert('Login was cancelled or timed out. Please try again.');
      } else {
        alert(`Connection failed: ${error.message}`);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': 
      case 'authentication_required': 
        return 'success';
      case 'unavailable': 
        return 'error';
      default: 
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': 
      case 'authentication_required':
        return <CheckCircleIcon />;
      case 'unavailable': 
        return <CloudOffIcon />;
      default: 
        return <CircularProgress size={16} />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'authentication_required':
        return 'ready';
      case 'available':
        return 'available';
      case 'unavailable':
        return 'unavailable';
      default:
        return status;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Financial Health Score
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Comprehensive analysis of your financial wellness with personalized recommendations
            </Typography>
          </Box>
          
          {/* Show overall score if available */}
          {healthScore && overallScore > 0 && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h2" color="primary" fontWeight="bold">
                {overallScore.toFixed(1)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Overall Score
              </Typography>
              <Chip 
                label={overallScore >= 80 ? 'Excellent' : 
                       overallScore >= 70 ? 'Good' : 
                       overallScore >= 60 ? 'Fair' : 'Needs Work'}
                color={overallScore >= 80 ? 'success' : 
                       overallScore >= 70 ? 'primary' : 
                       overallScore >= 60 ? 'warning' : 'error'}
                sx={{ mt: 1, display: 'block' }}
              />
            </Box>
          )}
        </Box>
        
        {/* Connection status indicator */}
        {isConnectedToFi && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <strong>Connected to Fi Money</strong> - Using your real financial data for accurate analysis
          </Alert>
        )}
      </Box>

      {/* Fi-MCP Status and Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2">Fi Status:</Typography>
              <Chip
                icon={getStatusIcon(fiMcpStatus.status)}
                label={getStatusLabel(fiMcpStatus.status)}
                color={getStatusColor(fiMcpStatus.status)}
                size="small"
              />
            </Box>
            
            {/* Connection Status */}
            {isConnectedToFi && (
              <Box sx={{ mt: 1 }}>
                <Chip
                  label="Connected to Fi"
                  color="success"
                  size="small"
                  icon={<CheckCircleIcon />}
                />
                <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>
                  Using your real financial data
                </Typography>
              </Box>
            )}
            
            {/* Status message for unavailable server - only in development */}
            {isDevelopment() && fiMcpStatus.status === 'unavailable' && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                Fi-MCP server not running. Start with: FI_MCP_PORT=8080 go run .
              </Typography>
            )}
          </Grid>
          
          {/* Test Scenario Selection - Development Only */}
          {shouldShowTestScenarios() && (
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Test Scenario (Dev)</InputLabel>
                <Select
                  value={selectedScenario}
                  label="Test Scenario (Dev)"
                  onChange={handleScenarioChange}
                  disabled={scenariosLoading || isConnectedToFi}
                >
                  {availableScenarios.map((scenario) => (
                    <MenuItem key={scenario.phone_number} value={scenario.phone_number}>
                      {scenario.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {isConnectedToFi && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Scenario locked while connected
                </Typography>
              )}
            </Grid>
          )}
          
          <Grid item xs={12} md={shouldShowTestScenarios() ? 3 : 6}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleReturnToDashboard}
                size="small"
              >
                Return to Dashboard
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefreshData}
                disabled={loading}
                size="small"
              >
                Refresh
              </Button>
              
              {/* Only show Connect button if not connected */}
              {!isConnectedToFi && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleConnectToFiMcp}
                  disabled={mcpConnecting || (fiMcpStatus.status === 'unavailable')}
                  size="small"
                  startIcon={mcpConnecting ? <CircularProgress size={16} /> : null}
                >
                  {mcpConnecting ? 'Connecting...' : 'Connect to Fi'}
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="financial health tabs">
            <Tab icon={<DashboardIcon />} label="Dashboard" {...a11yProps(0)} />
            <Tab icon={<AssessmentIcon />} label="Components" {...a11yProps(1)} />
            <Tab icon={<LightbulbIcon />} label="Recommendations" {...a11yProps(2)} />
            <Tab icon={<HistoryIcon />} label="History" {...a11yProps(3)} />
          </Tabs>
        </Box>

        {/* Dashboard Tab */}
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Calculating your financial health score...
              </Typography>
            </Box>
          ) : healthScore ? (
            <FinancialHealthDashboard />
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                Welcome to Financial Health Score
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Get a comprehensive analysis of your financial wellness with personalized recommendations.
              </Typography>
              <Box sx={{ mt: 3 }}>
                {isConnectedToFi ? (
                  <Button 
                    variant="contained" 
                    size="large"
                    onClick={() => dispatch(fetchHealthScore(selectedScenario))}
                    disabled={loading}
                  >
                    Calculate My Health Score
                  </Button>
                ) : (
                  <Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Connect to Fi to get your personalized financial health score
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="large"
                      onClick={handleConnectToFiMcp}
                      disabled={mcpConnecting || (fiMcpStatus.status === 'unavailable')}
                      startIcon={mcpConnecting ? <CircularProgress size={20} /> : null}
                    >
                      {mcpConnecting ? 'Connecting...' : 'Connect to Fi'}
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </TabPanel>

        {/* Components Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Score Components Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Detailed breakdown of your financial health components
          </Typography>
          
          {components && components.length > 0 ? (
            <Grid container spacing={3}>
              {components.map((component, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          {component.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Weight: {Math.round((component.weight || 0) * 100)}%
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Typography variant="h3" color="primary" fontWeight="bold">
                          {component.score}
                        </Typography>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            out of 100
                          </Typography>
                          <Chip
                            label={component.status}
                            color={component.status === 'excellent' ? 'success' : 
                                   component.status === 'good' ? 'primary' :
                                   component.status === 'fair' ? 'warning' : 'error'}
                            size="small"
                            sx={{ ml: 1, display: 'block', mt: 0.5 }}
                          />
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {component.description}
                      </Typography>
                      
                      {/* Show data points if available */}
                      {component.data_points && Object.keys(component.data_points).length > 0 && (
                        <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            Key Metrics:
                          </Typography>
                          {Object.entries(component.data_points).map(([key, value]) => (
                            <Typography key={key} variant="caption" display="block">
                              <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {
                                typeof value === 'number' ? 
                                  (key.includes('ratio') || key.includes('rate') ? `${(value * 100).toFixed(1)}%` :
                                   key.includes('amount') || key.includes('income') || key.includes('savings') || key.includes('debt') || key.includes('fund') || key.includes('expenses') || key.includes('investment') ? 
                                   `₹${value.toLocaleString()}` : value) : value
                              }
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Component Data Available
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {loading ? 'Loading component analysis...' : 'Calculate your financial health score to see detailed component breakdown.'}
              </Typography>
              {!loading && (
                <Button 
                  variant="contained" 
                  onClick={() => dispatch(fetchHealthScore(selectedScenario))}
                >
                  Calculate Health Score
                </Button>
              )}
            </Box>
          )}
        </TabPanel>

        {/* Recommendations Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Personalized Recommendations
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Actionable steps to improve your financial health score
          </Typography>
          
          {recommendations && recommendations.length > 0 ? (
            <Grid container spacing={2}>
              {recommendations.map((rec, index) => (
                <Grid item xs={12} key={index}>
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          {rec.title}
                        </Typography>
                        <Chip 
                          label={`+${rec.potential_improvement || 0} points`} 
                          color="success" 
                          size="small" 
                        />
                      </Box>
                      
                      <Typography variant="body1" paragraph>
                        {rec.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip 
                          label={`Impact: ${rec.impact || 'Medium'}`} 
                          color={rec.impact === 'high' ? 'error' : rec.impact === 'medium' ? 'warning' : 'info'}
                          size="small" 
                        />
                        <Chip 
                          label={`Difficulty: ${rec.difficulty || 'Moderate'}`} 
                          variant="outlined"
                          size="small" 
                        />
                        {rec.category && (
                          <Chip 
                            label={rec.category} 
                            color="primary"
                            variant="outlined"
                            size="small" 
                          />
                        )}
                      </Box>
                      
                      {rec.action_steps && rec.action_steps.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                            Action Steps:
                          </Typography>
                          <Box component="ol" sx={{ pl: 2, m: 0 }}>
                            {rec.action_steps.map((step, stepIndex) => (
                              <Box component="li" key={stepIndex} sx={{ mb: 1 }}>
                                <Typography variant="body2">{step}</Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Recommendations Available
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {loading ? 'Loading recommendations...' : 
                 !healthScore ? 'Calculate your financial health score to see personalized recommendations.' :
                 'Great job! Your financial health is excellent with no immediate recommendations.'}
              </Typography>
              {!loading && !healthScore && (
                <Button 
                  variant="contained" 
                  onClick={() => dispatch(fetchHealthScore(selectedScenario))}
                  sx={{ mt: 2 }}
                >
                  Calculate Health Score
                </Button>
              )}
            </Box>
          )}
        </TabPanel>

        {/* History Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Score History
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Track your financial health progress over time
          </Typography>
          
          {historyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : userHistory && userHistory.length > 0 ? (
            <>
              <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                Recent Calculations ({userHistory.length} entries)
              </Typography>
              <Grid container spacing={2}>
                {/* Group by date and show only the latest entry per date */}
                {userHistory
                  .reduce((acc, entry) => {
                    const date = new Date(entry.calculated_at).toDateString();
                    if (!acc[date] || new Date(entry.calculated_at) > new Date(acc[date].calculated_at)) {
                      acc[date] = entry;
                    }
                    return acc;
                  }, {})
                  && Object.values(
                    userHistory.reduce((acc, entry) => {
                      const date = new Date(entry.calculated_at).toDateString();
                      if (!acc[date] || new Date(entry.calculated_at) > new Date(acc[date].calculated_at)) {
                        acc[date] = entry;
                      }
                      return acc;
                    }, {})
                  )
                  .sort((a, b) => new Date(b.calculated_at) - new Date(a.calculated_at))
                  .slice(0, 12) // Show only last 12 unique dates
                  .map((entry, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h5" color="primary" fontWeight="bold">
                              {entry.overall_score.toFixed(1)}
                            </Typography>
                            <Chip 
                              label={entry.overall_score >= 80 ? 'Excellent' : 
                                     entry.overall_score >= 70 ? 'Good' : 
                                     entry.overall_score >= 60 ? 'Fair' : 'Needs Work'}
                              color={entry.overall_score >= 80 ? 'success' : 
                                     entry.overall_score >= 70 ? 'primary' : 
                                     entry.overall_score >= 60 ? 'warning' : 'error'}
                              size="small"
                            />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {new Date(entry.calculated_at).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Typography>
                          
                          <Typography variant="body2" gutterBottom>
                            <strong>Phone:</strong> {entry.phone_number}
                            {shouldShowTestScenarios() && availableScenarios.length > 0 && (
                              <span> ({availableScenarios.find(s => s.phone_number === entry.phone_number)?.name || 'Unknown Scenario'})</span>
                            )}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Components: {entry.components_count}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Tips: {entry.recommendations_count}
                            </Typography>
                          </Box>
                          
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                            {new Date(entry.calculated_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
              
              {userHistory.length > 12 && (
                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography variant="caption" color="text.secondary">
                    Showing latest calculation per day. Total entries: {userHistory.length}
                  </Typography>
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No History Available
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Calculate your first financial health score to start tracking your progress over time.
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => dispatch(fetchHealthScore(selectedScenario))}
                disabled={loading}
              >
                Calculate Health Score
              </Button>
            </Box>
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default FinancialHealth;
