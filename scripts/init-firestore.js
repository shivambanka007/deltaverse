#!/usr/bin/env node

/**
 * DeltaVerse - AI Finance Advisor
 * Firestore Database Initialization Script
 * 
 * This script initializes your Firestore database with:
 * - Sample market data
 * - App configuration
 * - Default categories and settings
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK
// Note: You'll need to download service account key from Firebase Console
// and set GOOGLE_APPLICATION_CREDENTIALS environment variable
const app = initializeApp();
const db = getFirestore();

async function initializeDatabase() {
  console.log('🔥 Initializing DeltaVerse Firestore Database...');

  try {
    // Initialize market data
    await initializeMarketData();
    
    // Initialize app configuration
    await initializeAppConfig();
    
    // Initialize transaction categories
    await initializeCategories();
    
    // Initialize default financial goals templates
    await initializeGoalTemplates();
    
    console.log('✅ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

async function initializeMarketData() {
  console.log('📊 Initializing market data...');
  
  const marketData = {
    indices: {
      sp500: {
        name: 'S&P 500',
        symbol: 'SPX',
        value: 4500.00,
        change: 25.50,
        changePercent: 0.57,
        lastUpdated: new Date()
      },
      nasdaq: {
        name: 'NASDAQ',
        symbol: 'IXIC',
        value: 14000.00,
        change: -15.25,
        changePercent: -0.11,
        lastUpdated: new Date()
      },
      dow: {
        name: 'Dow Jones',
        symbol: 'DJI',
        value: 35000.00,
        change: 100.75,
        changePercent: 0.29,
        lastUpdated: new Date()
      }
    },
    currencies: {
      usd_inr: {
        name: 'USD to INR',
        rate: 83.25,
        change: 0.15,
        changePercent: 0.18,
        lastUpdated: new Date()
      }
    },
    commodities: {
      gold: {
        name: 'Gold',
        price: 2000.50,
        change: -5.25,
        changePercent: -0.26,
        unit: 'USD/oz',
        lastUpdated: new Date()
      }
    }
  };

  await db.collection('market_data').doc('current').set(marketData);
  console.log('✅ Market data initialized');
}

async function initializeAppConfig() {
  console.log('⚙️ Initializing app configuration...');
  
  const appConfig = {
    version: '1.0.0',
    features: {
      aiRecommendations: true,
      goalTracking: true,
      transactionAnalysis: true,
      marketData: true,
      notifications: true
    },
    limits: {
      maxTransactionsPerUser: 10000,
      maxGoalsPerUser: 20,
      maxRecommendationsPerUser: 50
    },
    ai: {
      confidenceThreshold: 0.7,
      recommendationTypes: [
        'investment',
        'savings',
        'spending',
        'goal_planning',
        'risk_management'
      ]
    },
    currencies: ['USD', 'INR', 'EUR', 'GBP'],
    languages: ['en', 'hi'],
    lastUpdated: new Date()
  };

  await db.collection('app_config').doc('settings').set(appConfig);
  console.log('✅ App configuration initialized');
}

async function initializeCategories() {
  console.log('📂 Initializing transaction categories...');
  
  const categories = {
    income: [
      { id: 'salary', name: 'Salary', icon: '💼', color: '#10B981' },
      { id: 'freelance', name: 'Freelance', icon: '💻', color: '#059669' },
      { id: 'investment', name: 'Investment Returns', icon: '📈', color: '#047857' },
      { id: 'other_income', name: 'Other Income', icon: '💰', color: '#065F46' }
    ],
    expenses: [
      { id: 'food', name: 'Food & Dining', icon: '🍽️', color: '#EF4444' },
      { id: 'transport', name: 'Transportation', icon: '🚗', color: '#F97316' },
      { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#8B5CF6' },
      { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#EC4899' },
      { id: 'utilities', name: 'Utilities', icon: '⚡', color: '#6B7280' },
      { id: 'healthcare', name: 'Healthcare', icon: '🏥', color: '#DC2626' },
      { id: 'education', name: 'Education', icon: '📚', color: '#2563EB' },
      { id: 'travel', name: 'Travel', icon: '✈️', color: '#0891B2' },
      { id: 'other_expense', name: 'Other Expenses', icon: '📝', color: '#6B7280' }
    ]
  };

  await db.collection('app_config').doc('categories').set(categories);
  console.log('✅ Transaction categories initialized');
}

async function initializeGoalTemplates() {
  console.log('🎯 Initializing financial goal templates...');
  
  const goalTemplates = [
    {
      id: 'emergency_fund',
      name: 'Emergency Fund',
      description: 'Build an emergency fund covering 6 months of expenses',
      category: 'savings',
      icon: '🛡️',
      defaultAmount: 50000,
      priority: 'high',
      timeframe: 12 // months
    },
    {
      id: 'dream_home',
      name: 'Dream Home',
      description: 'Save for your dream home down payment',
      category: 'major_purchase',
      icon: '🏠',
      defaultAmount: 500000,
      priority: 'high',
      timeframe: 60 // months
    },
    {
      id: 'car_purchase',
      name: 'Car Purchase',
      description: 'Save for a new car',
      category: 'major_purchase',
      icon: '🚗',
      defaultAmount: 800000,
      priority: 'medium',
      timeframe: 36 // months
    },
    {
      id: 'retirement',
      name: 'Retirement Fund',
      description: 'Build a comfortable retirement corpus',
      category: 'retirement',
      icon: '🏖️',
      defaultAmount: 10000000,
      priority: 'high',
      timeframe: 300 // months (25 years)
    },
    {
      id: 'vacation',
      name: 'Dream Vacation',
      description: 'Save for your dream vacation',
      category: 'lifestyle',
      icon: '🏝️',
      defaultAmount: 200000,
      priority: 'low',
      timeframe: 12 // months
    },
    {
      id: 'education',
      name: 'Education Fund',
      description: 'Save for higher education or skill development',
      category: 'education',
      icon: '🎓',
      defaultAmount: 300000,
      priority: 'medium',
      timeframe: 24 // months
    }
  ];

  await db.collection('app_config').doc('goal_templates').set({ templates: goalTemplates });
  console.log('✅ Financial goal templates initialized');
}

// Run the initialization
if (require.main === module) {
  initializeDatabase();
}

module.exports = {
  initializeDatabase,
  initializeMarketData,
  initializeAppConfig,
  initializeCategories,
  initializeGoalTemplates
};
