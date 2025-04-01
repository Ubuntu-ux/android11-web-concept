// Notes App for Android 11 Web
import { AppStorage } from '../utils.js';

export default class Notes {
  constructor() {
    this.container = null;
    this.notes = [];
    this.currentNoteId = null;
    this.isEditMode = false;
  }

  // Initialize the notes app
  init(container) {
    this.container = container;
    this.loadNotes();
    this.render();
    this.attachEventListeners();
  }

  // Load notes from storage
  loadNotes() {
    const savedNotes = AppStorage.getAppData('notes');
    this.notes = savedNotes ? savedNotes : [];
  }

  // Save notes to storage
  saveNotes() {
    AppStorage.saveAppData('notes', this.notes);
  }

  // Render the notes UI
  render() {
    if (this.isEditMode) {
      this.renderNoteEdit();
    } else {
      this.renderNotesList();
    }
  }

  // Render the notes list
  renderNotesList() {
    let notesHtml = this.notes.length ? 
      this.notes.map(note => `
        <div class="note-item" data-id="${note.id}">
          <div class="note-title">${this.escapeHtml(note.title)}</div>
          <div class="note-preview">${this.escapeHtml(note.content.substring(0, 60))}${note.content.length > 60 ? '...' : ''}</div>
          <div class="note-date">${new Date(note.updatedAt).toLocaleDateString()}</div>
        </div>
      `).join('') : 
      '<div class="empty-notes">Нет заметок. Нажмите + чтобы создать новую.</div>';

    this.container.innerHTML = `
      <div class="notes-app">
        <div class="notes-header">
          <span class="material-icons-round app-back">arrow_back</span>
          <span class="app-title">Заметки</span>
          <span class="material-icons-round new-note">add</span>
        </div>
        
        <div class="notes-list">
          ${notesHtml}
        </div>
      </div>
    `;
  }

  // Render the note edit screen
  renderNoteEdit() {
    const note = this.currentNoteId ? 
      this.notes.find(n => n.id === this.currentNoteId) : 
      { title: '', content: '' };

    this.container.innerHTML = `
      <div class="notes-app edit-mode">
        <div class="notes-header">
          <span class="material-icons-round back-to-notes">arrow_back</span>
          <span class="app-title">${this.currentNoteId ? 'Редактировать' : 'Новая заметка'}</span>
          <span class="material-icons-round save-note">save</span>
        </div>
        
        <div class="note-editor">
          <input type="text" class="note-title-input" placeholder="Заголовок" value="${this.escapeHtml(note.title)}">
          <textarea class="note-content-input" placeholder="Напишите что-нибудь...">${this.escapeHtml(note.content)}</textarea>
        </div>
        
        ${this.currentNoteId ? `
        <div class="note-actions">
          <button class="delete-note">Удалить</button>
        </div>
        ` : ''}
      </div>
    `;
  }

  // Attach event listeners
  attachEventListeners() {
    if (this.isEditMode) {
      this.attachEditModeListeners();
    } else {
      this.attachListModeListeners();
    }
  }

  // Attach list mode event listeners
  attachListModeListeners() {
    // Back button
    this.container.querySelector('.app-back').addEventListener('click', () => {
      document.querySelector('.app-screen').classList.remove('visible');
    });

    // New note button
    this.container.querySelector('.new-note').addEventListener('click', () => {
      this.currentNoteId = null;
      this.isEditMode = true;
      this.render();
      this.attachEventListeners();
    });

    // Note items
    this.container.querySelectorAll('.note-item').forEach(noteElement => {
      noteElement.addEventListener('click', () => {
        this.currentNoteId = noteElement.getAttribute('data-id');
        this.isEditMode = true;
        this.render();
        this.attachEventListeners();
      });
    });
  }

  // Attach edit mode event listeners
  attachEditModeListeners() {
    // Back button
    this.container.querySelector('.back-to-notes').addEventListener('click', () => {
      this.isEditMode = false;
      this.render();
      this.attachEventListeners();
    });

    // Save button
    this.container.querySelector('.save-note').addEventListener('click', () => {
      this.saveCurrentNote();
    });

    // Delete button (if editing existing note)
    const deleteButton = this.container.querySelector('.delete-note');
    if (deleteButton) {
      deleteButton.addEventListener('click', () => {
        this.deleteCurrentNote();
      });
    }
  }

  // Save current note
  saveCurrentNote() {
    const titleInput = this.container.querySelector('.note-title-input');
    const contentInput = this.container.querySelector('.note-content-input');
    
    const title = titleInput.value.trim() || 'Без заголовка';
    const content = contentInput.value.trim();
    
    if (content) {
      if (this.currentNoteId) {
        // Update existing note
        const noteIndex = this.notes.findIndex(n => n.id === this.currentNoteId);
        if (noteIndex !== -1) {
          this.notes[noteIndex].title = title;
          this.notes[noteIndex].content = content;
          this.notes[noteIndex].updatedAt = new Date().getTime();
        }
      } else {
        // Create new note
        this.notes.push({
          id: Date.now().toString(),
          title: title,
          content: content,
          createdAt: new Date().getTime(),
          updatedAt: new Date().getTime()
        });
      }
      
      this.saveNotes();
      this.isEditMode = false;
      this.render();
      this.attachEventListeners();
    }
  }

  // Delete current note
  deleteCurrentNote() {
    if (confirm('Вы уверены, что хотите удалить эту заметку?')) {
      this.notes = this.notes.filter(note => note.id !== this.currentNoteId);
      this.saveNotes();
      this.isEditMode = false;
      this.render();
      this.attachEventListeners();
    }
  }

  // Escape HTML to prevent XSS
  escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
} 