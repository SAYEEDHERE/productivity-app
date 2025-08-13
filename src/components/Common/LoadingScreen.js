import React from 'react';
import './Common.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">📋</div>
        <div className="loading-spinner"></div>
        <div className="loading-text">Productivity App</div>
        <div className="loading-subtext">Loading your workspace...</div>
        <div className="loading-author">Made with ❤️ by <strong>Sayeed</strong></div>
        
        <div className="loading-progress">
          <div className="loading-progress-bar"></div>
        </div>
        
        <div className="loading-features">
          <span>🍅 Pomodoro</span>
          <span>📋 Tasks</span>
          <span>😊 Mood</span>
          <span>📅 Calendar</span>
          <span>📊 Analytics</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
