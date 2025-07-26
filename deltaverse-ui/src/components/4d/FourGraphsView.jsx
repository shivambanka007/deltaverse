/**
 * 🎯 FOUR GRAPHS 4D VISUALIZATION
 * Expert Approach: 4 Clear Visual Graphs Instead of Complex 4D
 * 
 * Each graph represents one dimension in an understandable way:
 * 1. 📈 TIME GRAPH - Your money over years
 * 2. 🎯 GOALS GRAPH - Progress toward life goals  
 * 3. 💗 STRESS GRAPH - Financial stress levels
 * 4. 🎲 RISK GRAPH - Different outcome possibilities
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Slider,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  Download as DownloadIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Import the centralized financial data context
import { useFinancialData } from '../../contexts/FinancialDataContext';

// Import the simple report generator
import { handleSimpleReportDownload } from '../../utils/simpleReportGenerator';

import { debugNavigation } from '../../utils/navigationUtils';

const FourGraphsView = ({ onBackToComplex, onReturnToDashboard }) => {
  // Debug navigation props
  React.useEffect(() => {
    debugNavigation('FourGraphsView', { onBackToComplex, onReturnToDashboard });
  }, [onBackToComplex, onReturnToDashboard]);
  // 🎮 Interactive controls - Must be called before any conditional returns
  const [selectedYear, setSelectedYear] = useState(2024);
  const [savingsRate, setSavingsRate] = useState(30000);
  const [riskLevel, setRiskLevel] = useState('medium');

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
        <Typography variant="h6">Loading your financial analysis...</Typography>
      </Box>
    );
  }

  // 📊 User's financial data
  const monthlyIncome = financialData.monthlyIncome;
  const monthlyExpenses = financialData.monthlyExpenses;
  const currentSavings = financialData.currentSavings;
  const monthlySavings = financialData.monthlySavings;
  const currentAge = financialData.currentAge;

  // 📈 GRAPH 1: TIME DIMENSION - Money Growth Over Years
  const generateTimeData = () => {
    const data = [];
    let savings = currentSavings;
    
    for (let year = 2024; year <= 2060; year++) {
      const age = currentAge + (year - 2024);
      savings += savingsRate * 12 * (riskLevel === 'high' ? 1.12 : riskLevel === 'medium' ? 1.08 : 1.05);
      
      data.push({
        year,
        age,
        savings: Math.round(savings),
        savingsLakhs: Math.round(savings / 100000),
        milestone: age === 35 ? 'House' : age === 45 ? 'Child Education' : age === 60 ? 'Retirement' : null
      });
    }
    return data;
  };

  // 🎯 GRAPH 2: GOALS DIMENSION - Life Goals Progress
  const goalsData = [
    { goal: 'Emergency Fund', target: 300000, current: currentSavings * 0.6, color: '#4CAF50' },
    { goal: 'House Down Payment', target: 1500000, current: currentSavings * 0.3, color: '#2196F3' },
    { goal: 'Child Education', target: 2500000, current: currentSavings * 0.1, color: '#FF9800' },
    { goal: 'Retirement Fund', target: 20000000, current: currentSavings, color: '#9C27B0' }
  ].map(item => ({
    ...item,
    progress: Math.min((item.current / item.target) * 100, 100),
    remaining: item.target - item.current,
    monthsNeeded: Math.ceil((item.target - item.current) / savingsRate)
  }));

  // 💗 GRAPH 3: EMOTIONAL DIMENSION - Financial Stress Levels
  const stressData = [
    { category: 'Emergency Fund', stress: currentSavings > 300000 ? 20 : 80, color: '#4CAF50' },
    { category: 'Monthly Budget', stress: monthlySavings > 20000 ? 30 : 70, color: '#2196F3' },
    { category: 'Future Goals', stress: savingsRate > 25000 ? 25 : 75, color: '#FF9800' },
    { category: 'Retirement Ready', stress: currentAge < 35 ? 40 : 60, color: '#9C27B0' }
  ];

  // 🎲 GRAPH 4: PROBABILITY DIMENSION - Different Outcomes
  const probabilityData = [
    { scenario: 'Best Case', probability: 20, finalAmount: 35000000, color: '#4CAF50' },
    { scenario: 'Good Case', probability: 30, finalAmount: 25000000, color: '#8BC34A' },
    { scenario: 'Expected', probability: 35, finalAmount: 20000000, color: '#2196F3' },
    { scenario: 'Poor Case', probability: 12, finalAmount: 15000000, color: '#FF9800' },
    { scenario: 'Worst Case', probability: 3, finalAmount: 10000000, color: '#F44336' }
  ];

  const timeData = generateTimeData();

  // 🎨 Custom Tooltip Components
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.8)', color: 'white' }}>
          <Typography variant="body2">
            {`Year: ${label} | Amount: ₹${(payload[0].value / 100000).toFixed(1)}L`}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box sx={{ 
      width: '100%',
      minHeight: '100vh',
      overflowY: 'auto',
      overflowX: 'hidden',
      bgcolor: '#f5f5f5',
      position: 'relative'
    }}>
      <Box sx={{ 
        p: 2, 
        maxWidth: 1400, 
        mx: 'auto'
      }}>
      {/* Enhanced Header with Return Button */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
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
            📊 Your Financial Future in 4 Clear Graphs
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#424242',
              fontWeight: 'medium'
            }}
          >
            Each graph shows one dimension of your financial life
          </Typography>
        </Box>

        {/* Download Button - Right Side */}
        <Button
          variant="contained"
          color="success"
          startIcon={<DownloadIcon />}
          onClick={() => handleSimpleReportDownload('professional', financialData, calculatedInsights)}
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

      {/* 4D VISUALIZATION OVERVIEW */}
      <Paper elevation={6} sx={{ 
        p: 3, 
        mb: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 3,
        color: 'white'
      }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          🌟 4D Financial Analysis Dashboard
        </Typography>
        <Typography variant="h6" sx={{ textAlign: 'center', mb: 3, opacity: 0.9 }}>
          Your complete financial future visualized across 4 dimensions
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
              <Typography variant="h3" sx={{ mb: 1 }}>📈</Typography>
              <Typography variant="h6" gutterBottom>TIME</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Watch your wealth grow from age {currentAge} to retirement
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
              <Typography variant="h3" sx={{ mb: 1 }}>🎯</Typography>
              <Typography variant="h6" gutterBottom>GOALS</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Track progress toward your life milestones
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
              <Typography variant="h3" sx={{ mb: 1 }}>💗</Typography>
              <Typography variant="h6" gutterBottom>EMOTION</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Understand your financial stress levels
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
              <Typography variant="h3" sx={{ mb: 1 }}>🎲</Typography>
              <Typography variant="h6" gutterBottom>OUTCOMES</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Explore different future scenarios
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Interactive Controls */}
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>🎮 Adjust Your Plan</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography gutterBottom>Monthly Savings: ₹{(savingsRate/1000).toFixed(0)}k</Typography>
            <Slider
              value={savingsRate}
              min={10000}
              max={100000}
              step={5000}
              onChange={(_, value) => setSavingsRate(value)}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `₹${(value/1000).toFixed(0)}k`}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography gutterBottom>Risk Level</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {['low', 'medium', 'high'].map(level => (
                <Button
                  key={level}
                  variant={riskLevel === level ? 'contained' : 'outlined'}
                  onClick={() => setRiskLevel(level)}
                  size="small"
                >
                  {level.toUpperCase()}
                </Button>
              ))}
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography gutterBottom>Focus Year: {selectedYear}</Typography>
            <Slider
              value={selectedYear}
              min={2024}
              max={2060}
              onChange={(_, value) => setSelectedYear(value)}
              valueLabelDisplay="auto"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Four Graphs Grid - Optimized Layout */}
      <Grid container spacing={2}>
        
        {/* 📈 GRAPH 1: TIME DIMENSION */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: 450 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                📈 <strong>TIME:</strong> Your Money Over Years
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Watch your savings grow from age {currentAge} to 60
              </Typography>
              
              <Box sx={{ flex: 1, minHeight: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="age" 
                      label={{ value: 'Your Age', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `₹${(value/100000).toFixed(0)}L`}
                      label={{ value: 'Savings', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="savings" 
                      stroke="#2196F3" 
                      fill="#2196F3" 
                      fillOpacity={0.3}
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Chip label={`Today: ₹${(currentSavings/100000).toFixed(1)}L`} color="primary" />
                <Chip label={`At 60: ₹${(timeData[timeData.length-1]?.savings/10000000).toFixed(1)}Cr`} color="success" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 🎯 GRAPH 2: GOALS DIMENSION */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: 450 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                🎯 <strong>GOALS:</strong> Life Milestones Progress
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                How close are you to achieving your dreams?
              </Typography>
              
              <Box sx={{ flex: 1, minHeight: 220, overflowY: 'auto', pr: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={goalsData} layout="horizontal" margin={{ top: 20, right: 30, left: 120, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <YAxis type="category" dataKey="goal" width={100} />
                    <Tooltip 
                      formatter={(value) => [`${value.toFixed(1)}%`, 'Progress']}
                      labelFormatter={(label) => `Goal: ${label}`}
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        color: 'white'
                      }}
                    />
                    <Bar dataKey="progress" fill="#4CAF50" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              <Box sx={{ mt: 2, maxHeight: 120, overflowY: 'auto', pr: 1 }}>
                <Typography variant="body2" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                  Goal Timeline:
                </Typography>
                {goalsData.map((goal, index) => (
                  <Box key={index} sx={{ 
                    mb: 1.5,
                    p: 1,
                    bgcolor: '#f8f9fa',
                    borderRadius: 1,
                    border: '1px solid #e9ecef'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                        {goal.goal}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={`${goal.monthsNeeded} months`}
                        color={goal.monthsNeeded <= 24 ? 'success' : goal.monthsNeeded <= 60 ? 'warning' : 'error'}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Progress: {goal.progress.toFixed(1)}% | 
                      Target: ₹{(goal.target/100000).toFixed(1)}L | 
                      Current: ₹{(goal.current/100000).toFixed(1)}L
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 💗 GRAPH 3: EMOTIONAL DIMENSION */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: 450 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                💗 <strong>STRESS:</strong> Financial Anxiety Levels
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Lower stress = better financial health
              </Typography>
              
              <Box sx={{ flex: 1, minHeight: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stressData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      dataKey="stress"
                      label={({ category, stress }) => `${category}: ${stress}%`}
                      labelLine={false}
                    >
                      {stressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Stress Level']} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>Stress Indicators:</Typography>
                {stressData.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: item.color, mr: 1, borderRadius: 1 }} />
                    <Typography variant="caption" sx={{ flex: 1 }}>{item.category}</Typography>
                    <Chip 
                      size="small" 
                      label={item.stress < 40 ? 'Low' : item.stress < 70 ? 'Medium' : 'High'}
                      color={item.stress < 40 ? 'success' : item.stress < 70 ? 'warning' : 'error'}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 🎲 GRAPH 4: PROBABILITY DIMENSION */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ height: 450 }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                🎲 <strong>OUTCOMES:</strong> Possible Future Scenarios
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Different ways your financial future could unfold
              </Typography>
              
              <Box sx={{ flex: 1, minHeight: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={probabilityData} margin={{ top: 20, right: 30, left: 60, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="probability" 
                      type="number"
                      domain={[0, 40]}
                      label={{ value: 'Probability (%)', position: 'insideBottom', offset: -10 }}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      dataKey="finalAmount"
                      type="number"
                      domain={[10000000, 40000000]}
                      tickFormatter={(value) => `₹${(value/10000000).toFixed(1)}Cr`}
                      label={{ value: 'Final Amount', angle: -90, position: 'insideLeft' }}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'finalAmount' ? `₹${(value/10000000).toFixed(1)}Cr` : `${value}%`,
                        name === 'finalAmount' ? 'Final Amount' : 'Probability'
                      ]}
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0) {
                          const data = payload[0].payload;
                          return `${data.scenario}`;
                        }
                        return '';
                      }}
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        color: 'white'
                      }}
                    />
                    <Scatter dataKey="finalAmount" fill="#2196F3">
                      {probabilityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>Scenario Breakdown:</Typography>
                {probabilityData.map((scenario, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: scenario.color, mr: 1, borderRadius: 1 }} />
                      <Typography variant="caption">{scenario.scenario}</Typography>
                    </Box>
                    <Typography variant="caption" fontWeight="bold">
                      {scenario.probability}% → ₹{(scenario.finalAmount/10000000).toFixed(1)}Cr
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Summary Insights */}
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>🎯 Key Insights from Your 4D Analysis</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                ₹{(timeData[timeData.length-1]?.savings/10000000).toFixed(1)}Cr
              </Typography>
              <Typography variant="body2">Expected at Retirement</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {goalsData.filter(g => g.progress > 50).length}/4
              </Typography>
              <Typography variant="body2">Goals on Track</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {Math.round(stressData.reduce((sum, s) => sum + s.stress, 0) / stressData.length)}%
              </Typography>
              <Typography variant="body2">Average Stress Level</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                85%
              </Typography>
              <Typography variant="body2">Success Probability</Typography>
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
            bgcolor: '#2196F3',
            '&:hover': { bgcolor: '#1976D2' }
          }}
        >
          Back to 4D Menu
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={<DownloadIcon />}
          onClick={() => handleSimpleReportDownload('professional', financialData, calculatedInsights)}
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
          Optimize Plan
        </Button>
      </Box>
      </Box>
    </Box>
  );
};

export default FourGraphsView;
