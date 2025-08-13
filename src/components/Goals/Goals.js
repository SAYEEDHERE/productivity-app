import React, { useState, useEffect } from 'react';
import AuthService from '../../services/AuthService';
import GoalsService from '../../services/GoalsService';
import toast from 'react-hot-toast';
import './Goals.css';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filter, setFilter] = useState('all');
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'short-term',
    category: 'Personal',
    targetDate: new Date(),
    milestones: [],
    status: 'active'
  });

  const [newMilestone, setNewMilestone] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    const user = AuthService.getCurrentUser();
    if (user) {
      const userGoals = await GoalsService.getGoals(user.uid);
      setGoals(userGoals);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = AuthService.getCurrentUser();
    
    if (!user) return;

    try {
      let result;
      if (editingGoal) {
        result = await GoalsService.updateGoal(editingGoal.id, formData);
        if (result.success) {
          toast.success('Goal updated successfully!');
        }
      } else {
        result = await GoalsService.createGoal(user.uid, formData);
        if (result.success) {
          toast.success('Goal created successfully!');
        }
      }

      if (result.success) {
        await loadGoals();
        resetForm();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Something went wrong!');
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      type: goal.type,
      category: goal.category,
      targetDate: goal.targetDate || new Date(),
      milestones: goal.milestones || [],
      status: goal.status || 'active'
    });
    setShowForm(true);
  };

  const handleDelete = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      const result = await GoalsService.deleteGoal(goalId);
      if (result.success) {
        toast.success('Goal deleted');
        loadGoals();
      } else {
        toast.error('Failed to delete goal');
      }
    }
  };

  const handleStatusChange = async (goalId, newStatus) => {
    const result = await GoalsService.updateGoal(goalId, { status: newStatus });
    if (result.success) {
      if (newStatus === 'completed') {
        toast.success('🎉 Congratulations on completing your goal!');
      } else {
        toast.success(`Goal marked as ${newStatus}`);
      }
      loadGoals();
    }
  };

  const addMilestone = () => {
    if (newMilestone.trim()) {
      setFormData(prev => ({
        ...prev,
        milestones: [...prev.milestones, { 
          id: Date.now(), 
          text: newMilestone.trim(), 
          completed: false 
        }]
      }));
      setNewMilestone('');
    }
  };

  const removeMilestone = (milestoneId) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter(m => m.id !== milestoneId)
    }));
  };

  const toggleMilestone = async (goalId, milestoneId) => {
    const goal = goals.find(g => g.id === goalId);
    const updatedMilestones = goal.milestones.map(m => 
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    
    const result = await GoalsService.updateGoal(goalId, { milestones: updatedMilestones });
    if (result.success) {
      loadGoals();
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'short-term',
      category: 'Personal',
      targetDate: new Date(),
      milestones: [],
      status: 'active'
    });
    setEditingGoal(null);
    setShowForm(false);
    setNewMilestone('');
  };

  const filteredGoals = goals.filter(goal => {
    if (filter === 'all') return true;
    if (filter === 'short-term' || filter === 'long-term') return goal.type === filter;
    if (filter === 'active' || filter === 'completed' || filter === 'paused') return goal.status === filter;
    return true;
  });

  const getGoalProgress = (goal) => {
    if (!goal.milestones || goal.milestones.length === 0) return 0;
    const completed = goal.milestones.filter(m => m.completed).length;
    return Math.round((completed / goal.milestones.length) * 100);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: '#10b981',
      completed: '#6366f1',
      paused: '#f59e0b',
      cancelled: '#ef4444'
    };
    return colors[status] || '#64748b';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your goals...</p>
      </div>
    );
  }

  return (
    <div className="goals-container">
      <div className="goals-header">
        <div className="header-left">
          <h1>🎯 Goals Management</h1>
          <p>Set and track your short-term and long-term goals</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="add-goal-btn"
        >
          ➕ Add Goal
        </button>
      </div>

      {/* Filters */}
      <div className="goals-filters">
        <div className="filter-buttons">
          {['all', 'short-term', 'long-term', 'active', 'completed', 'paused'].map(filterOption => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`filter-btn ${filter === filterOption ? 'active' : ''}`}
            >
              {filterOption.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Goals Stats */}
      <div className="goals-stats">
        <div className="stat-card">
          <span className="stat-number">{goals.filter(g => g.type === 'short-term').length}</span>
          <span className="stat-label">Short-term Goals</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{goals.filter(g => g.type === 'long-term').length}</span>
          <span className="stat-label">Long-term Goals</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{goals.filter(g => g.status === 'completed').length}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{goals.filter(g => g.status === 'active').length}</span>
          <span className="stat-label">Active</span>
        </div>
      </div>

      {/* Goal Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingGoal ? 'Edit Goal' : 'Add New Goal'}</h2>
              <button onClick={resetForm} className="close-btn">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="goal-form">
              <div className="form-group">
                <label>Goal Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="What do you want to achieve?"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your goal in detail..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="short-term">Short-term (weeks/months)</option>
                    <option value="long-term">Long-term (months/years)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Personal">Personal</option>
                    <option value="Career">Career</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Financial">Financial</option>
                    <option value="Relationship">Relationship</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Target Date</label>
                <input
                  type="date"
                  value={formData.targetDate instanceof Date ? 
                    formData.targetDate.toISOString().split('T')[0] : 
                    new Date(formData.targetDate).toISOString().split('T')[0]
                  }
                  onChange={(e) => setFormData({...formData, targetDate: new Date(e.target.value)})}
                />
              </div>

              <div className="form-group">
                <label>Milestones</label>
                <div className="milestone-input">
                  <input
                    type="text"
                    value={newMilestone}
                    onChange={(e) => setNewMilestone(e.target.value)}
                    placeholder="Add a milestone..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
                  />
                  <button type="button" onClick={addMilestone} className="add-milestone-btn">
                    Add
                  </button>
                </div>
                <div className="milestones-list">
                  {formData.milestones.map((milestone) => (
                    <div key={milestone.id} className="milestone-item">
                      <span>{milestone.text}</span>
                      <button
                        type="button"
                        onClick={() => removeMilestone(milestone.id)}
                        className="remove-milestone-btn"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="goals-list">
        {filteredGoals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>No goals found</h3>
            <p>Set your first goal and start your journey to success!</p>
            <button onClick={() => setShowForm(true)} className="empty-cta">
              🌟 Set Your First Goal
            </button>
          </div>
        ) : (
          <div className="goals-grid">
            {filteredGoals.map(goal => (
              <div key={goal.id} className={`goal-card ${goal.status}`}>
                <div className="goal-type" style={{ backgroundColor: goal.type === 'long-term' ? '#8b5cf6' : '#10b981' }}>
                  {goal.type}
                </div>
                
                <div className="goal-header">
                  <h3 className="goal-title">{goal.title}</h3>
                  <div className="goal-actions">
                    <button onClick={() => handleEdit(goal)} className="edit-btn">✏️</button>
                    <button onClick={() => handleDelete(goal.id)} className="delete-btn">🗑️</button>
                  </div>
                </div>

                <p className="goal-description">{goal.description}</p>

                <div className="goal-meta">
                  <span className="category">📂 {goal.category}</span>
                  <span className="target-date">
                    📅 {goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'No deadline'}
                  </span>
                </div>

                {goal.milestones && goal.milestones.length > 0 && (
                  <div className="milestones-section">
                    <div className="progress-header">
                      <span>Progress: {getGoalProgress(goal)}%</span>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${getGoalProgress(goal)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="milestones">
                      {goal.milestones.slice(0, 3).map((milestone) => (
                        <div key={milestone.id} className="milestone">
                          <input
                            type="checkbox"
                            checked={milestone.completed}
                            onChange={() => toggleMilestone(goal.id, milestone.id)}
                          />
                          <span className={milestone.completed ? 'completed' : ''}>{milestone.text}</span>
                        </div>
                      ))}
                      {goal.milestones.length > 3 && (
                        <div className="more-milestones">
                          +{goal.milestones.length - 3} more milestones
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="goal-status-section">
                  <select
                    value={goal.status}
                    onChange={(e) => handleStatusChange(goal.id, e.target.value)}
                    className="status-selector"
                    style={{ borderColor: getStatusColor(goal.status) }}
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;
