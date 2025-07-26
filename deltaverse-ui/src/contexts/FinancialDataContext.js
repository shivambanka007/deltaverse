/**
 * 🎯 FINANCIAL DATA CONTEXT - EXPERT SYNCHRONIZATION SOLUTION
 * 
 * This context ensures ALL 4D views stay perfectly synchronized:
 * - Crystal Clear Insights
 * - Professional Analysis (4 Graphs)
 * - Visual Journey
 * - Quick Answers
 * - Complex 4D Visualization
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Create the context
const FinancialDataContext = createContext();

// Custom hook to use the context
export const useFinancialData = () => {
  const context = useContext(FinancialDataContext);
  if (!context) {
    throw new Error('useFinancialData must be used within a FinancialDataProvider');
  }
  return context;
};

// Financial Data Provider Component
export const FinancialDataProvider = ({ children, fiMcpData }) => {
  // 💰 Core Financial Data (Single Source of Truth)
  const [financialData, setFinancialData] = useState({
    monthlyIncome: 0,
    monthlyExpenses: 0,
    currentSavings: 0,
    monthlySavings: 0,
    currentAge: 30,
    retirementAge: 60,
    lastUpdated: null
  });

  // 📊 Calculated Insights (Derived from core data)
  const [calculatedInsights, setCalculatedInsights] = useState({
    retirement: null,
    goals: null,
    risks: null,
    cashFlow: null,
    lastCalculated: null
  });

  // 🔄 Update core financial data
  const updateFinancialData = useCallback((newData) => {
    setFinancialData(prev => ({
      ...prev,
      ...newData,
      monthlySavings: (newData.monthlyIncome || prev.monthlyIncome) - (newData.monthlyExpenses || prev.monthlyExpenses),
      lastUpdated: new Date().toISOString()
    }));
  }, []);

  // 🧮 Calculate all financial insights (runs when core data changes)
  const calculateInsights = useCallback(() => {
    const { monthlyIncome, monthlyExpenses, currentSavings, monthlySavings, currentAge, retirementAge } = financialData;
    
    if (!monthlyIncome || !monthlyExpenses) return;

    const yearsToRetirement = retirementAge - currentAge;
    
    // 1. RETIREMENT ANALYSIS
    const projectedRetirementAmount = currentSavings + (monthlySavings * 12 * yearsToRetirement * 1.08);
    const retirementTarget = 20000000; // ₹2 Crores
    const retirementRatio = projectedRetirementAmount / retirementTarget;
    
    const retirement = {
      question: "Will I have enough money to retire comfortably?",
      projectedAmount: projectedRetirementAmount,
      targetAmount: retirementTarget,
      yearsLeft: yearsToRetirement,
      status: retirementRatio >= 1 ? "✅ ON TRACK" : "⚠️ NEED MORE",
      color: retirementRatio >= 1 ? "success" : "warning",
      recommendation: retirementRatio >= 1 
        ? `Keep saving ₹${(monthlySavings/1000).toFixed(0)}k per month. You're doing great!`
        : `Save ₹${Math.ceil((retirementTarget - projectedRetirementAmount) / (12 * yearsToRetirement) / 1000)}k more per month to reach your goal.`,
      progressPercentage: Math.min((projectedRetirementAmount / retirementTarget) * 100, 100)
    };

    // 2. GOALS ANALYSIS
    const goals = {
      question: "Am I on track for my major life goals?",
      emergencyGoal: { 
        name: "Emergency Fund", 
        target: monthlyExpenses * 6, 
        current: currentSavings * 0.6,
        priority: 1
      },
      houseGoal: { 
        name: "House Down Payment", 
        target: 1500000, 
        current: currentSavings * 0.3,
        priority: 2
      },
      educationGoal: { 
        name: "Child's Education", 
        target: 2500000, 
        current: currentSavings * 0.1,
        priority: 3
      }
    };

    const goalsOnTrack = Object.values(goals).filter(goal => 
      goal.target && (goal.current / goal.target) > 0.5
    ).length - 1; // Subtract 1 for the question property

    goals.status = goalsOnTrack >= 2 ? "✅ GOOD PROGRESS" : "⚠️ BEHIND SCHEDULE";
    goals.color = goalsOnTrack >= 2 ? "success" : "warning";
    goals.recommendation = goalsOnTrack >= 2 
      ? `${goalsOnTrack} out of 3 major goals are on track.`
      : "Focus on building your emergency fund first, then house savings.";

    // 3. RISK ANALYSIS
    const marketRisk = monthlySavings < 25000 ? 'HIGH' : monthlySavings < 40000 ? 'MEDIUM' : 'LOW';
    const inflationRisk = monthlySavings < 30000 ? 'HIGH' : 'LOW';
    const emergencyRisk = currentSavings < (monthlyExpenses * 6) ? 'HIGH' : 'LOW';
    
    const highRisks = [marketRisk, inflationRisk, emergencyRisk].filter(risk => risk === 'HIGH').length;
    
    const risks = {
      question: "What should I worry about with my money?",
      marketRisk,
      inflationRisk,
      emergencyRisk,
      status: highRisks === 0 ? "✅ LOW RISK" : highRisks === 1 ? "⚠️ MEDIUM RISK" : "🚨 HIGH RISK",
      color: highRisks === 0 ? "success" : highRisks === 1 ? "warning" : "error",
      recommendation: highRisks === 0 
        ? "Your financial risks are well managed."
        : highRisks === 1 
        ? "Address your emergency fund to reduce risk."
        : "Urgent: Build emergency fund and increase savings rate."
    };

    // 4. CASH FLOW ANALYSIS
    const savingsRate = (monthlySavings / monthlyIncome) * 100;
    const targetRate = 30;
    const monthlyGap = Math.max(0, (monthlyIncome * 0.3) - monthlySavings);
    
    const cashFlow = {
      question: "Is my money working hard enough for me?",
      savingsRate,
      targetRate,
      monthlyGap,
      status: savingsRate >= 30 ? "✅ EXCELLENT" : savingsRate >= 20 ? "✅ GOOD" : "⚠️ TOO LOW",
      color: savingsRate >= 30 ? "success" : savingsRate >= 20 ? "info" : "warning",
      recommendation: savingsRate >= 30 
        ? `Perfect! You're saving ${savingsRate.toFixed(0)}% of income.`
        : savingsRate >= 20 
        ? "Good savings rate. Try to reach 30% if possible."
        : `Increase savings by ₹${(monthlyGap/1000).toFixed(0)}k per month.`
    };

    // Update calculated insights
    setCalculatedInsights({
      retirement,
      goals,
      risks,
      cashFlow,
      lastCalculated: new Date().toISOString()
    });
  }, [financialData]);

  // 🔄 Initialize data from Fi-MCP
  useEffect(() => {
    if (fiMcpData) {
      updateFinancialData({
        monthlyIncome: fiMcpData.monthly_income || 80000,
        monthlyExpenses: fiMcpData.monthly_expenses || 50000,
        currentSavings: fiMcpData.savings || 500000
      });
    }
  }, [fiMcpData, updateFinancialData]);

  // 🧮 Recalculate insights when data changes
  useEffect(() => {
    calculateInsights();
  }, [calculateInsights]);

  // 📊 Generate data for different visualization types
  const getVisualizationData = useCallback((type) => {
    switch (type) {
      case 'timeGraph':
        return generateTimeGraphData();
      case 'goalsGraph':
        return generateGoalsGraphData();
      case 'riskGraph':
        return generateRiskGraphData();
      case 'outcomeGraph':
        return generateOutcomeGraphData();
      default:
        return null;
    }
  }, [financialData, calculatedInsights]);

  // 📈 Generate time graph data
  const generateTimeGraphData = () => {
    const data = [];
    let savings = financialData.currentSavings;
    const growthRate = calculatedInsights.risks?.marketRisk === 'HIGH' ? 1.05 : 
                     calculatedInsights.risks?.marketRisk === 'MEDIUM' ? 1.08 : 1.12;
    
    for (let year = 2024; year <= 2060; year++) {
      const age = financialData.currentAge + (year - 2024);
      savings += financialData.monthlySavings * 12 * growthRate;
      
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

  // 🎯 Generate goals graph data
  const generateGoalsGraphData = () => {
    if (!calculatedInsights.goals) return [];
    
    return [
      calculatedInsights.goals.emergencyGoal,
      calculatedInsights.goals.houseGoal,
      calculatedInsights.goals.educationGoal
    ].map(goal => ({
      ...goal,
      progress: Math.min((goal.current / goal.target) * 100, 100),
      remaining: goal.target - goal.current,
      monthsNeeded: Math.ceil((goal.target - goal.current) / financialData.monthlySavings)
    }));
  };

  // ⚠️ Generate risk graph data
  const generateRiskGraphData = () => {
    if (!calculatedInsights.risks) return [];
    
    return [
      { category: 'Market Risk', level: calculatedInsights.risks.marketRisk, color: '#FF5722' },
      { category: 'Inflation Risk', level: calculatedInsights.risks.inflationRisk, color: '#FF9800' },
      { category: 'Emergency Risk', level: calculatedInsights.risks.emergencyRisk, color: '#FFC107' }
    ];
  };

  // 🎲 Generate outcome graph data
  const generateOutcomeGraphData = () => {
    const baseAmount = calculatedInsights.retirement?.projectedAmount || 20000000;
    
    return [
      { scenario: 'Best Case', probability: 20, finalAmount: baseAmount * 1.75, color: '#4CAF50' },
      { scenario: 'Good Case', probability: 30, finalAmount: baseAmount * 1.25, color: '#8BC34A' },
      { scenario: 'Expected', probability: 35, finalAmount: baseAmount, color: '#2196F3' },
      { scenario: 'Poor Case', probability: 12, finalAmount: baseAmount * 0.75, color: '#FF9800' },
      { scenario: 'Worst Case', probability: 3, finalAmount: baseAmount * 0.5, color: '#F44336' }
    ];
  };

  // 🔄 Context value
  const contextValue = {
    // Core data
    financialData,
    updateFinancialData,
    
    // Calculated insights
    calculatedInsights,
    recalculateInsights: calculateInsights,
    
    // Visualization data
    getVisualizationData,
    
    // Utility functions
    isDataReady: !!calculatedInsights.lastCalculated,
    lastUpdated: financialData.lastUpdated,
    
    // Quick access to common calculations
    get monthlySavings() { return financialData.monthlySavings; },
    get savingsRate() { return calculatedInsights.cashFlow?.savingsRate || 0; },
    get retirementProgress() { return calculatedInsights.retirement?.progressPercentage || 0; },
    get riskLevel() { return calculatedInsights.risks?.status || 'Unknown'; }
  };

  return (
    <FinancialDataContext.Provider value={contextValue}>
      {children}
    </FinancialDataContext.Provider>
  );
};

export default FinancialDataContext;
