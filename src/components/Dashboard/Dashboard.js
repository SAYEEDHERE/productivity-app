import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService';
import TaskService from '../../services/TaskService';
import MoodService from '../../services/MoodService';
import GoogleCalendarService from '../../services/GoogleCalendarService';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [todayMood, setTodayMood] = useState(null);
  const [pomodoroStats, setPomodoroStats] = useState({ completed: 0, total: 8 });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        loadDashboardData(user.uid);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadDashboardData = async (userId) => {
    try {
      // Load today's tasks
      const tasks = await TaskService.getTodayTasks(userId);
      setTodayTasks(tasks);

      // Load today's mood
      const mood = await MoodService.getTodayMood(userId);
      setTodayMood(mood);

      // Load Pomodoro stats
      const stats = await TaskService.getTodayPomodoroStats(userId);
      setPomodoroStats(stats);

      // Check calendar connection
      await checkCalendarConnection();

      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const checkCalendarConnection = async () => {
    try {
      if (GoogleCalendarService.isCalendarSignedIn()) {
        setCalendarConnected(true);
        const eventsResult = await GoogleCalendarService.getUpcomingEvents(5);
        if (eventsResult.success) {
          setUpcomingEvents(eventsResult.events);
        }
      }
    } catch (error) {
      console.error('Error checking calendar connection:', error);
    }
  };

  const connectGoogleCalendar = async () => {
    try {
      const result = await GoogleCalendarService.signIn();
      if (result.success) {
        setCalendarConnected(true);
        toast.success('📅 Google Calendar connected!');
        await checkCalendarConnection();
      } else {
        toast.error('Failed to connect Google Calendar');
      }
    } catch (error) {
      toast.error('Error connecting to Google Calendar');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.displayName || user?.email?.split('@')[0];
    
    if (hour < 12) return `Good morning, ${name}! ☀️`;
    if (hour < 18) return `Good afternoon, ${name}! 🌤️`;
    return `Good evening, ${name}! 🌙`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="user-welcome">
          <h1>{getGreeting()}</h1>
          <p>Ready to crush your goals today?</p>
        </div>
        <div className="header-actions">
          {!calendarConnected && (
            <button 
              onClick={connectGoogleCalendar}
              className="connect-calendar-btn"
            >
              📅 Connect Calendar
            </button>
          )}
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Tasks Widget */}
        <div className="widget tasks-widget">
          <div className="widget-header">
            <h3>📋 Today's Tasks</h3>
            <div className="widget-icon">✅</div>
          </div>
          <div className="task-summary">
            <div className="stat">
              <span className="number">{todayTasks.filter(t => t.status === 'completed').length}</span>
              <span className="label">Completed</span>
            </div>
            <div className="stat">
              <span className="number">{todayTasks.length}</span>
              <span className="label">Total</span>
            </div>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${todayTasks.length > 0 ? (todayTasks.filter(t => t.status === 'completed').length / todayTasks.length) * 100 : 0}%` 
              }}
            ></div>
          </div>
          <button onClick={() => navigate('/todos')} className="widget-btn">
            Manage Tasks
          </button>
        </div>

        {/* Pomodoro Widget */}
        <div className="widget pomodoro-widget">
          <div className="widget-header">
            <h3>🍅 Pomodoro Sessions</h3>
            <div className="widget-icon">⏱️</div>
          </div>
          <div className="pomodoro-stats">
            <div className="pomodoro-circle">
              <div className="circle-progress">
                <span>{pomodoroStats.completed}</span>
                <small>/ {pomodoroStats.total}</small>
              </div>
            </div>
            <div className="pomodoro-info">
              <p>{(pomodoroStats.completed * 25)} minutes focused</p>
              <p>{Math.floor((pomodoroStats.completed * 25) / 60)}h {(pomodoroStats.completed * 25) % 60}m today</p>
            </div>
          </div>
          <button onClick={() => navigate('/pomodoro')} className="widget-btn">
            Start Session
          </button>
        </div>

        {/* Mood Widget */}
        <div className="widget mood-widget">
          <div className="widget-header">
            <h3>😊 Today's Mood</h3>
            <div className="widget-icon">💫</div>
          </div>
          <div className="mood-display">
            {todayMood ? (
              <div className="mood-score">
                <div className="mood-emoji">
                  {todayMood.mood >= 8 ? '😄' : 
                   todayMood.mood >= 6 ? '😊' : 
                   todayMood.mood >= 4 ? '😐' : '😔'}
                </div>
                <div className="mood-details">
                  <span className="score">{todayMood.mood}/10</span>
                  <span className="energy">Energy: {todayMood.energy}/10</span>
                </div>
              </div>
            ) : (
              <div className="no-mood">
                <span className="mood-emoji">🤔</span>
                <p>Track your mood today!</p>
              </div>
            )}
          </div>
          <button onClick={() => navigate('/mood')} className="widget-btn">
            Track Mood
          </button>
        </div>

        {/* Calendar Widget */}
        <div className="widget calendar-widget">
          <div className="widget-header">
            <h3>📅 Upcoming Events</h3>
            <div className="widget-icon">
              {calendarConnected ? '🟢' : '🔴'}
            </div>
          </div>
          <div className="calendar-content">
            {calendarConnected ? (
              upcomingEvents.length > 0 ? (
                <div className="events-list">
                  {upcomingEvents.slice(0, 3).map((event, index) => (
                    <div key={index} className="event-item">
                      <div className="event-title">{event.summary}</div>
                      <div className="event-time">
                        {new Date(event.start.dateTime || event.start.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No upcoming events</p>
              )
            ) : (
              <div className="calendar-disconnected">
                <p>Connect your Google Calendar to see upcoming events</p>
                <button onClick={connectGoogleCalendar} className="connect-btn">
                  Connect Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>⚡ Quick Actions</h3>
        <div className="action-buttons">
          <button 
            onClick={() => navigate('/todos')} 
            className="action-btn add-task"
          >
            ➕ Add Task
          </button>
          <button 
            onClick={() => navigate('/notes')} 
            className="action-btn add-note"
          >
            📝 Quick Note
          </button>
          <button 
            onClick={() => navigate('/pomodoro')} 
            className="action-btn start-pomodoro"
          >
            🍅 Start Focus
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

