import React, { useState, useEffect } from 'react';
import MoodService from '../../services/MoodService';
import AuthService from '../../services/AuthService';
import toast from 'react-hot-toast';
import './Mood.css';

const Mood = () => {
  const [todayMood, setTodayMood] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTracker, setShowTracker] = useState(false);
  
  // Form states
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [notes, setNotes] = useState('');
  const [activities, setActivities] = useState([]);

  const moodEmojis = [
    { value: 1, emoji: '😢', label: 'Terrible' },
    { value: 2, emoji: '😔', label: 'Bad' },
    { value: 3, emoji: '😕', label: 'Poor' },
    { value: 4, emoji: '😐', label: 'Okay' },
    { value: 5, emoji: '🙂', label: 'Fine' },
    { value: 6, emoji: '😊', label: 'Good' },
    { value: 7, emoji: '😄', label: 'Great' },
    { value: 8, emoji: '😆', label: 'Excellent' },
    { value: 9, emoji: '🤩', label: 'Amazing' },
    { value: 10, emoji: '🥳', label: 'Perfect' }
  ];

  const activityOptions = [
    '💪 Exercise', '📚 Reading', '🎵 Music', '👥 Socializing',
    '🍃 Nature', '🧘 Meditation', '🎨 Creative', '🍽️ Cooking',
    '💼 Work', '🎮 Gaming', '📺 Entertainment', '😴 Rest'
  ];

  useEffect(() => {
    loadMoodData();
  }, []);

  const loadMoodData = async () => {
    const user = AuthService.getCurrentUser();
    if (user) {
      const today = await MoodService.getTodayMood(user.uid);
      const history = await MoodService.getMoodHistory(user.uid, 30);
      
      setTodayMood(today);
      setMoodHistory(history);
      
      if (today) {
        setMood(today.mood);
        setEnergy(today.energy);
        setNotes(today.notes || '');
        setActivities(today.activities || []);
      }
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = AuthService.getCurrentUser();
    
    if (!user) return;

    const moodData = {
      mood,
      energy,
      notes,
      activities
    };

    try {
      let result;
      if (todayMood) {
        result = await MoodService.updateMood(todayMood.id, moodData);
        toast.success('Mood updated successfully!');
      } else {
        result = await MoodService.logMood(user.uid, moodData);
        toast.success('Mood logged successfully!');
      }

      if (result.success) {
        await loadMoodData();
        setShowTracker(false);
      }
    } catch (error) {
      toast.error('Failed to save mood');
    }
  };

  const toggleActivity = (activity) => {
    setActivities(prev => 
      prev.includes(activity) 
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const getMoodColor = (moodValue) => {
    if (moodValue >= 8) return '#10b981';
    if (moodValue >= 6) return '#f59e0b';
    if (moodValue >= 4) return '#f97316';
    return '#ef4444';
  };

  const getAverageMood = () => {
    if (moodHistory.length === 0) return 0;
    const sum = moodHistory.reduce((acc, entry) => acc + entry.mood, 0);
    return (sum / moodHistory.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your mood data...</p>
      </div>
    );
  }

  return (
    <div className="mood-container">
      <div className="mood-header">
        <div className="header-left">
          <h1>😊 Mood Tracker</h1>
          <p>Track your daily mood and energy levels to understand patterns</p>
        </div>
        <button 
          onClick={() => setShowTracker(true)}
          className="track-mood-btn"
        >
          {todayMood ? '✏️ Update Mood' : '➕ Track Mood'}
        </button>
      </div>

      {/* Today's Mood Overview */}
      <div className="mood-overview">
        <div className="today-mood">
          <h3>Today's Mood</h3>
          {todayMood ? (
            <div className="mood-display">
              <div className="mood-circle" style={{ borderColor: getMoodColor(todayMood.mood) }}>
                <span className="mood-emoji-large">
                  {moodEmojis.find(m => m.value === todayMood.mood)?.emoji}
                </span>
              </div>
              <div className="mood-details">
                <div className="mood-score">
                  <span className="score">{todayMood.mood}/10</span>
                  <span className="label">Mood</span>
                </div>
                <div className="energy-score">
                  <span className="score">{todayMood.energy}/10</span>
                  <span className="label">Energy</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-mood">
              <span className="placeholder-emoji">🤔</span>
              <p>No mood tracked today</p>
              <button onClick={() => setShowTracker(true)} className="track-now-btn">
                Track Now
              </button>
            </div>
          )}
        </div>

        <div className="mood-stats">
          <div className="stat-item">
            <span className="stat-number">{getAverageMood()}</span>
            <span className="stat-label">30-day Average</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{moodHistory.length}</span>
            <span className="stat-label">Days Tracked</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {moodHistory.filter(m => m.mood >= 7).length}
            </span>
            <span className="stat-label">Great Days</span>
          </div>
        </div>
      </div>

      {/* Mood Tracker Modal */}
      {showTracker && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{todayMood ? 'Update Your Mood' : 'Track Your Mood'}</h2>
              <button onClick={() => setShowTracker(false)} className="close-btn">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="mood-form">
              <div className="mood-selector">
                <label>How are you feeling today?</label>
                <div className="mood-scale">
                  {moodEmojis.map((moodOption) => (
                    <button
                      key={moodOption.value}
                      type="button"
                      onClick={() => setMood(moodOption.value)}
                      className={`mood-option ${mood === moodOption.value ? 'selected' : ''}`}
                    >
                      <span className="emoji">{moodOption.emoji}</span>
                      <span className="value">{moodOption.value}</span>
                      <span className="label">{moodOption.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="energy-selector">
                <label>Energy Level: {energy}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={energy}
                  onChange={(e) => setEnergy(parseInt(e.target.value))}
                  className="energy-slider"
                  style={{ 
                    background: `linear-gradient(to right, #ef4444 0%, #f97316 25%, #f59e0b 50%, #10b981 75%, #10b981 100%)` 
                  }}
                />
                <div className="energy-labels">
                  <span>😴 Low</span>
                  <span>⚡ High</span>
                </div>
              </div>

              <div className="activities-selector">
                <label>What did you do today?</label>
                <div className="activities-grid">
                  {activityOptions.map((activity) => (
                    <button
                      key={activity}
                      type="button"
                      onClick={() => toggleActivity(activity)}
                      className={`activity-option ${activities.includes(activity) ? 'selected' : ''}`}
                    >
                      {activity}
                    </button>
                  ))}
                </div>
              </div>

              <div className="notes-section">
                <label>Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="How was your day? Any thoughts or observations..."
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowTracker(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {todayMood ? 'Update Mood' : 'Save Mood'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mood History */}
      <div className="mood-history">
        <h3>📈 Mood History</h3>
        {moodHistory.length > 0 ? (
          <div className="history-grid">
            {moodHistory.slice(0, 14).map((entry, index) => (
              <div key={index} className="history-item">
                <div className="date">{new Date(entry.date).toLocaleDateString()}</div>
                <div className="mood-emoji">
                  {moodEmojis.find(m => m.value === entry.mood)?.emoji}
                </div>
                <div className="scores">
                  <span className="mood-score" style={{ color: getMoodColor(entry.mood) }}>
                    {entry.mood}
                  </span>
                  <span className="energy-score">⚡{entry.energy}</span>
                </div>
                {entry.notes && (
                  <div className="entry-notes">{entry.notes}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-history">
            <span className="empty-emoji">📊</span>
            <p>Start tracking your mood to see patterns and insights</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mood;
