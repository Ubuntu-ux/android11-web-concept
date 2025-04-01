// Приложение заметок для Android 11 Web
import { SettingsManager } from '../settings-manager.js';
import { DOMUtils } from '../utils.js';
import { AnimationHelper } from '../animations.js';

export class NotesApp {
  constructor() {
    this.container = null;
    this.notes = [];
  }

  // Инициализация приложения
  init(container) {
    this.container = container;
    this.container.classList.add('notes-app');
    this.container.innerHTML = `
      <div class="notes-header">
        <h2>Заметки</h2>
        <div class="notes-actions">
          <button class="new-note-button">
            <span class="material-icons-round">add</span>
          </button>
        </div>
      </div>
      <div class="notes-container">
        <div class="notes-list"></div>
        <div class="no-notes-message">
          <span class="material-icons-round">note</span>
          <p>У вас пока нет заметок</p>
          <p>Нажмите + чтобы создать новую заметку</p>
        </div>
      </div>
    `;

    // В будущем здесь будет реализована функциональность заметок
    const newNoteButton = this.container.querySelector('.new-note-button');
    newNoteButton.addEventListener('click', () => {
      AnimationHelper.showToast('Создание заметок будет доступно в следующем обновлении!');
    });

    // Показываем сообщение о том, что заметки скоро будут доступны
    setTimeout(() => {
      AnimationHelper.showToast('Приложение Заметки в разработке');
    }, 500);
  }
} 