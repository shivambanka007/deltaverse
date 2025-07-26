import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  fetchFinancialHealthScore, 
  fetchMockFinancialHealthScore,
  fetchAvailableScenarios,
  fetchFinancialHealthHistory,
  fetchHistoricalScores,
  deleteUserFinancialData
} from '../../services/api/financial-health';
import { getDefaultScenario } from '../../utils/environment';

// Async thunk for fetching financial health score with scenario
export const fetchHealthScore = createAsyncThunk(
  'financialHealth/fetchHealthScore',
  async (phoneNumber = '2222222222', { rejectWithValue }) => {
    try {
      const response = await fetchFinancialHealthScore(phoneNumber);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching mock financial health score
export const fetchMockHealthScore = createAsyncThunk(
  'financialHealth/fetchMockHealthScore',
  async (phoneNumber = '2222222222', { rejectWithValue }) => {
    try {
      const response = await fetchMockFinancialHealthScore(phoneNumber);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching available scenarios
export const fetchScenarios = createAsyncThunk(
  'financialHealth/fetchScenarios',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchAvailableScenarios();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching user history
export const fetchUserHistory = createAsyncThunk(
  'financialHealth/fetchUserHistory',
  async (limit = 30, { rejectWithValue }) => {
    try {
      const response = await fetchFinancialHealthHistory(limit);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching historical scores
export const fetchHistoricalData = createAsyncThunk(
  'financialHealth/fetchHistoricalData',
  async (days = 90, { rejectWithValue }) => {
    try {
      const response = await fetchHistoricalScores(days);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for deleting user data
export const deleteUserData = createAsyncThunk(
  'financialHealth/deleteUserData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await deleteUserFinancialData();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // Health Score Data
  healthScore: null,
  overallScore: 0,
  components: [],
  recommendations: [],
  historicalScores: {},
  lastUpdated: null,
  
  // Scenarios and History
  availableScenarios: [],
  selectedScenario: getDefaultScenario(),
  userHistory: [],
  
  // Loading States
  loading: false,
  scenariosLoading: false,
  historyLoading: false,
  error: null,
  
  // UI States
  selectedComponent: null,
  showRecommendations: true,
  viewMode: 'dashboard', // 'dashboard', 'components', 'recommendations', 'history', 'scenarios'
  
  // Filters and Settings
  componentFilter: 'all', // 'all', 'excellent', 'good', 'fair', 'poor', 'critical'
  recommendationFilter: 'all', // 'all', 'high', 'medium', 'low'
  sortBy: 'score', // 'score', 'name', 'impact'
  sortOrder: 'desc', // 'asc', 'desc'
};

const financialHealthSlice = createSlice({
  name: 'financialHealth',
  initialState,
  reducers: {
    // UI Actions
    setSelectedComponent: (state, action) => {
      state.selectedComponent = action.payload;
    },
    
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    
    setShowRecommendations: (state, action) => {
      state.showRecommendations = action.payload;
    },
    
    setComponentFilter: (state, action) => {
      state.componentFilter = action.payload;
    },
    
    setRecommendationFilter: (state, action) => {
      state.recommendationFilter = action.payload;
    },
    
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    
    setSelectedScenario: (state, action) => {
      state.selectedScenario = action.payload;
    },
    
    // Data Actions
    clearHealthScore: (state) => {
      state.healthScore = null;
      state.overallScore = 0;
      state.components = [];
      state.recommendations = [];
      state.historicalScores = {};
      state.lastUpdated = null;
      state.error = null;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Manual data update (for real-time updates)
    updateHealthScore: (state, action) => {
      const { healthScore } = action.payload;
      state.healthScore = healthScore;
      state.overallScore = healthScore.overall_score;
      state.components = healthScore.components;
      state.recommendations = healthScore.recommendations;
      state.historicalScores = healthScore.historical_scores || {};
      state.lastUpdated = healthScore.last_updated;
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Fetch Health Score
      .addCase(fetchHealthScore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHealthScore.fulfilled, (state, action) => {
        state.loading = false;
        state.healthScore = action.payload;
        state.overallScore = action.payload.overall_score;
        state.components = action.payload.components;
        state.recommendations = action.payload.recommendations;
        state.historicalScores = action.payload.historical_scores || {};
        state.lastUpdated = action.payload.last_updated;
        state.error = null;
      })
      .addCase(fetchHealthScore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch health score';
      })
      
      // Fetch Mock Health Score
      .addCase(fetchMockHealthScore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMockHealthScore.fulfilled, (state, action) => {
        state.loading = false;
        state.healthScore = action.payload;
        state.overallScore = action.payload.overall_score;
        state.components = action.payload.components;
        state.recommendations = action.payload.recommendations;
        state.historicalScores = action.payload.historical_scores || {};
        state.lastUpdated = action.payload.last_updated;
        state.error = null;
      })
      .addCase(fetchMockHealthScore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch mock health score';
      })
      
      // Fetch Scenarios
      .addCase(fetchScenarios.pending, (state) => {
        state.scenariosLoading = true;
      })
      .addCase(fetchScenarios.fulfilled, (state, action) => {
        state.scenariosLoading = false;
        state.availableScenarios = action.payload;
      })
      .addCase(fetchScenarios.rejected, (state, action) => {
        state.scenariosLoading = false;
        console.error('Failed to fetch scenarios:', action.payload);
      })
      
      // Fetch User History
      .addCase(fetchUserHistory.pending, (state) => {
        state.historyLoading = true;
      })
      .addCase(fetchUserHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.userHistory = action.payload;
      })
      .addCase(fetchUserHistory.rejected, (state, action) => {
        state.historyLoading = false;
        console.error('Failed to fetch user history:', action.payload);
      })
      
      // Fetch Historical Data
      .addCase(fetchHistoricalData.fulfilled, (state, action) => {
        state.historicalScores = action.payload;
      })
      
      // Delete User Data
      .addCase(deleteUserData.fulfilled, (state) => {
        // Clear all user data after successful deletion
        state.healthScore = null;
        state.overallScore = 0;
        state.components = [];
        state.recommendations = [];
        state.historicalScores = {};
        state.lastUpdated = null;
        state.userHistory = [];
      });
  },
});

// Export actions
export const {
  setSelectedComponent,
  setViewMode,
  setShowRecommendations,
  setComponentFilter,
  setRecommendationFilter,
  setSortBy,
  setSortOrder,
  setSelectedScenario,
  clearHealthScore,
  clearError,
  updateHealthScore,
} = financialHealthSlice.actions;

// Selectors
export const selectFinancialHealth = (state) => state.financialHealth;
export const selectHealthScore = (state) => state.financialHealth.healthScore;
export const selectOverallScore = (state) => state.financialHealth.overallScore;
export const selectComponents = (state) => state.financialHealth.components;
export const selectRecommendations = (state) => state.financialHealth.recommendations;
export const selectHistoricalScores = (state) => state.financialHealth.historicalScores;
export const selectIsLoading = (state) => state.financialHealth.loading;
export const selectError = (state) => state.financialHealth.error;
export const selectViewMode = (state) => state.financialHealth.viewMode;
export const selectAvailableScenarios = (state) => state.financialHealth.availableScenarios;
export const selectSelectedScenario = (state) => state.financialHealth.selectedScenario;
export const selectUserHistory = (state) => state.financialHealth.userHistory;

// Filtered selectors
export const selectFilteredComponents = (state) => {
  const { components, componentFilter, sortBy, sortOrder } = state.financialHealth;
  
  let filtered = components;
  
  // Apply status filter
  if (componentFilter !== 'all') {
    filtered = components.filter(component => component.status === componentFilter);
  }
  
  // Apply sorting
  filtered = [...filtered].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'score':
        aValue = a.score;
        bValue = b.score;
        break;
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      default:
        aValue = a.score;
        bValue = b.score;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  return filtered;
};

export const selectFilteredRecommendations = (state) => {
  const { recommendations, recommendationFilter } = state.financialHealth;
  
  if (recommendationFilter === 'all') {
    return recommendations;
  }
  
  return recommendations.filter(rec => rec.impact === recommendationFilter);
};

export default financialHealthSlice.reducer;
