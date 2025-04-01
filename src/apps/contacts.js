// Приложение контактов для Android 11 Web
import { SettingsManager } from '../settings-manager.js';
import { DOMUtils } from '../utils.js';
import { AnimationHelper } from '../animations.js';

export class ContactsApp {
  constructor() {
    this.container = null;
    this.contacts = [
      { id: 1, name: 'Иван Петров', phone: '+7 (901) 555-1234', email: 'ivan@example.com', favorite: true },
      { id: 2, name: 'Анна Иванова', phone: '+7 (902) 555-5678', email: 'anna@example.com', favorite: true },
      { id: 3, name: 'Сергей Сидоров', phone: '+7 (903) 555-9012', email: 'sergey@example.com', favorite: false },
      { id: 4, name: 'Мария Смирнова', phone: '+7 (904) 555-3456', email: 'maria@example.com', favorite: false },
      { id: 5, name: 'Алексей Кузнецов', phone: '+7 (905) 555-7890', email: 'alex@example.com', favorite: false }
    ];
    this.filteredContacts = [...this.contacts];
    this.currentView = 'all'; // all, favorites
    this.searchQuery = '';
  }

  // Инициализация приложения
  init(container) {
    this.container = container;
    this.container.classList.add('contacts-app');
    this.render();
    
    // Показываем сообщение о том, что это приложение находится в разработке
    setTimeout(() => {
      AnimationHelper.showToast('Приложение Контакты в разработке');
    }, 500);
  }
  
  // Отображение интерфейса
  render() {
    this.container.innerHTML = `
      <div class="contacts-header">
        <h2>Контакты</h2>
        <div class="contacts-actions">
          <button class="contacts-search-button">
            <span class="material-icons-round">search</span>
          </button>
          <button class="contacts-add-button">
            <span class="material-icons-round">person_add</span>
          </button>
          <button class="contacts-more-button">
            <span class="material-icons-round">more_vert</span>
          </button>
        </div>
      </div>
      
      <div class="contacts-tabs">
        <div class="contacts-tab ${this.currentView === 'all' ? 'active' : ''}" data-view="all">
          <span>Все</span>
        </div>
        <div class="contacts-tab ${this.currentView === 'favorites' ? 'active' : ''}" data-view="favorites">
          <span>Избранные</span>
        </div>
      </div>
      
      <div class="contacts-search" style="display: none;">
        <div class="search-input-container">
          <span class="material-icons-round">search</span>
          <input type="text" class="search-input" placeholder="Поиск контактов" value="${this.searchQuery}">
          <span class="material-icons-round search-clear" style="${this.searchQuery ? '' : 'display: none;'}">clear</span>
        </div>
      </div>
      
      <div class="contacts-list">
        ${this.renderContactsList()}
      </div>
      
      <button class="contacts-fab">
        <span class="material-icons-round">add</span>
      </button>
    `;
    
    this.addEventListeners();
  }
  
  // Отрисовка списка контактов
  renderContactsList() {
    const contacts = this.filteredContacts.filter(contact => {
      if (this.currentView === 'favorites') {
        return contact.favorite;
      }
      return true;
    });
    
    if (contacts.length === 0) {
      return `
        <div class="contacts-empty">
          <span class="material-icons-round">person_off</span>
          <p>${this.currentView === 'favorites' ? 'У вас нет избранных контактов' : 'Контакты не найдены'}</p>
        </div>
      `;
    }
    
    return contacts.map(contact => `
      <div class="contact-item" data-id="${contact.id}">
        <div class="contact-avatar">
          <span>${this.getInitials(contact.name)}</span>
        </div>
        <div class="contact-info">
          <div class="contact-name">${contact.name}</div>
          <div class="contact-phone">${contact.phone}</div>
        </div>
        <div class="contact-favorite">
          <span class="material-icons-round">${contact.favorite ? 'star' : 'star_border'}</span>
        </div>
      </div>
    `).join('');
  }
  
  // Получение инициалов контакта
  getInitials(name) {
    return name.split(' ').map(part => part.charAt(0)).join('').toUpperCase();
  }
  
  // Поиск контактов
  searchContacts(query) {
    this.searchQuery = query;
    
    if (!query) {
      this.filteredContacts = [...this.contacts];
    } else {
      const lowerQuery = query.toLowerCase();
      this.filteredContacts = this.contacts.filter(contact => 
        contact.name.toLowerCase().includes(lowerQuery) || 
        contact.phone.toLowerCase().includes(lowerQuery) || 
        contact.email.toLowerCase().includes(lowerQuery)
      );
    }
    
    const contactsList = this.container.querySelector('.contacts-list');
    if (contactsList) {
      contactsList.innerHTML = this.renderContactsList();
    }
    
    // Добавляем обработчики для новых элементов списка
    this.addContactItemListeners();
  }
  
  // Переключение между представлениями
  switchView(view) {
    if (view !== this.currentView) {
      this.currentView = view;
      const contactsList = this.container.querySelector('.contacts-list');
      if (contactsList) {
        contactsList.innerHTML = this.renderContactsList();
      }
      
      // Обновляем активную вкладку
      const tabs = this.container.querySelectorAll('.contacts-tab');
      tabs.forEach(tab => {
        if (tab.dataset.view === view) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });
      
      // Добавляем обработчики для новых элементов списка
      this.addContactItemListeners();
    }
  }
  
  // Открытие и закрытие поиска
  toggleSearch() {
    const searchContainer = this.container.querySelector('.contacts-search');
    if (searchContainer) {
      if (searchContainer.style.display === 'none') {
        searchContainer.style.display = 'block';
        const searchInput = searchContainer.querySelector('.search-input');
        if (searchInput) {
          searchInput.focus();
        }
      } else {
        searchContainer.style.display = 'none';
        this.searchQuery = '';
        this.searchContacts('');
      }
    }
  }
  
  // Добавление обработчиков событий
  addEventListeners() {
    // Обработчики для кнопок в шапке
    const searchButton = this.container.querySelector('.contacts-search-button');
    if (searchButton) {
      searchButton.addEventListener('click', () => this.toggleSearch());
    }
    
    const addButton = this.container.querySelector('.contacts-add-button');
    if (addButton) {
      addButton.addEventListener('click', () => {
        AnimationHelper.showToast('Добавление контактов будет доступно в следующем обновлении!');
      });
    }
    
    const moreButton = this.container.querySelector('.contacts-more-button');
    if (moreButton) {
      moreButton.addEventListener('click', () => {
        AnimationHelper.showToast('Дополнительные опции будут доступны в следующем обновлении!');
      });
    }
    
    // Обработчики для вкладок
    const tabs = this.container.querySelectorAll('.contacts-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.switchView(tab.dataset.view);
      });
    });
    
    // Обработчик для поиска
    const searchInput = this.container.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this.searchContacts(searchInput.value);
        
        // Показываем или скрываем кнопку очистки
        const clearButton = this.container.querySelector('.search-clear');
        if (clearButton) {
          clearButton.style.display = searchInput.value ? 'block' : 'none';
        }
      });
    }
    
    // Обработчик для кнопки очистки поиска
    const clearButton = this.container.querySelector('.search-clear');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        const searchInput = this.container.querySelector('.search-input');
        if (searchInput) {
          searchInput.value = '';
          this.searchContacts('');
          clearButton.style.display = 'none';
          searchInput.focus();
        }
      });
    }
    
    // Обработчик для плавающей кнопки добавления
    const fab = this.container.querySelector('.contacts-fab');
    if (fab) {
      fab.addEventListener('click', () => {
        AnimationHelper.showToast('Добавление контактов будет доступно в следующем обновлении!');
      });
    }
    
    // Добавляем обработчики для элементов списка
    this.addContactItemListeners();
  }
  
  // Добавление обработчиков для элементов списка
  addContactItemListeners() {
    const contactItems = this.container.querySelectorAll('.contact-item');
    contactItems.forEach(item => {
      // Нажатие на контакт
      item.addEventListener('click', () => {
        const contactId = parseInt(item.dataset.id);
        const contact = this.contacts.find(c => c.id === contactId);
        if (contact) {
          this.showContactDetails(contact);
        }
      });
      
      // Нажатие на звездочку избранного
      const favoriteIcon = item.querySelector('.contact-favorite');
      if (favoriteIcon) {
        favoriteIcon.addEventListener('click', (event) => {
          event.stopPropagation(); // Предотвращаем открытие деталей контакта
          
          const contactId = parseInt(item.dataset.id);
          this.toggleFavorite(contactId);
          
          // Обновляем иконку
          const iconElement = favoriteIcon.querySelector('.material-icons-round');
          const contact = this.contacts.find(c => c.id === contactId);
          if (iconElement && contact) {
            iconElement.textContent = contact.favorite ? 'star' : 'star_border';
          }
        });
      }
    });
  }
  
  // Переключение состояния избранного контакта
  toggleFavorite(contactId) {
    const contactIndex = this.contacts.findIndex(c => c.id === contactId);
    if (contactIndex !== -1) {
      this.contacts[contactIndex].favorite = !this.contacts[contactIndex].favorite;
      
      // Если мы находимся в представлении избранных, обновляем список
      if (this.currentView === 'favorites') {
        const contactsList = this.container.querySelector('.contacts-list');
        if (contactsList) {
          contactsList.innerHTML = this.renderContactsList();
        }
        
        // Добавляем обработчики для новых элементов списка
        this.addContactItemListeners();
      }
    }
  }
  
  // Отображение деталей контакта
  showContactDetails(contact) {
    AnimationHelper.showToast(`Просмотр деталей контакта ${contact.name} будет доступен в следующем обновлении!`);
  }
} 