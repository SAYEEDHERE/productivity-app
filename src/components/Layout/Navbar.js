import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import toast from 'react-hot-toast';
import './Layout.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = AuthService.getCurrentUser();

  const handleSignOut = async () => {
    const result = await AuthService.signOut();
    if (result.success) {
      toast.success('Signed out successfully');
      navigate('/login');
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/todos', label: 'Tasks', icon: '📋' },
    { path: '/pomodoro', label: 'Pomodoro', icon: '🍅' },
    { path: '/mood', label: 'Mood', icon: '😊' },
    { path: '/notes', label: 'Notes', icon: '📝' },
    { path: '/goals', label: 'Goals', icon: '🎯' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard" className="brand-link">
          <span className="brand-icon">📋</span>
          <span className="brand-text">Productivity</span>
        </Link>
      </div>

      <div className="navbar-menu">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="navbar-user">
        <div className="user-info">
          <span className="user-name">
            {user?.displayName || user?.email?.split('@')[0]}
          </span>
          <button onClick={handleSignOut} className="sign-out-btn">
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
