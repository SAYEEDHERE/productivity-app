import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import toast from 'react-hot-toast';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await AuthService.resetPassword(email);
    
    if (result.success) {
      toast.success('📧 Password reset email sent!');
      setSent(true);
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Reset Password 🔐</h1>
          <p>Enter your email to receive a password reset link</p>
        </div>

        {sent ? (
          <div className="success-message">
            <div className="success-icon">✅</div>
            <h3>Check your email!</h3>
            <p>We've sent a password reset link to <strong>{email}</strong></p>
            <Link to="/login" className="btn btn-primary">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="form-input"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="auth-btn primary"
            >
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}

        <div className="auth-links">
          <Link to="/login" className="back-link">
            ← Back to Sign In
          </Link>
        </div>

        <div className="auth-footer">
          <p className="made-by">Made with ❤️ by <strong>Sayeed</strong></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
