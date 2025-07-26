// Firebase configuration and services
export { default as app, auth, db, analytics } from './config';

// Firebase authentication services
export {
  signInWithEmail,
  signUpWithEmail,
  signInWithPhone,
  verifyPhoneOTP,
  signInWithGoogle,
  signOutUser,
  createUserDocument,
  updateUserProfile,
  getUserProfile,
  resetPassword,
  changePassword,
  onAuthStateChange,
  initializeRecaptcha,
} from './auth';

// Firebase database services - matching actual exports
export {
  // Financial Profile
  createFinancialProfile,
  getFinancialProfile,
  updateFinancialProfile,
  
  // Transactions
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  
  // Financial Goals
  addFinancialGoal,
  getFinancialGoals,
  updateFinancialGoal,
  
  // AI Recommendations
  addAIRecommendation,
  getAIRecommendations,
  updateAIRecommendation,
  
  // Batch Operations
  batchUpdate,
  
  // Analytics
  getSpendingAnalytics,
  
  // Real-time Listeners
  subscribeToFinancialData,
  subscribeToTransactions,
} from './database';

// Default export
export { default } from './config';
