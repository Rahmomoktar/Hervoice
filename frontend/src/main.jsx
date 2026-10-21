import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './style.css';
import './home.css';
import './auth.css';
createRoot(document.getElementById('root')).render(<AuthProvider><App /></AuthProvider>);


