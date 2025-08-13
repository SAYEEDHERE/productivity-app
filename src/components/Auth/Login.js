import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail, sendSignInLinkToEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import './Auth.css';

const Login = ({ onToggleAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showLinkSignIn, setShowLinkSignIn] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleEmailPasswordSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage('Successfully signed in!');
    } catch (error) {
      console.error('Sign in error:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email. Please create an account first.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        default:
          setError('Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLinkSignIn = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const actionCodeSettings = {
        url: window.location.origin,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      localStorage.setItem('emailForSignIn', email);
      setMessage('Sign-in link sent to your email! Check your inbox.');
      setEmail('');
    } catch (error) {
      console.error('Email link sign-in error:', error);
      setError('Failed to send sign-in link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset link sent to your email! Check your inbox.');
      setShowForgotPassword(false);
      setEmail('');
    } catch (error) {
      console.error('Password reset error:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address.');
          break;
        default:
          setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setError('');
    setMessage('');
    setShowLinkSignIn(false);
    setShowForgotPassword(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your productivity account</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        {!showLinkSignIn && !showForgotPassword && (
          <>
            <form onSubmit={handleEmailPasswordSignIn} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="auth-button primary"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="auth-divider">
              <span>Or sign in with</span>
            </div>

            <button
              onClick={() => setShowLinkSignIn(true)}
              className="auth-button secondary"
              disabled={loading}
            >
              Sign in with Email Link
            </button>

            <div className="auth-footer">
              <button
                onClick={() => setShowForgotPassword(true)}
                className="link-button"
                disabled={loading}
              >
                Forgot your password?
              </button>
              
              <p>
                Don't have an account?{' '}
                <button onClick={onToggleAuth} className="link-button">
                  Create Account
                </button>
              </p>
            </div>
          </>
        )}

        {showLinkSignIn && (
          <>
            <form onSubmit={handleEmailLinkSignIn} className="auth-form">
              <div className="form-group">
                <label htmlFor="email-link">Email Address</label>
                <input
                  type="email"
                  id="email-link"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="auth-button primary"
                disabled={loading}
              >
                {loading ? 'Sending Link...' : 'Send Sign-In Link'}
              </button>
            </form>

            <button
              onClick={() => {
                resetForm();
              }}
              className="auth-button secondary"
              disabled={loading}
            >
              Back to Password Sign-In
            </button>
          </>
        )}

        {showForgotPassword && (
          <>
            <form onSubmit={handleForgotPassword} className="auth-form">
              <div className="form-group">
                <label htmlFor="reset-email">Email Address</label>
                <input
                  type="email"
                  id="reset-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="auth-button primary"
                disabled={loading}
              >
                {loading ? 'Sending Reset Link...' : 'Send Password Reset'}
              </button>
            </form>

            <button
              onClick={() => {
                resetForm();
              }}
              className="auth-button secondary"
              disabled={loading}
            >
              Back to Sign In
            </button>
          </>
        )}

        <div className="made-by">
          Made with ❤️ by Sayeed
        </div>
      </div>
    </div>
  );
};

export default Login;

