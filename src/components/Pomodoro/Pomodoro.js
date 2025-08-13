import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskService from '../../services/TaskService';
import AuthService from '../../services/AuthService';
import toast from 'react-hot-toast';
import './Pomodoro.css';

const Pomodoro = () => {
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState(0);
  const [sessionType, setSessionType] = useState('work'); // work, break, long-break
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const WORK_TIME = 25 * 60;
  const SHORT_BREAK = 5 * 60;
  const LONG_BREAK = 15 * 60;

  useEffect(() => {
    loadTasks();
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (isActive && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, time]);

  const loadTasks = async () => {
    const user = AuthService.getCurrentUser();
    if (user) {
      const userTasks = await TaskService.getTasks(user.uid);
      const pendingTasks = userTasks.filter(task => task.status !== 'completed');
      setTasks(pendingTasks);
    }
  };

  const handleTimerComplete = async () => {
    setIsActive(false);
    
    // Play notification sound (browser will handle this)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(
        sessionType === 'work' ? '🍅 Work session complete!' : '☕ Break time over!',
        {
          body: sessionType === 'work' ? 'Time for a break!' : 'Ready for another session?',
          icon: '/logo192.png'
        }
      );
    }

    if (sessionType === 'work' && selectedTask) {
      // Completed a work session
      const sessionData = {
        duration: WORK_TIME / 60, // in minutes
        completedAt: new Date(),
        type: 'work'
      };
      
      await TaskService.addPomodoroSession(selectedTask.id, sessionData);
      setSessions(prev => prev + 1);
      toast.success('🍅 Work session completed! Great job!');
      
      // Start break
      const isLongBreak = (sessions + 1) % 4 === 0;
      setSessionType(isLongBreak ? 'long-break' : 'break');
      setTime(isLongBreak ? LONG_BREAK : SHORT_BREAK);
      setIsBreak(true);
    } else {
      // Completed a break
      toast.success('Break time over! Ready for another session?');
      setSessionType('work');
      setTime(WORK_TIME);
      setIsBreak(false);
    }
  };

  const startTimer = () => {
    if (!selectedTask && sessionType === 'work') {
      toast.error('Please select a task first!');
      return;
    }
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    const timeMap = {
      'work': WORK_TIME,
      'break': SHORT_BREAK,
      'long-break': LONG_BREAK
    };
    setTime(timeMap[sessionType]);
  };

  const skipSession = () => {
    setTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const timeMap = {
      'work': WORK_TIME,
      'break': SHORT_BREAK,
      'long-break': LONG_BREAK
    };
    const totalTime = timeMap[sessionType];
    return ((totalTime - time) / totalTime) * 100;
  };

  const getSessionColor = () => {
    switch (sessionType) {
      case 'work': return '#ef4444';
      case 'break': return '#10b981';
      case 'long-break': return '#8b5cf6';
      default: return '#6366f1';
    }
  };

  return (
    <div className="pomodoro-container">
      <div className="pomodoro-header">
        <h1>🍅 Pomodoro Timer</h1>
        <p>Stay focused and boost your productivity</p>
      </div>

      <div className="pomodoro-main">
        <div className="timer-section">
          <div className="session-indicator">
            <span className={`indicator ${sessionType}`}>
              {sessionType === 'work' ? '💼 Work Time' : 
               sessionType === 'break' ? '☕ Short Break' : 
               '🛋️ Long Break'}
            </span>
          </div>

          <div className="timer-display">
            <div className="progress-circle">
              <svg className="progress-ring" width="200" height="200">
                <circle
                  className="progress-ring-background"
                  cx="100"
                  cy="100"
                  r="90"
                />
                <circle
                  className="progress-ring-progress"
                  cx="100"
                  cy="100"
                  r="90"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 90}`,
                    strokeDashoffset: `${2 * Math.PI * 90 * (1 - getProgressPercentage() / 100)}`,
                    stroke: getSessionColor()
                  }}
                />
              </svg>
              <div className="timer-content">
                <div className="time-display">{formatTime(time)}</div>
                <div className="timer-label">
                  {sessionType === 'work' ? 'Focus Time' : 'Break Time'}
                </div>
              </div>
            </div>
          </div>

          <div className="timer-controls">
            <button 
              onClick={isActive ? pauseTimer : startTimer}
              className={`control-btn primary ${isActive ? 'pause' : 'start'}`}
            >
              {isActive ? '⏸️ Pause' : '▶️ Start'}
            </button>
            <button onClick={resetTimer} className="control-btn">
              🔄 Reset
            </button>
            <button onClick={skipSession} className="control-btn">
              ⏭️ Skip
            </button>
          </div>
        </div>

        <div className="session-info">
          <div className="stats">
            <div className="stat-item">
              <span className="stat-number">{sessions}</span>
              <span className="stat-label">Sessions Today</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{Math.floor(sessions * 25 / 60)}h {(sessions * 25) % 60}m</span>
              <span className="stat-label">Focus Time</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{Math.ceil(sessions / 4)}</span>
              <span className="stat-label">Cycles</span>
            </div>
          </div>

          {sessionType === 'work' && (
            <div className="task-selection">
              <h3>Current Task</h3>
              {selectedTask ? (
                <div className="selected-task">
                  <div className="task-info">
                    <h4>{selectedTask.title}</h4>
                    <p>{selectedTask.category} • {selectedTask.priority} priority</p>
                    <div className="task-progress">
                      <span>🍅 {selectedTask.pomodoroSessions?.length || 0} sessions</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedTask(null)}
                    className="change-task-btn"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="task-list">
                  <p>Select a task to focus on:</p>
                  <div className="tasks-grid">
                    {tasks.slice(0, 6).map(task => (
                      <div 
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="task-card"
                      >
                        <h4>{task.title}</h4>
                        <div className="task-meta">
                          <span className={`priority ${task.priority}`}>
                            {task.priority}
                          </span>
                          <span className="category">{task.category}</span>
                        </div>
                        <div className="task-sessions">
                          🍅 {task.pomodoroSessions?.length || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                  {tasks.length === 0 && (
                    <div className="no-tasks">
                      <p>No tasks available.</p>
                      <button 
                        onClick={() => navigate('/todos')}
                        className="add-task-btn"
                      >
                        Add Tasks
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="pomodoro-technique-info">
        <h3>🧠 How it works</h3>
        <div className="technique-steps">
          <div className="step">
            <span className="step-number">1</span>
            <p>Choose a task to focus on</p>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <p>Work for 25 minutes</p>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <p>Take a 5-minute break</p>
          </div>
          <div className="step">
            <span className="step-number">4</span>
            <p>After 4 sessions, take a longer break</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;
