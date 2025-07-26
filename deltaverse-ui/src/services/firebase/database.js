import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';

/**
 * User Financial Data Management
 */

// Create or update financial profile
export const createFinancialProfile = async (userId, profileData) => {
  try {
    await setDoc(doc(db, 'financial_data', userId), {
      userId,
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    // Silent error handling - no console logs
    return { success: false, error: error.message };
  }
};

// Get user's financial profile
export const getFinancialProfile = async userId => {
  try {
    const docRef = doc(db, 'financial_data', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: 'Financial profile not found' };
    }
  } catch (error) {
    // Silent error handling - no console logs
    return { success: false, error: error.message };
  }
};

// Update financial profile
export const updateFinancialProfile = async (userId, updates) => {
  try {
    await updateDoc(doc(db, 'financial_data', userId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    // Silent error handling - no console logs
    return { success: false, error: error.message };
  }
};

/**
 * Transaction Management
 */

// Add a new transaction
export const addTransaction = async (userId, transactionData) => {
  try {
    const docRef = await addDoc(collection(db, 'transactions'), {
      userId,
      ...transactionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    // Silent error handling - no console logs
    return { success: false, error: error.message };
  }
};

// Get user's transactions
export const getTransactions = async (userId, limitCount = 50) => {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const transactions = [];
    querySnapshot.forEach(doc => {
      transactions.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: transactions };
  } catch (error) {
    // Silent error handling - no console logs
    return { success: false, error: error.message };
  }
};

// Update a transaction
export const updateTransaction = async (transactionId, updates) => {
  try {
    await updateDoc(doc(db, 'transactions', transactionId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    // Silent error handling - no console logs
    return { success: false, error: error.message };
  }
};

// Delete a transaction
export const deleteTransaction = async transactionId => {
  try {
    await deleteDoc(doc(db, 'transactions', transactionId));
    return { success: true };
  } catch (error) {
    // Silent error handling - no console logs
    return { success: false, error: error.message };
  }
};

/**
 * Financial Goals Management
 */

// Add a new financial goal
export const addFinancialGoal = async (userId, goalData) => {
  try {
    const docRef = await addDoc(collection(db, 'financial_goals'), {
      userId,
      ...goalData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    // Silent error handling - no console logs
    return { success: false, error: error.message };
  }
};

// Get user's financial goals
export const getFinancialGoals = async userId => {
  try {
    const q = query(
      collection(db, 'financial_goals'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const goals = [];
    querySnapshot.forEach(doc => {
      goals.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: goals };
  } catch (error) {
    // Silent error handling - no console logs
    return { success: false, error: error.message };
  }
};

// Update a financial goal
export const updateFinancialGoal = async (goalId, updates) => {
  try {
    await updateDoc(doc(db, 'financial_goals', goalId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    // Silent error handling - no console logs
    return { success: false, error: error.message };
  }
};

/**
 * AI Recommendations Management
 */

// Add AI recommendation
export const addAIRecommendation = async (userId, recommendationData) => {
  try {
    const docRef = await addDoc(collection(db, 'ai_recommendations'), {
      userId,
      ...recommendationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    // Silent error handling - no console logs
    return { success: false, error: error.message };
  }
};

// Get AI recommendations for user
export const getAIRecommendations = async userId => {
  try {
    const q = query(
      collection(db, 'ai_recommendations'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    const recommendations = [];
    querySnapshot.forEach(doc => {
      recommendations.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: recommendations };
  } catch (error) {
    // Silent error handling - no console logs
    return { success: false, error: error.message };
  }
};

// Update AI recommendation status
export const updateAIRecommendation = async (recommendationId, updates) => {
  try {
    await updateDoc(doc(db, 'ai_recommendations', recommendationId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    // Silent error handling - no console logs
    return { success: false, error: error.message };
  }
};

/**
 * Batch Operations
 */

// Batch update multiple documents
export const batchUpdate = async operations => {
  try {
    const batch = writeBatch(db);

    operations.forEach(operation => {
      const { type, collection: collectionName, id, data } = operation;
      const docRef = doc(db, collectionName, id);

      if (type === 'update') {
        batch.update(docRef, { ...data, updatedAt: serverTimestamp() });
      } else if (type === 'set') {
        batch.set(docRef, { ...data, updatedAt: serverTimestamp() });
      } else if (type === 'delete') {
        batch.delete(docRef);
      }
    });

    await batch.commit();
    return { success: true };
  } catch (error) {
    // Silent error handling - no console logs
    return { success: false, error: error.message };
  }
};

/**
 * Analytics and Insights
 */

// Get spending analytics
export const getSpendingAnalytics = async (userId, startDate, endDate) => {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const transactions = [];
    querySnapshot.forEach(doc => {
      transactions.push({ id: doc.id, ...doc.data() });
    });

    // Process analytics
    const analytics = {
      totalIncome: 0,
      totalExpenses: 0,
      categoryBreakdown: {},
      monthlyTrends: {},
    };

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        analytics.totalIncome += transaction.amount;
      } else {
        analytics.totalExpenses += transaction.amount;
        analytics.categoryBreakdown[transaction.category] =
          (analytics.categoryBreakdown[transaction.category] || 0) +
          transaction.amount;
      }
    });

    return { success: true, data: analytics };
  } catch (error) {
    // Silent error handling - no console logs
    return { success: false, error: error.message };
  }
};

/**
 * Real-time Listeners
 */

// Listen to user's financial data changes
export const subscribeToFinancialData = (userId, callback) => {
  const unsubscribe = onSnapshot(
    doc(db, 'financial_data', userId),
    doc => {
      if (doc.exists()) {
        callback({ success: true, data: doc.data() });
      } else {
        callback({ success: false, error: 'Document not found' });
      }
    },
    error => {
      callback({ success: false, error: error.message });
    }
  );

  return unsubscribe;
};

// Listen to user's transactions
export const subscribeToTransactions = (userId, callback) => {
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  const unsubscribe = onSnapshot(
    q,
    querySnapshot => {
      const transactions = [];
      querySnapshot.forEach(doc => {
        transactions.push({ id: doc.id, ...doc.data() });
      });
      callback({ success: true, data: transactions });
    },
    error => {
      callback({ success: false, error: error.message });
    }
  );

  return unsubscribe;
};

const databaseService = {
  createFinancialProfile,
  getFinancialProfile,
  updateFinancialProfile,
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  addFinancialGoal,
  getFinancialGoals,
  updateFinancialGoal,
  addAIRecommendation,
  getAIRecommendations,
  updateAIRecommendation,
  batchUpdate,
  getSpendingAnalytics,
  subscribeToFinancialData,
  subscribeToTransactions,
};

export default databaseService;
