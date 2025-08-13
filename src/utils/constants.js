export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

export const TASK_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed'
};

export const TASK_CATEGORIES = {
  PERSONAL: 'Personal',
  WORK: 'Work',
  STUDY: 'Study',
  HEALTH: 'Health',
  SHOPPING: 'Shopping',
  OTHER: 'Other'
};

export const GOAL_TYPES = {
  SHORT_TERM: 'short-term',
  LONG_TERM: 'long-term'
};

export const GOAL_STATUSES = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  CANCELLED: 'cancelled'
};

export const POMODORO_SETTINGS = {
  WORK_TIME: 25 * 60, // 25 minutes in seconds
  SHORT_BREAK: 5 * 60, // 5 minutes in seconds
  LONG_BREAK: 15 * 60, // 15 minutes in seconds
  SESSIONS_BEFORE_LONG_BREAK: 4
};

export const MOOD_RANGES = {
  EXCELLENT: { min: 9, max: 10, emoji: '🤩', color: '#10b981' },
  GREAT: { min: 7, max: 8, emoji: '😄', color: '#059669' },
  GOOD: { min: 6, max: 6, emoji: '😊', color: '#f59e0b' },
  OKAY: { min: 4, max: 5, emoji: '😐', color: '#f97316' },
  BAD: { min: 1, max: 3, emoji: '😔', color: '#ef4444' }
};

export const APP_CONFIG = {
  NAME: 'Productivity App',
  VERSION: '2.0.0',
  AUTHOR: 'Sayeed',
  DESCRIPTION: 'Advanced productivity app with Pomodoro timer, mood tracking, and Google Calendar integration',
  REPOSITORY: 'https://github.com/SAYEEDHERE/productivity-app',
  HOMEPAGE: 'https://SAYEEDHERE.github.io/productivity-app'
};

export const STORAGE_KEYS = {
  NOTES: 'productivity-notes',
  PREFERENCES: 'productivity-preferences',
  THEME: 'productivity-theme'
};

export const DEFAULT_PREFERENCES = {
  pomodoroWorkTime: 25,
  pomodoroShortBreak: 5,
  pomodoroLongBreak: 15,
  dailyGoal: 8,
  notifications: true,
  soundEnabled: true,
  theme: 'light'
};

export const PRIORITY_COLORS = {
  [TASK_PRIORITIES.LOW]: '#10b981',
  [TASK_PRIORITIES.MEDIUM]: '#f59e0b',
  [TASK_PRIORITIES.HIGH]: '#f97316',
  [TASK_PRIORITIES.URGENT]: '#ef4444'
};

export const STATUS_COLORS = {
  [TASK_STATUSES.PENDING]: '#64748b',
  [TASK_STATUSES.IN_PROGRESS]: '#f59e0b',
  [TASK_STATUSES.COMPLETED]: '#10b981'
};

export const CHART_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#84cc16',
  '#f97316'
];
