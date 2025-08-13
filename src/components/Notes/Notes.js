import React, { useState, useEffect } from 'react';
import NotesService from '../../services/NotesService';
import toast from 'react-hot-toast';
import './Notes.css';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  
  // Editor states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = () => {
    const allNotes = NotesService.getAllNotes();
    setNotes(allNotes);
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const noteData = {
      title: title.trim(),
      content: content.trim(),
      ...(editingNote && { id: editingNote.id })
    };

    const result = NotesService.saveNote(noteData);
    
    if (result.success) {
      toast.success(editingNote ? 'Note updated!' : 'Note saved!');
      loadNotes();
      resetEditor();
    } else {
      toast.error(result.error);
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setShowEditor(true);
  };

  const handleDelete = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      const result = NotesService.deleteNote(noteId);
      if (result.success) {
        toast.success('Note deleted');
        loadNotes();
      }
    }
  };

  const resetEditor = () => {
    setTitle('');
    setContent('');
    setEditingNote(null);
    setShowEditor(false);
  };

  const exportNotes = () => {
    NotesService.exportNotes();
    toast.success('Notes exported successfully!');
  };

  const filteredNotes = NotesService.searchNotes(searchTerm);

  const storageInfo = NotesService.getStorageInfo();

  return (
    <div className="notes-container">
      <div className="notes-header">
        <div className="header-left">
          <h1>📝 Personal Notes</h1>
          <p>
            Your private notes stored locally on your device
            <button 
              onClick={() => setShowPrivacyInfo(true)}
              className="info-btn"
              title="Privacy Information"
            >
              ℹ️
            </button>
          </p>
        </div>
        <div className="header-actions">
          <button onClick={exportNotes} className="export-btn">
            📤 Export Notes
          </button>
          <button onClick={() => setShowEditor(true)} className="add-note-btn">
            ➕ New Note
          </button>
        </div>
      </div>

      {/* Storage Info */}
      <div className="storage-info">
        <div className="storage-stats">
          <span>📊 {storageInfo.totalNotes} notes</span>
          <span>💾 {Math.round(storageInfo.totalSize / 1024)}KB used</span>
          <span>📈 {storageInfo.usagePercent}% of local storage</span>
        </div>
      </div>

      {/* Search */}
      <div className="search-section">
        <input
          type="text"
          placeholder="🔍 Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Notes Editor Modal */}
      {showEditor && (
        <div className="modal-overlay">
          <div className="modal-content editor-modal">
            <div className="modal-header">
              <h2>{editingNote ? 'Edit Note' : 'New Note'}</h2>
              <button onClick={resetEditor} className="close-btn">✕</button>
            </div>
            
            <div className="editor-form">
              <input
                type="text"
                placeholder="Note title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="title-input"
                autoFocus
              />
              
              <textarea
                placeholder="Start writing your note here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="content-textarea"
                rows="15"
              />
              
              <div className="editor-actions">
                <button onClick={resetEditor} className="cancel-btn">
                  Cancel
                </button>
                <button onClick={handleSave} className="save-btn">
                  {editingNote ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Info Modal */}
      {showPrivacyInfo && (
        <div className="modal-overlay">
          <div className="modal-content privacy-modal">
            <div className="modal-header">
              <h2>🔒 Privacy Information</h2>
              <button onClick={() => setShowPrivacyInfo(false)} className="close-btn">✕</button>
            </div>
            
            <div className="privacy-content">
              <div className="privacy-section">
                <h3>📱 Local Storage</h3>
                <p>Your notes are stored locally on your device using browser's localStorage. This means:</p>
                <ul>
                  <li>✅ Complete privacy - no one else can access your notes</li>
                  <li>✅ Works offline - no internet connection required</li>
                  <li>✅ Fast access - instant loading and saving</li>
                  <li>⚠️ Device-specific - notes won't sync across devices</li>
                  <li>⚠️ Browser-dependent - clearing browser data removes notes</li>
                </ul>
              </div>
              
              <div className="privacy-section">
                <h3>🛡️ Security Features</h3>
                <ul>
                  <li>🔐 No data sent to external servers</li>
                  <li>🔐 No account required or personal info collected</li>
                  <li>🔐 Data stays on your device always</li>
                  <li>📤 Export feature for backup purposes</li>
                </ul>
              </div>
              
              <div className="privacy-section">
                <h3>💡 Best Practices</h3>
                <ul>
                  <li>📤 Export your notes regularly as backup</li>
                  <li>🔄 Don't rely solely on browser storage for critical notes</li>
                  <li>💾 Consider using multiple devices for important content</li>
                </ul>
              </div>
              
              <div className="privacy-footer">
                <p><strong>Made with ❤️ by Sayeed</strong> - Privacy-focused by design</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="notes-list">
        {filteredNotes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>
              {searchTerm ? 'No notes found' : 'No notes yet'}
            </h3>
            <p>
              {searchTerm ? 
                'Try a different search term' : 
                'Create your first private note to get started!'
              }
            </p>
            {!searchTerm && (
              <button onClick={() => setShowEditor(true)} className="empty-cta">
                ✨ Create Your First Note
              </button>
            )}
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.map(note => (
              <div key={note.id} className="note-card">
                <div className="note-header">
                  <h3 className="note-title">{note.title}</h3>
                  <div className="note-actions">
                    <button onClick={() => handleEdit(note)} className="edit-btn">✏️</button>
                    <button onClick={() => handleDelete(note.id)} className="delete-btn">🗑️</button>
                  </div>
                </div>
                
                <div className="note-content">
                  {note.content.length > 200 
                    ? note.content.substring(0, 200) + '...' 
                    : note.content || 'No content'}
                </div>
                
                <div className="note-meta">
                  <span className="note-date">
                    📅 {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
                  </span>
                  <span className="note-size">
                    📝 {note.content.length} chars
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
