class NotesService {
  constructor() {
    this.storageKey = 'productivity-notes';
  }

  getAllNotes() {
    try {
      const notes = localStorage.getItem(this.storageKey);
      return notes ? JSON.parse(notes) : [];
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  }

  saveNote(note) {
    try {
      const notes = this.getAllNotes();
      const noteWithId = {
        ...note,
        id: note.id || this.generateId(),
        updatedAt: new Date().toISOString()
      };
      
      const existingIndex = notes.findIndex(n => n.id === noteWithId.id);
      if (existingIndex >= 0) {
        notes[existingIndex] = noteWithId;
      } else {
        noteWithId.createdAt = new Date().toISOString();
        notes.unshift(noteWithId);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(notes));
      return { success: true, note: noteWithId };
    } catch (error) {
      console.error('Error saving note:', error);
      return { success: false, error: error.message };
    }
  }

  deleteNote(noteId) {
    try {
      const notes = this.getAllNotes();
      const filteredNotes = notes.filter(note => note.id !== noteId);
      localStorage.setItem(this.storageKey, JSON.stringify(filteredNotes));
      return { success: true };
    } catch (error) {
      console.error('Error deleting note:', error);
      return { success: false, error: error.message };
    }
  }

  searchNotes(searchTerm) {
    const notes = this.getAllNotes();
    if (!searchTerm) return notes;
    
    return notes.filter(note => 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  exportNotes() {
    const notes = this.getAllNotes();
    const dataStr = JSON.stringify(notes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `productivity-notes-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  getStorageInfo() {
    const notes = this.getAllNotes();
    const totalSize = JSON.stringify(notes).length;
    const maxSize = 5 * 1024 * 1024; // 5MB typical localStorage limit
    
    return {
      totalNotes: notes.length,
      totalSize: totalSize,
      maxSize: maxSize,
      usagePercent: Math.round((totalSize / maxSize) * 100)
    };
  }
}

export default new NotesService();
