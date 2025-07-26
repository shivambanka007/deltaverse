// Import environment setup script first
import './setupEnv';

import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Temporarily disable StrictMode to prevent auth listener loops in development
// StrictMode causes components to render twice which can interfere with Firebase auth
root.render(<App />);
