// App Manager for Android 11 Web
import { CalculatorApp } from './calculator.js';
import { NotesApp } from './notes.js';
import { WeatherApp } from './weather.js';
import { SettingsApp } from './settings.js';
import { ClockApp } from './clock.js';
import { ContactsApp } from './contacts.js';
import { SphereBrowser } from './sphere-browser.js';
import { SettingsManager } from '../settings-manager.js';
import { AnimationHelper } from '../animations.js';

export class AppManager {
  constructor() {
    this.apps = {};
    this.appScreen = null;
    this.currentApp = null;
    this.appHistory = []; // История запущенных приложений для Recent Apps
    this.maxHistoryLength = 10;
    
    this.init();
  }
  
  // Initialize the App Manager
  init() {
    // Создаем экран приложения, если он не существует
    if (!document.querySelector('.app-screen')) {
      this.createAppScreen();
    } else {
      this.appScreen = document.querySelector('.app-screen');
    }
    
    // Регистрируем стандартные приложения
    this.registerApp('calculator', new CalculatorApp());
    this.registerApp('notes', new NotesApp());
    this.registerApp('weather', new WeatherApp());
    this.registerApp('settings', new SettingsApp());
    this.registerApp('clock', new ClockApp());
    this.registerApp('contacts', new ContactsApp());
    this.registerApp('sphere', new SphereBrowser());
    
    // Добавляем обработчики событий для запуска приложений
    this.setupAppLaunchers();
  }
  
  // Create the app screen container
  createAppScreen() {
    this.appScreen = document.createElement('div');
    this.appScreen.className = 'app-screen';
    
    // Добавляем кнопку закрытия приложения
    const closeButton = document.createElement('button');
    closeButton.className = 'app-close-button';
    closeButton.innerHTML = '×';
    closeButton.addEventListener('click', () => this.closeCurrentApp());
    
    this.appScreen.appendChild(closeButton);
    
    document.querySelector('.android-phone').appendChild(this.appScreen);
  }
  
  // Setup app launcher event listeners
  setupAppLaunchers() {
    // Калькулятор
    document.querySelectorAll('.app-icon[data-app="calculator"]').forEach(element => {
      if (element) {
        element.addEventListener('click', () => this.launchApp('calculator'));
      }
    });
    
    // Заметки
    document.querySelectorAll('.app-icon[data-app="notes"]').forEach(element => {
      if (element) {
        element.addEventListener('click', () => this.launchApp('notes'));
      }
    });
    
    // Погода
    document.querySelectorAll('.app-icon[data-app="weather"]').forEach(element => {
      if (element) {
        element.addEventListener('click', () => this.launchApp('weather'));
      }
    });
    
    // Настройки
    document.querySelectorAll('.app-icon[data-app="settings"]').forEach(element => {
      if (element) {
        element.addEventListener('click', () => this.launchApp('settings'));
      }
    });
    
    // Часы
    document.querySelectorAll('.app-icon[data-app="clock"]').forEach(element => {
      if (element) {
        element.addEventListener('click', () => this.launchApp('clock'));
      }
    });
    
    // Контакты
    document.querySelectorAll('.app-icon[data-app="contacts"]').forEach(element => {
      if (element) {
        element.addEventListener('click', () => this.launchApp('contacts'));
      }
    });
    
    // Sphere Browser (вместо Chrome)
    document.querySelectorAll('.app-icon[data-app="chrome"]').forEach(element => {
      if (element) {
        element.addEventListener('click', () => this.launchApp('sphere'));
      }
    });
    
    // Для других приложений будем динамически добавлять обработчики при их регистрации
  }
  
  // Добавление обработчика события для запуска приложения
  addAppLauncher(appId) {
    document.querySelectorAll(`.app-icon[data-app="${appId}"]`).forEach(element => {
      if (element) {
        element.addEventListener('click', () => this.launchApp(appId));
      }
    });
  }
  
  // Launch an app
  launchApp(appId) {
    if (!this.apps[appId]) {
      // Если приложение не найдено, показываем заглушку "In Development"
      this.showDevelopmentApp(appId);
      return;
    }
    
    // Сохраняем текущее приложение в историю, если оно запущено
    if (this.currentApp && this.appHistory[0] !== this.currentApp) {
      this.addToAppHistory(this.currentApp);
    }
    
    // Очищаем экран приложения
    const appContainer = document.createElement('div');
    appContainer.className = 'app-container';
    this.appScreen.querySelector('.app-container')?.remove();
    this.appScreen.appendChild(appContainer);
    
    // Показываем экран приложения с анимацией
    this.appScreen.classList.add('visible');
    
    // Устанавливаем текущее приложение
    this.currentApp = appId;
    
    // Добавляем в историю
    this.addToAppHistory(appId);
    
    // Инициализируем приложение
    this.apps[appId].init(appContainer);
    
    // Скрываем панель уведомлений, если она открыта
    document.querySelector('.notification-panel')?.classList.remove('visible');
    
    // Показываем тост с названием приложения
    AnimationHelper.showToast(`Запущено: ${this.getAppName(appId)}`);
  }
  
  // Показать заглушку для приложения в разработке
  showDevelopmentApp(appId) {
    // Создаем контейнер для заглушки
    const devAppContainer = document.createElement('div');
    devAppContainer.className = 'dev-app-container';
    
    // Очищаем экран приложения
    this.appScreen.querySelector('.app-container')?.remove();
    this.appScreen.appendChild(devAppContainer);
    
    // Показываем экран приложения с анимацией
    this.appScreen.classList.add('visible');
    
    // Устанавливаем текущее приложение
    this.currentApp = 'development';
    
    // Заполняем контейнер содержимым
    devAppContainer.innerHTML = `
      <div class="dev-app-content">
        <div class="dev-app-icon">
          <i class="dev-app-icon-symbol">🛠️</i>
        </div>
        <h2 class="dev-app-title">В разработке</h2>
        <p class="dev-app-message">Приложение "${this.getAppName(appId) || appId}" находится в разработке.</p>
        <p class="dev-app-submessage">Мы работаем над тем, чтобы оно стало доступно в ближайшее время.</p>
        <button class="dev-app-close-button">Понятно</button>
      </div>
    `;
    
    // Добавляем обработчик для кнопки закрытия
    devAppContainer.querySelector('.dev-app-close-button').addEventListener('click', () => {
      this.closeCurrentApp();
    });
    
    // Скрываем панель уведомлений, если она открыта
    document.querySelector('.notification-panel')?.classList.remove('visible');
    
    // Показываем тост
    AnimationHelper.showToast(`Приложение ${this.getAppName(appId) || appId} в разработке`);
  }
  
  // Получить название приложения
  getAppName(appId) {
    const appNames = {
      'calculator': 'Калькулятор',
      'notes': 'Заметки',
      'weather': 'Погода',
      'clock': 'Часы',
      'contacts': 'Контакты',
      'sphere': 'Sphere Browser',
      'settings': 'Настройки',
      'phone': 'Телефон',
      'messages': 'Сообщения',
      'camera': 'Камера',
      'gallery': 'Галерея',
      'calendar': 'Календарь',
      'maps': 'Карты',
      'browser': 'Браузер',
      'music': 'Музыка',
      'development': 'В разработке'
    };
    
    return appNames[appId] || appId;
  }
  
  // Close current app
  closeCurrentApp() {
    if (this.appScreen) {
      this.appScreen.classList.remove('visible');
      this.currentApp = null;
    }
  }
  
  // Get currently running app
  getCurrentApp() {
    return this.currentApp ? this.apps[this.currentApp] : null;
  }
  
  // Get currently running app ID
  getCurrentAppId() {
    return this.currentApp;
  }
  
  // Check if an app is running
  isAppRunning() {
    return this.currentApp !== null;
  }
  
  // Add a new app to the manager
  registerApp(appId, appInstance) {
    this.apps[appId] = appInstance;
    
    // Добавляем обработчик запуска для нового приложения
    this.addAppLauncher(appId);
  }
  
  // Добавить приложение в историю
  addToAppHistory(appId) {
    // Удаляем приложение из истории, если оно уже там есть
    this.appHistory = this.appHistory.filter(id => id !== appId);
    
    // Добавляем в начало истории
    this.appHistory.unshift(appId);
    
    // Ограничиваем длину истории
    if (this.appHistory.length > this.maxHistoryLength) {
      this.appHistory.pop();
    }
  }
  
  // Получить историю запущенных приложений
  getAppHistory() {
    return this.appHistory;
  }
  
  // Очистить историю приложений
  clearAppHistory() {
    this.appHistory = [];
  }
  
  // Запустить приложение из истории
  launchAppFromHistory(appId) {
    this.launchApp(appId);
  }
} 