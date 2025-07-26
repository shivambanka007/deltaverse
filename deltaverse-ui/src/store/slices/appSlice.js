import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // UI state
  theme: 'light',
  sidebarOpen: false,
  loading: false,
  error: null,

  // Notifications
  notifications: [],

  // Modal state
  modals: {},

  // App metadata
  version: '1.0.0',
  lastUpdated: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // Theme management
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleTheme: state => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },

    // Sidebar management
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar: state => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    // Loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Error handling
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: state => {
      state.error = null;
    },

    // Notification management
    addNotification: (state, action) => {
      const notification = {
        id: Date.now().toString(),
        type: 'info',
        read: false,
        timestamp: Date.now(),
        ...action.payload,
      };
      state.notifications.unshift(notification);

      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearNotifications: state => {
      state.notifications = [];
    },
    markNotificationAsRead: (state, action) => {
      const notification = state.notifications.find(
        n => n.id === action.payload
      );
      if (notification) {
        notification.read = true;
      }
    },

    // Modal management
    openModal: (state, action) => {
      const { modalId, props = {} } = action.payload;
      state.modals[modalId] = {
        isOpen: true,
        props,
      };
    },
    closeModal: (state, action) => {
      const modalId = action.payload;
      if (state.modals[modalId]) {
        state.modals[modalId].isOpen = false;
      }
    },
    closeAllModals: state => {
      Object.keys(state.modals).forEach(modalId => {
        state.modals[modalId].isOpen = false;
      });
    },

    // App metadata
    updateLastUpdated: state => {
      state.lastUpdated = Date.now();
    },
  },
});

// Action creators
export const {
  setTheme,
  toggleTheme,
  setSidebarOpen,
  toggleSidebar,
  setLoading,
  setError,
  clearError,
  addNotification,
  removeNotification,
  clearNotifications,
  markNotificationAsRead,
  openModal,
  closeModal,
  closeAllModals,
  updateLastUpdated,
} = appSlice.actions;

// Selectors
export const selectTheme = state => state.app.theme;
export const selectSidebarOpen = state => state.app.sidebarOpen;
export const selectLoading = state => state.app.loading;
export const selectError = state => state.app.error;
export const selectNotifications = state => state.app.notifications;
export const selectUnreadNotifications = state =>
  state.app.notifications.filter(n => !n.read);
export const selectModal = (state, modalId) => state.app.modals[modalId];
export const selectAppVersion = state => state.app.version;
export const selectLastUpdated = state => state.app.lastUpdated;

// Thunks for complex operations
export const showNotification =
  ({ message, type = 'info', duration = 5000 }) =>
  dispatch => {
    const id = Date.now().toString();
    dispatch(
      addNotification({
        id,
        message,
        type,
      })
    );

    // Auto-remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        dispatch(removeNotification(id));
      }, duration);
    }

    return id;
  };

export const showErrorNotification = message =>
  showNotification({ message, type: 'error' });

export const showSuccessNotification = message =>
  showNotification({ message, type: 'success' });

export const showWarningNotification = message =>
  showNotification({ message, type: 'warning' });

export default appSlice.reducer;
