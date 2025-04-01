// Приложение браузера "Sphere" для Android 11 Web
import { SettingsManager } from '../settings-manager.js';
import { DOMUtils } from '../utils.js';
import { AnimationHelper } from '../animations.js';

export class SphereBrowser {
  constructor() {
    this.container = null;
    this.currentTab = null;
    this.tabs = [];
    this.bookmarks = [];
    this.history = [];
    this.activeUrl = '';
    this.isLoading = false;
    this.isIncognito = false;
  }

  // Инициализация приложения
  init(container) {
    this.container = container;
    this.container.classList.add('sphere-browser');
    
    // Загружаем сохраненные данные
    this.loadSavedData();
    
    // Если нет открытых вкладок, создаем новую
    if (this.tabs.length === 0) {
      this.createNewTab();
    } else {
      // Активируем последнюю активную вкладку
      this.currentTab = this.tabs[0];
    }
    
    // Отображаем браузер
    this.render();
    
    // Добавляем обработчики событий
    this.attachEventListeners();
    
    // Показываем уведомление
    setTimeout(() => {
      AnimationHelper.showToast('Sphere Browser запущен');
    }, 500);
  }
  
  // Загрузка сохраненных данных
  loadSavedData() {
    const savedData = SettingsManager.getSetting('sphereBrowser');
    if (savedData) {
      if (savedData.bookmarks) this.bookmarks = savedData.bookmarks;
      if (savedData.history) this.history = savedData.history;
    }
  }
  
  // Сохранение данных
  saveData() {
    SettingsManager.setSetting('sphereBrowser', {
      bookmarks: this.bookmarks,
      history: this.history
    });
  }
  
  // Создание новой вкладки
  createNewTab(url = 'about:blank') {
    const tab = {
      id: 'tab_' + Date.now(),
      title: 'Новая вкладка',
      url: url,
      favicon: 'public'
    };
    
    this.tabs.push(tab);
    this.currentTab = tab;
    
    return tab;
  }
  
  // Закрытие вкладки
  closeTab(tabId) {
    const tabIndex = this.tabs.findIndex(tab => tab.id === tabId);
    if (tabIndex === -1) return;
    
    // Удаляем вкладку
    this.tabs.splice(tabIndex, 1);
    
    // Если закрыли все вкладки, создаем новую
    if (this.tabs.length === 0) {
      this.createNewTab();
    } 
    // Если закрыли активную вкладку, активируем другую
    else if (this.currentTab.id === tabId) {
      // Активируем следующую или предыдущую вкладку
      const newIndex = tabIndex < this.tabs.length ? tabIndex : tabIndex - 1;
      this.currentTab = this.tabs[newIndex];
    }
    
    // Перерисовываем интерфейс
    this.render();
  }
  
  // Переключение на вкладку
  switchToTab(tabId) {
    const tab = this.tabs.find(tab => tab.id === tabId);
    if (tab) {
      this.currentTab = tab;
      this.render();
    }
  }
  
  // Обновление текущей вкладки
  updateCurrentTab(url, title = '', favicon = '') {
    if (!this.currentTab) return;
    
    if (url) this.currentTab.url = url;
    if (title) this.currentTab.title = title;
    if (favicon) this.currentTab.favicon = favicon;
    
    // Добавляем в историю
    if (url && url !== 'about:blank') {
      this.addToHistory(url, title);
    }
    
    // Обновляем UI
    this.updateTabUI();
  }
  
  // Добавление URL в историю
  addToHistory(url, title) {
    // Не добавляем в историю, если в режиме инкогнито
    if (this.isIncognito) return;
    
    const now = new Date();
    this.history.unshift({
      url,
      title: title || url,
      date: now.toISOString(),
      time: now.toLocaleTimeString()
    });
    
    // Ограничиваем размер истории
    if (this.history.length > 100) {
      this.history = this.history.slice(0, 100);
    }
    
    // Сохраняем историю
    this.saveData();
  }
  
  // Добавление закладки
  addBookmark(url, title) {
    // Проверяем, есть ли уже такая закладка
    const exists = this.bookmarks.some(bookmark => bookmark.url === url);
    if (exists) return;
    
    this.bookmarks.push({
      url,
      title: title || url
    });
    
    // Сохраняем закладки
    this.saveData();
    AnimationHelper.showToast('Закладка добавлена');
  }
  
  // Удаление закладки
  removeBookmark(url) {
    const index = this.bookmarks.findIndex(bookmark => bookmark.url === url);
    if (index === -1) return;
    
    this.bookmarks.splice(index, 1);
    this.saveData();
    AnimationHelper.showToast('Закладка удалена');
  }
  
  // Проверка, является ли URL закладкой
  isBookmarked(url) {
    return this.bookmarks.some(bookmark => bookmark.url === url);
  }
  
  // Загрузка URL
  loadUrl(url) {
    // Проверяем и форматируем URL
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('about:')) {
      // Проверяем, похож ли ввод на URL или поисковый запрос
      if (url.includes('.') && !url.includes(' ')) {
        url = 'https://' + url;
      } else {
        // Это поисковый запрос
        url = 'https://www.google.com/search?q=' + encodeURIComponent(url);
      }
    }
    
    this.isLoading = true;
    this.activeUrl = url;
    
    // Обновляем UI
    this.updateCurrentTab(url);
    this.updateBrowserUI();
    
    // Симулируем загрузку страницы
    setTimeout(() => {
      this.isLoading = false;
      this.updateBrowserUI();
      
      // Для демонстрации обновляем заголовок вкладки
      if (url === 'about:blank') {
        this.updateCurrentTab(url, 'Новая вкладка');
      } else {
        const domain = new URL(url).hostname;
        this.updateCurrentTab(url, `${domain} - Sphere Browser`);
      }
    }, 1500);
  }
  
  // Обновление интерфейса вкладок
  updateTabUI() {
    const tabsContainer = this.container.querySelector('.sphere-tabs');
    if (!tabsContainer) return;
    
    tabsContainer.innerHTML = '';
    
    // Добавляем вкладки
    this.tabs.forEach(tab => {
      const tabElement = document.createElement('div');
      tabElement.className = `sphere-tab ${tab.id === this.currentTab.id ? 'active' : ''}`;
      tabElement.dataset.tabId = tab.id;
      
      tabElement.innerHTML = `
        <span class="material-icons-round tab-favicon">${tab.favicon || 'public'}</span>
        <span class="tab-title">${tab.title}</span>
        <span class="material-icons-round tab-close">close</span>
      `;
      
      tabsContainer.appendChild(tabElement);
    });
    
    // Добавляем кнопку новой вкладки
    const newTabButton = document.createElement('div');
    newTabButton.className = 'sphere-new-tab';
    newTabButton.innerHTML = `<span class="material-icons-round">add</span>`;
    tabsContainer.appendChild(newTabButton);
  }
  
  // Обновление основного интерфейса браузера
  updateBrowserUI() {
    const addressBar = this.container.querySelector('.sphere-address-input');
    const refreshButton = this.container.querySelector('.sphere-refresh');
    const backButton = this.container.querySelector('.sphere-back');
    const forwardButton = this.container.querySelector('.sphere-forward');
    const bookmarkButton = this.container.querySelector('.sphere-bookmark');
    
    if (addressBar) {
      addressBar.value = this.activeUrl;
    }
    
    if (refreshButton) {
      if (this.isLoading) {
        refreshButton.innerHTML = '<span class="material-icons-round">close</span>';
      } else {
        refreshButton.innerHTML = '<span class="material-icons-round">refresh</span>';
      }
    }
    
    if (bookmarkButton && this.activeUrl) {
      if (this.isBookmarked(this.activeUrl)) {
        bookmarkButton.innerHTML = '<span class="material-icons-round">star</span>';
      } else {
        bookmarkButton.innerHTML = '<span class="material-icons-round">star_border</span>';
      }
    }
    
    // Обновляем содержимое страницы
    this.updatePageContent();
  }
  
  // Обновление содержимого страницы
  updatePageContent() {
    const contentArea = this.container.querySelector('.sphere-content');
    if (!contentArea) return;
    
    if (this.activeUrl === 'about:blank') {
      contentArea.innerHTML = this.getNewTabContent();
    } else if (this.activeUrl === 'about:bookmarks') {
      contentArea.innerHTML = this.getBookmarksContent();
    } else if (this.activeUrl === 'about:history') {
      contentArea.innerHTML = this.getHistoryContent();
    } else {
      contentArea.innerHTML = `
        <div class="sphere-web-content">
          <div class="sphere-web-page">
            <h2>${this.currentTab.title || 'Загрузка...'}</h2>
            <p>URL: ${this.activeUrl}</p>
            <div class="sphere-demo-content">
              <p>Это демонстрационная версия браузера Sphere. Реальная загрузка веб-страниц не реализована.</p>
              <p>В полной версии здесь отображалось бы содержимое веб-страницы.</p>
            </div>
          </div>
        </div>
      `;
    }
  }
  
  // Содержимое новой вкладки
  getNewTabContent() {
    // Формируем закладки для отображения на новой вкладке
    const topSites = this.bookmarks.slice(0, 8).map(bookmark => {
      const domain = this.getBaseDomain(bookmark.url);
      return `
        <div class="sphere-top-site" data-url="${bookmark.url}">
          <div class="site-icon">
            <span class="material-icons-round">public</span>
          </div>
          <div class="site-title">${domain}</div>
        </div>
      `;
    }).join('');
    
    return `
      <div class="sphere-new-tab-page">
        <div class="sphere-search-container">
          <span class="material-icons-round">search</span>
          <input type="text" class="sphere-search-input" placeholder="Поиск в Интернете...">
        </div>
        <div class="sphere-top-sites">
          ${topSites}
        </div>
      </div>
    `;
  }
  
  // Содержимое страницы с закладками
  getBookmarksContent() {
    let bookmarksHtml = '';
    
    if (this.bookmarks.length === 0) {
      bookmarksHtml = '<div class="sphere-empty-state">У вас пока нет закладок</div>';
    } else {
      bookmarksHtml = this.bookmarks.map(bookmark => {
        const domain = this.getBaseDomain(bookmark.url);
        return `
          <div class="sphere-bookmark-item" data-url="${bookmark.url}">
            <span class="material-icons-round">public</span>
            <div class="bookmark-details">
              <div class="bookmark-title">${bookmark.title}</div>
              <div class="bookmark-url">${domain}</div>
            </div>
            <span class="material-icons-round bookmark-delete" data-url="${bookmark.url}">delete</span>
          </div>
        `;
      }).join('');
    }
    
    return `
      <div class="sphere-bookmarks-page">
        <h2>Закладки</h2>
        <div class="sphere-bookmarks-list">
          ${bookmarksHtml}
        </div>
      </div>
    `;
  }
  
  // Содержимое страницы с историей
  getHistoryContent() {
    let historyHtml = '';
    
    if (this.history.length === 0) {
      historyHtml = '<div class="sphere-empty-state">История пуста</div>';
    } else {
      // Группируем историю по дате
      const groupedHistory = this.groupHistoryByDate();
      
      for (const [date, entries] of Object.entries(groupedHistory)) {
        historyHtml += `<div class="history-date">${date}</div>`;
        
        historyHtml += entries.map(entry => {
          const domain = this.getBaseDomain(entry.url);
          return `
            <div class="sphere-history-item" data-url="${entry.url}">
              <span class="material-icons-round">public</span>
              <div class="history-details">
                <div class="history-title">${entry.title}</div>
                <div class="history-url">${domain}</div>
              </div>
              <div class="history-time">${entry.time}</div>
            </div>
          `;
        }).join('');
      }
    }
    
    return `
      <div class="sphere-history-page">
        <h2>История</h2>
        <div class="sphere-history-actions">
          <button class="sphere-clear-history">Очистить историю</button>
        </div>
        <div class="sphere-history-list">
          ${historyHtml}
        </div>
      </div>
    `;
  }
  
  // Группировка истории по дате
  groupHistoryByDate() {
    const grouped = {};
    
    this.history.forEach(entry => {
      const date = new Date(entry.date);
      const today = new Date();
      
      let dateKey;
      
      if (date.toDateString() === today.toDateString()) {
        dateKey = 'Сегодня';
      } else if (date.toDateString() === new Date(today - 86400000).toDateString()) {
        dateKey = 'Вчера';
      } else {
        dateKey = date.toLocaleDateString('ru-RU', { 
          day: 'numeric', 
          month: 'long',
          year: 'numeric'
        });
      }
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push(entry);
    });
    
    return grouped;
  }
  
  // Получение домена из URL
  getBaseDomain(url) {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch (e) {
      return url;
    }
  }
  
  // Отображение всего браузера
  render() {
    this.container.innerHTML = `
      <div class="sphere-browser-container">
        <div class="sphere-browser-header">
          <div class="sphere-tabs-container">
            <div class="sphere-tabs"></div>
          </div>
          <div class="sphere-toolbar">
            <button class="sphere-back"><span class="material-icons-round">arrow_back</span></button>
            <button class="sphere-forward"><span class="material-icons-round">arrow_forward</span></button>
            <button class="sphere-refresh"><span class="material-icons-round">refresh</span></button>
            <div class="sphere-address-bar">
              <span class="material-icons-round">public</span>
              <input type="text" class="sphere-address-input" placeholder="Введите адрес сайта или поисковый запрос">
            </div>
            <button class="sphere-bookmark"><span class="material-icons-round">star_border</span></button>
            <button class="sphere-menu"><span class="material-icons-round">more_vert</span></button>
          </div>
        </div>
        <div class="sphere-content"></div>
      </div>
    `;
    
    // Обновляем UI вкладок и содержимое
    this.updateTabUI();
    this.updateBrowserUI();
  }
  
  // Обработчики событий
  attachEventListeners() {
    // Обработчик отправки адреса
    const addressBar = this.container.querySelector('.sphere-address-input');
    addressBar?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.loadUrl(addressBar.value);
      }
    });
    
    // Кнопка обновления/остановки
    const refreshButton = this.container.querySelector('.sphere-refresh');
    refreshButton?.addEventListener('click', () => {
      if (this.isLoading) {
        this.isLoading = false;
        this.updateBrowserUI();
      } else {
        this.loadUrl(this.activeUrl);
      }
    });
    
    // Кнопка добавления/удаления закладки
    const bookmarkButton = this.container.querySelector('.sphere-bookmark');
    bookmarkButton?.addEventListener('click', () => {
      if (this.activeUrl && this.activeUrl !== 'about:blank') {
        if (this.isBookmarked(this.activeUrl)) {
          this.removeBookmark(this.activeUrl);
        } else {
          this.addBookmark(this.activeUrl, this.currentTab.title);
        }
        this.updateBrowserUI();
      }
    });
    
    // Обработчики действий на страницах
    this.container.addEventListener('click', (e) => {
      // Обработка кликов по вкладкам
      if (e.target.closest('.sphere-tab')) {
        const tab = e.target.closest('.sphere-tab');
        const tabId = tab.dataset.tabId;
        
        // Если клик по кнопке закрытия вкладки
        if (e.target.closest('.tab-close')) {
          this.closeTab(tabId);
          return;
        }
        
        // Иначе переключаемся на вкладку
        this.switchToTab(tabId);
        return;
      }
      
      // Кнопка новой вкладки
      if (e.target.closest('.sphere-new-tab')) {
        const tab = this.createNewTab();
        this.updateTabUI();
        this.activeUrl = 'about:blank';
        this.updateBrowserUI();
        return;
      }
      
      // Клик по сайту на странице новой вкладки
      if (e.target.closest('.sphere-top-site')) {
        const url = e.target.closest('.sphere-top-site').dataset.url;
        this.loadUrl(url);
        return;
      }
      
      // Клик по закладке
      if (e.target.closest('.sphere-bookmark-item')) {
        // Если это не кнопка удаления
        if (!e.target.closest('.bookmark-delete')) {
          const url = e.target.closest('.sphere-bookmark-item').dataset.url;
          this.loadUrl(url);
        }
        return;
      }
      
      // Клик по кнопке удаления закладки
      if (e.target.closest('.bookmark-delete')) {
        const url = e.target.closest('.bookmark-delete').dataset.url;
        this.removeBookmark(url);
        this.updatePageContent();
        return;
      }
      
      // Клик по элементу истории
      if (e.target.closest('.sphere-history-item')) {
        const url = e.target.closest('.sphere-history-item').dataset.url;
        this.loadUrl(url);
        return;
      }
      
      // Клик по кнопке очистки истории
      if (e.target.closest('.sphere-clear-history')) {
        this.history = [];
        this.saveData();
        this.updatePageContent();
        AnimationHelper.showToast('История очищена');
        return;
      }
    });
    
    // Поиск на странице новой вкладки
    this.container.addEventListener('keydown', (e) => {
      if (e.target.classList.contains('sphere-search-input') && e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query) {
          this.loadUrl(query);
        }
      }
    });
  }
} 