import React, { useState, useEffect } from 'react';
import AuthService from '../../services/AuthService';
import TaskService from '../../services/TaskService';
import MoodService from '../../services/MoodService';
import GoalsService from '../../services/GoalsService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './Analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [analytics, setAnalytics] = useState({
    tasks: [],
    moods: [],
    goals: [],
    productivity: {
      completionRate: 0,
      averageMood: 0,
      totalPomodoros: 0,
      activeGoals: 0
    }
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    const user = AuthService.getCurrentUser();
    if (!user) return;

    try {
      const [tasks, moods, goals] = await Promise.all([
        TaskService.getTasks(user.uid),
        MoodService.getMoodHistory(user.uid, parseInt(timeRange)),
        GoalsService.getGoals(user.uid)
      ]);

      // Calculate productivity metrics
      const completedTasks = tasks.filter(t => t.status === 'completed');
      const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
      
      const averageMood = moods.length > 0 ? 
        Math.round((moods.reduce((acc, m) => acc + m.mood, 0) / moods.length) * 10) / 10 : 0;
      
      const totalPomodoros = tasks.reduce((acc, task) => 
        acc + (task.pomodoroSessions?.length || 0), 0);
      
      const activeGoals = goals.filter(g => g.status === 'active').length;

      setAnalytics({
        tasks,
        moods,
        goals,
        productivity: {
          completionRate,
          averageMood,
          totalPomodoros,
          activeGoals
        }
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart data generators
  const getMoodTrendData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const moodData = last7Days.map(date => {
      const dayMood = analytics.moods.find(m => m.date === date);
      return dayMood ? dayMood.mood : null;
    });

    return {
      labels: last7Days.map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [
        {
          label: 'Mood Score',
          data: moodData,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };

  const getTaskCompletionData = () => {
    const categories = {};
    analytics.tasks.forEach(task => {
      if (!categories[task.category]) {
        categories[task.category] = { total: 0, completed: 0 };
      }
      categories[task.category].total++;
      if (task.status === 'completed') {
        categories[task.category].completed++;
      }
    });

    const labels = Object.keys(categories);
    const completionRates = labels.map(cat => 
      categories[cat].total > 0 ? Math.round((categories[cat].completed / categories[cat].total) * 100) : 0
    );

    return {
      labels,
      datasets: [
        {
          label: 'Completion Rate (%)',
          data: completionRates,
          backgroundColor: [
            '#6366f1',
            '#8b5cf6',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#06b6d4'
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      ]
    };
  };

  const getPomodoroData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const pomodoroData = last7Days.map(date => {
      return analytics.tasks.reduce((acc, task) => {
        if (task.pomodoroSessions) {
          const daySessions = task.pomodoroSessions.filter(session => {
            const sessionDate = new Date(session.completedAt).toISOString().split('T')[0];
            return sessionDate === date;
          });
          return acc + daySessions.length;
        }
        return acc;
      }, 0);
    });

    return {
      labels: last7Days.map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [
        {
          label: 'Pomodoro Sessions',
          data: pomodoroData,
          backgroundColor: '#f59e0b',
          borderColor: '#d97706',
          borderWidth: 2
        }
      ]
    };
  };

  const getGoalsStatusData = () => {
    const statusCounts = analytics.goals.reduce((acc, goal) => {
      acc[goal.status] = (acc[goal.status] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(statusCounts).map(status => 
        status.charAt(0).toUpperCase() + status.slice(1)
      ),
      datasets: [
        {
          data: Object.values(statusCounts),
          backgroundColor: [
            '#10b981', // active
            '#6366f1', // completed
            '#f59e0b', // paused
            '#ef4444'  // cancelled
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div className="header-left">
          <h1>📊 Analytics Dashboard</h1>
          <p>Insights into your productivity patterns and progress</p>
        </div>
        <div className="time-range-selector">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="range-select"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <span className="metric-value">{analytics.productivity.completionRate}%</span>
            <span className="metric-label">Task Completion Rate</span>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">😊</div>
          <div className="metric-content">
            <span className="metric-value">{analytics.productivity.averageMood}</span>
            <span className="metric-label">Average Mood Score</span>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">🍅</div>
          <div className="metric-content">
            <span className="metric-value">{analytics.productivity.totalPomodoros}</span>
            <span className="metric-label">Total Pomodoro Sessions</span>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <span className="metric-value">{analytics.productivity.activeGoals}</span>
            <span className="metric-label">Active Goals</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Mood Trend */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>📈 Mood Trend (Last 7 Days)</h3>
          </div>
          <div className="chart-container">
            <Line data={getMoodTrendData()} options={chartOptions} />
          </div>
        </div>

        {/* Task Completion by Category */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>📋 Task Completion by Category</h3>
          </div>
          <div className="chart-container">
            <Bar data={getTaskCompletionData()} options={chartOptions} />
          </div>
        </div>

        {/* Pomodoro Sessions */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>🍅 Daily Pomodoro Sessions</h3>
          </div>
          <div className="chart-container">
            <Bar data={getPomodoroData()} options={chartOptions} />
          </div>
        </div>

        {/* Goals Status */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>🎯 Goals Status Distribution</h3>
          </div>
          <div className="chart-container">
            <Doughnut 
              data={getGoalsStatusData()} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }} 
            />
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="insights-section">
        <h3>💡 Insights & Recommendations</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">📈</div>
            <div className="insight-content">
              <h4>Productivity Pattern</h4>
              <p>
                {analytics.productivity.completionRate >= 80 
                  ? "Excellent! You're maintaining high productivity levels."
                  : analytics.productivity.completionRate >= 60
                  ? "Good progress! Consider breaking down larger tasks."
                  : "Room for improvement. Try the Pomodoro technique for better focus."
                }
              </p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon">😊</div>
            <div className="insight-content">
              <h4>Mood Analysis</h4>
              <p>
                {analytics.productivity.averageMood >= 7
                  ? "Great mood stability! Keep up the positive energy."
                  : analytics.productivity.averageMood >= 5
                  ? "Moderate mood levels. Consider mood-boosting activities."
                  : "Focus on self-care and stress management techniques."
                }
              </p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon">🎯</div>
            <div className="insight-content">
              <h4>Goal Progress</h4>
              <p>
                {analytics.productivity.activeGoals > 0
                  ? `You have ${analytics.productivity.activeGoals} active goals. Great ambition!`
                  : "Consider setting some goals to drive your productivity forward."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
