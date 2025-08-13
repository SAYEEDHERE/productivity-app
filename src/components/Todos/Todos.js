import React, { useState, useEffect } from 'react';
import TaskService from '../../services/TaskService';
import GoogleCalendarService from '../../services/GoogleCalendarService';
import AuthService from '../../services/AuthService';
import toast from 'react-hot-toast';
import './Todos.css';

const Todos = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Personal',
    priority: 'medium',
    subject: '',
    dueDate: new Date(),
    estimatedTime: 60,
    addToCalendar: false
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const user = AuthService.getCurrentUser();
    if (user) {
      const userTasks = await TaskService.getTasks(user.uid);
      setTasks(userTasks);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = AuthService.getCurrentUser();
    
    if (!user) return;

    try {
      let result;
      if (editingTask) {
        result = await TaskService.updateTask(editingTask.id, formData);
        if (result.success) {
          toast.success('Task updated successfully!');
        }
      } else {
        result = await TaskService.createTask(user.uid, formData);
        if (result.success) {
          toast.success('Task created successfully!');
          
          // Add to Google Calendar if requested
          if (formData.addToCalendar) {
            const calendarResult = await GoogleCalendarService.createEvent({
              ...formData,
              id: result.id
            });
            if (calendarResult.success) {
              toast.success('📅 Added to Google Calendar!');
            }
          }
        }
      }

      if (result.success) {
        await loadTasks();
        resetForm();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Something went wrong!');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      category: task.category,
      priority: task.priority,
      subject: task.subject || '',
      dueDate: task.dueDate || new Date(),
      estimatedTime: task.estimatedTime || 60,
      addToCalendar: false
    });
    setShowForm(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const result = await TaskService.deleteTask(taskId);
      if (result.success) {
        toast.success('Task deleted');
        loadTasks();
      } else {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const result = await TaskService.updateTask(taskId, { status: newStatus });
    if (result.success) {
      toast.success(`Task marked as ${newStatus}`);
      loadTasks();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Personal',
      priority: 'medium',
      subject: '',
      dueDate: new Date(),
      estimatedTime: 60,
      addToCalendar: false
    });
    setEditingTask(null);
    setShowForm(false);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.status === filter;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: '#ef4444',
      high: '#f97316',
      medium: '#f59e0b',
      low: '#10b981'
    };
    return colors[priority] || '#64748b';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your tasks...</p>
      </div>
    );
  }

  return (
    <div className="todos-container">
      <div className="todos-header">
        <div className="header-left">
          <h1>📋 Task Management</h1>
          <p>Organize your tasks with categories, priorities, and deadlines</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="add-task-btn"
        >
          ➕ Add Task
        </button>
      </div>

      {/* Filters and Search */}
      <div className="todos-filters">
        <div className="filter-buttons">
          {['all', 'pending', 'in-progress', 'completed'].map(filterOption => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`filter-btn ${filter === filterOption ? 'active' : ''}`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
              <button onClick={resetForm} className="close-btn">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="task-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Task Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    placeholder="What needs to be done?"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Add more details..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Personal">Personal</option>
                    <option value="Work">Work</option>
                    <option value="Study">Study</option>
                    <option value="Health">Health</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Subject (For Students)</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="Math, Science, etc."
                  />
                </div>

                <div className="form-group">
                  <label>Estimated Time (minutes)</label>
                  <input
                    type="number"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData({...formData, estimatedTime: parseInt(e.target.value)})}
                    min="15"
                    max="480"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="datetime-local"
                  value={formData.dueDate instanceof Date ? 
                    formData.dueDate.toISOString().slice(0, 16) : 
                    new Date(formData.dueDate).toISOString().slice(0, 16)
                  }
                  onChange={(e) => setFormData({...formData, dueDate: new Date(e.target.value)})}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.addToCalendar}
                    onChange={(e) => setFormData({...formData, addToCalendar: e.target.checked})}
                  />
                  📅 Add to Google Calendar
                </label>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="tasks-list">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No tasks found</h3>
            <p>
              {searchTerm ? 'Try a different search term' : 'Create your first task to get started!'}
            </p>
            {!searchTerm && (
              <button onClick={() => setShowForm(true)} className="empty-cta">
                ➕ Add Your First Task
              </button>
            )}
          </div>
        ) : (
          <div className="tasks-grid">
            {filteredTasks.map(task => (
              <div key={task.id} className={`task-card ${task.status}`}>
                <div className="task-priority" style={{ backgroundColor: getPriorityColor(task.priority) }}>
                  {task.priority}
                </div>
                
                <div className="task-header">
                  <h3 className="task-title">{task.title}</h3>
                  <div className="task-actions">
                    <button onClick={() => handleEdit(task)} className="edit-btn">✏️</button>
                    <button onClick={() => handleDelete(task.id)} className="delete-btn">🗑️</button>
                  </div>
                </div>

                <p className="task-description">{task.description}</p>

                <div className="task-meta">
                  <span className="category">📂 {task.category}</span>
                  {task.subject && <span className="subject">📚 {task.subject}</span>}
                  <span className="time">⏱️ {task.estimatedTime}min</span>
                </div>

                <div className="task-due">
                  📅 {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                </div>

                <div className="task-status-actions">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className="status-selector"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {task.pomodoroSessions && task.pomodoroSessions.length > 0 && (
                  <div className="pomodoro-info">
                    🍅 {task.pomodoroSessions.length} sessions completed
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Todos;
