import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthService from './services/AuthService';

// Components
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import ForgotPassword from './components/Auth/ForgotPassword';
import Dashboard from './components/Dashboard/Dashboard';
import Todos from './components/Todos/Todos';
import Pomodoro from './components/Pomodoro/Pomodoro';
import Mood from './components/Mood/Mood';
import Notes from './components/Notes/Notes';
import Goals from './components/Goals/Goals';
import Analytics from './components/Analytics/Analytics';
import Layout from './components/Layout/Layout';
import Footer from './components/Layout/Footer';
import LoadingScreen from './components/Common/LoadingScreen';

// Styles
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router basename="/productivity-app">
      <div className="App">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '12px',
              fontSize: '14px'
            },
            success: {
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff'
              }
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff'
              }
            }
          }}
        />
        
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={!user ? <Login /> : <Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/signup" 
            element={!user ? <SignUp /> : <Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/forgot-password" 
            element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" replace />} 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Layout><Dashboard /></Layout> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/todos" 
            element={user ? <Layout><Todos /></Layout> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/pomodoro" 
            element={user ? <Layout><Pomodoro /></Layout> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/mood" 
            element={user ? <Layout><Mood /></Layout> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/notes" 
            element={user ? <Layout><Notes /></Layout> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/goals" 
            element={user ? <Layout><Goals /></Layout> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/analytics" 
            element={user ? <Layout><Analytics /></Layout> : <Navigate to="/login" replace />} 
          />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
