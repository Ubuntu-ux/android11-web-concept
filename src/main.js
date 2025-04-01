// Android 11 Web Interface - Main JavaScript
import icons from './assets/icons.js';
import { AppManager } from './apps/app-manager.js';
import WidgetManager from './widgets.js';
import WallpaperManager from './wallpapers.js';
import { SettingsManager } from './settings-manager.js';
import { RippleEffect, AnimationHelper } from './animations.js';

// Глобальные переменные для доступа к менеджерам
let appManager;
let widgetManager;
let wallpaperManager;
let rippleEffect;
let animationHelper;

document.addEventListener("DOMContentLoaded", function() {
  // Сразу устанавливаем тёмную тему по умолчанию
  document.body.classList.add('dark-mode');
  
  // Get DOM elements
  const statusBar = document.querySelector(".status-bar");
  const notificationPanel = document.querySelector(".notification-panel");
  const homeScreen = document.querySelector(".home-screen");
  const recentsScreen = document.querySelector(".recents-screen");
  const timeElement = document.querySelector(".time");
  const quickToggles = document.querySelectorAll(".quick-toggle");
  const appIcons = document.querySelectorAll(".app-icon");
  const navigationButtons = document.querySelectorAll(".nav-button");

  // Инициализируем менеджеры
  initializeManagers();

  // Update time in status bar
  function updateTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    timeElement.textContent = `${hours}:${minutes}`;
  }

  // Update time immediately and then every minute
  updateTime();
  setInterval(updateTime, 60000);

  // Handle notification panel swipe down/up
  let touchStartY = 0;
  let touchEndY = 0;

  // Detect swipe down from status bar to show notification panel
  document.addEventListener("touchstart", function(event) {
    touchStartY = event.touches[0].clientY;
    // Показываем индикатор свайпа
    if (animationHelper) {
      animationHelper.showSwipeIndicator(event.touches[0].clientY);
    }
  }, false);

  document.addEventListener("touchmove", function(event) {
    if (Math.abs(event.touches[0].clientY - touchStartY) > 20 && animationHelper) {
      // Обновляем позицию индикатора свайпа
      animationHelper.updateSwipeIndicator(event.touches[0].clientY);
    }
  }, false);

  document.addEventListener("touchend", function(event) {
    touchEndY = event.changedTouches[0].clientY;
    // Скрываем индикатор свайпа
    if (animationHelper) {
      animationHelper.hideSwipeIndicator();
    }
    handleSwipeGesture();
  }, false);

  // Handle swipe gesture to show/hide notification panel
  function handleSwipeGesture() {
    const swipeDistance = touchEndY - touchStartY;

    // Если свайп вниз в верхней части экрана
    if (swipeDistance > 70 && touchStartY < 100) {
      showNotificationPanel();
      return;
    }

    // Если свайп вверх, когда панель уведомлений открыта
    if (swipeDistance < -50 && notificationPanel.classList.contains("visible")) {
      hideNotificationPanel();
      return;
    }
  }

  // Show notification panel with animation
  function showNotificationPanel() {
    notificationPanel.classList.add("visible");
    // Если есть панель недавних приложений, скрываем её
    hideRecentsScreen();
    // Скрываем все открытые приложения
    if (appManager && appManager.isAppRunning()) {
      appManager.closeCurrentApp();
    }
  }

  // Hide notification panel with animation
  function hideNotificationPanel() {
    notificationPanel.classList.remove("visible");
  }

  // Show recents screen
  function showRecentsScreen() {
    recentsScreen.classList.add("visible");
    // Обновляем список недавних приложений
    updateRecentsList();
    // Скрываем панель уведомлений, если она открыта
        hideNotificationPanel();
    // Скрываем все открытые приложения
    if (appManager && appManager.isAppRunning()) {
      appManager.closeCurrentApp();
    }
  }

  // Hide recents screen
  function hideRecentsScreen() {
    if (recentsScreen) {
      recentsScreen.classList.remove("visible");
    }
  }

  // Toggle recents screen visibility
  function toggleRecentsScreen() {
    if (recentsScreen.classList.contains("visible")) {
      hideRecentsScreen();
      } else {
      showRecentsScreen();
    }
  }

  // Update recents list
  function updateRecentsList() {
    const recentsList = document.querySelector(".recents-list");
    const recentsEmpty = document.querySelector(".recents-empty");
    
    if (!recentsList || !recentsEmpty || !appManager) return;
    
    // Очищаем список
    recentsList.innerHTML = "";
    
    // Получаем историю приложений из менеджера приложений
    const appHistory = appManager.getAppHistory();
    
    if (appHistory.length === 0) {
      // Показываем сообщение о том, что нет недавних приложений
      recentsEmpty.style.display = "flex";
      return;
    }
    
    // Скрываем сообщение о том, что нет недавних приложений
    recentsEmpty.style.display = "none";
    
    // Шаблон для карточки недавнего приложения
    const template = document.getElementById("recent-app-template");
    if (!template) return;
    
    // Добавляем каждое приложение в список
    appHistory.forEach(appId => {
      const appCard = template.content.cloneNode(true);
      const appTitle = appCard.querySelector(".recent-app-title");
      const appIcon = appCard.querySelector(".recent-app-icon .material-icons-round");
      const appCloseButton = appCard.querySelector(".recent-app-close");
      const appCardElement = appCard.querySelector(".recent-app-card");
      
      // Устанавливаем название и иконку приложения
      appTitle.textContent = appManager.getAppName(appId);
      appIcon.textContent = getAppIconByName(appId);
      
      // Добавляем обработчик для запуска приложения при клике на карточку
      appCardElement.addEventListener("click", () => {
        appManager.launchAppFromHistory(appId);
        hideRecentsScreen();
      });
      
      // Добавляем обработчик для удаления приложения из истории
      appCloseButton.addEventListener("click", (e) => {
        e.stopPropagation(); // Предотвращаем всплытие события до карточки
        
        // Добавляем анимацию удаления
        appCardElement.classList.add("removing");
        
        // Удаляем приложение из истории через 300мс (длительность анимации)
        setTimeout(() => {
          // Удаляем из DOM
          appCardElement.remove();
          
          // Фильтруем историю приложений
          appManager.appHistory = appManager.appHistory.filter(id => id !== appId);
          
          // Обновляем отображение, если история пуста
          if (appManager.appHistory.length === 0) {
            recentsEmpty.style.display = "flex";
          }
          
          // Показываем уведомление
          AnimationHelper.showToast(`${appManager.getAppName(appId)} удалено из недавних`);
        }, 300);
      });
      
      // Добавляем карточку в список
      recentsList.appendChild(appCard);
    });
    
    // Обработчик для кнопки "Очистить всё"
    const clearAllButton = document.querySelector(".recents-clear-all-button");
    if (clearAllButton) {
      clearAllButton.addEventListener("click", () => {
        // Анимация удаления всех карточек
        const appCards = recentsList.querySelectorAll(".recent-app-card");
        appCards.forEach((card, index) => {
          // Добавляем задержку для каскадной анимации
          setTimeout(() => {
            card.classList.add("removing");
          }, index * 50);
        });
        
        // После анимации очищаем историю
        setTimeout(() => {
          appManager.clearAppHistory();
          recentsList.innerHTML = "";
          recentsEmpty.style.display = "flex";
          AnimationHelper.showToast("История приложений очищена");
        }, appCards.length * 50 + 300);
      });
    }
  }

  // Handle quick toggle clicks
  quickToggles.forEach(toggle => {
    toggle.addEventListener("click", function() {
      const toggleId = this.getAttribute('data-toggle');
      this.classList.toggle("active");

      // Сохраняем состояние переключателя в настройках
      if (toggleId) {
        SettingsManager.setSetting(`toggleStates.${toggleId}`, this.classList.contains("active"));
      }

      // Если это переключатель тёмного режима, переключаем темную тему
      if (toggleId === 'dark') {
        document.body.classList.toggle("dark-mode");
        // Сохраняем настройку темной темы
        SettingsManager.setSetting('darkMode', document.body.classList.contains("dark-mode"));
        
        // Обновляем обои при изменении темы
        if (wallpaperManager) {
          wallpaperManager.updateForDarkMode(document.body.classList.contains("dark-mode"));
        }
      }
      
      // Показываем Toast-уведомление о переключении
      const toggleName = this.querySelector(".label").textContent;
      const isActive = this.classList.contains("active");
      const statusText = isActive ? "Включено" : "Выключено";
      AnimationHelper.showToast(`${toggleName}: ${statusText}`);
    });
  });

  // Handle app icon clicks with improved feedback
  appIcons.forEach(icon => {
    icon.addEventListener("click", function() {
      // Получаем идентификатор приложения
      const appId = this.getAttribute('data-app');
      if (!appId) return;
      
      // Добавляем визуальный эффект нажатия
      this.classList.add('app-pressed');
      setTimeout(() => this.classList.remove('app-pressed'), 300);
      
      // Скрываем все экраны и пытаемся запустить приложение
      if (appId === 'app-drawer') {
        // Действие для кнопки списка приложений
        AnimationHelper.showToast("Список приложений");
        return;
      }

      // Запускаем приложение через менеджер приложений
      if (appManager) {
        appManager.launchApp(appId);
        
        // Скрываем панель уведомлений и недавние приложения
        hideNotificationPanel();
        hideRecentsScreen();
      }
    });
  });

  // Улучшенные обработчики навигационной панели
  function setupNavigationHandlers() {
    // Получаем кнопки
    const backButton = document.getElementById('back');
    const homeButton = document.getElementById('home');
    const recentsButton = document.getElementById('recents');
    
    if (!backButton || !homeButton || !recentsButton) return;
    
    // Обработчик для кнопки "Назад"
    backButton.addEventListener('click', function() {
      // Добавляем эффект нажатия
      this.classList.add('nav-pressed');
      setTimeout(() => this.classList.remove('nav-pressed'), 300);
      
      // Проверяем, какие экраны открыты и закрываем их в правильном порядке
      const notificationPanel = document.querySelector('.notification-panel');
      
      if (notificationPanel && notificationPanel.classList.contains('visible')) {
        hideNotificationPanel();
        return;
      }
      
      if (recentsScreen && recentsScreen.classList.contains('visible')) {
        hideRecentsScreen();
        return;
      }
      
      // Если запущено приложение, закрываем его
      if (appManager && appManager.isAppRunning()) {
        appManager.closeCurrentApp();
        AnimationHelper.showToast("Приложение закрыто");
        return;
      }
      
      // Если ничего не открыто, показываем уведомление
      AnimationHelper.showToast("Назад");
    });
    
    // Обработчик для кнопки "Домой"
    homeButton.addEventListener('click', function() {
      // Добавляем эффект нажатия
      this.classList.add('nav-pressed');
      setTimeout(() => this.classList.remove('nav-pressed'), 300);
      
      // Закрываем все открытые экраны
      hideNotificationPanel();
      hideRecentsScreen();
      
      // Если запущено приложение, закрываем его
      if (appManager && appManager.isAppRunning()) {
        appManager.closeCurrentApp();
      }
      
      // Показываем уведомление о переходе на главный экран
      AnimationHelper.showToast("Главный экран");
    });
    
    // Обработчик для кнопки "Недавние"
    recentsButton.addEventListener('click', function() {
      // Добавляем эффект нажатия
      this.classList.add('nav-pressed');
      setTimeout(() => this.classList.remove('nav-pressed'), 300);
      
      // Переключаем видимость экрана недавних приложений
      toggleRecentsScreen();
    });
  }

  // Получить иконку приложения по названию
  function getAppIconByName(appName) {
    const appIcons = {
      'calculator': 'calculate',
      'notes': 'note',
      'weather': 'cloud',
      'settings': 'settings',
      'camera': 'camera_alt',
      'phone': 'call',
      'messages': 'chat',
      'sphere': 'public',
      'gmail': 'email',
      'maps': 'map',
      'youtube': 'smart_display',
      'photos': 'photo_library',
      'calendar': 'calendar_today',
      'clock': 'access_time',
      'gallery': 'photo',
      'playstore': 'shopping_bag',
      'development': 'build',
      'contacts': 'contacts'
    };
    
    return appIcons[appName] || 'android';
  }

  // Инициализация и настройка менеджеров
  function initializeManagers() {
    // Создаем и настраиваем все менеджеры
    
    // Инициализация анимаций и эффектов
    rippleEffect = new RippleEffect();
    rippleEffect.init();
    
    animationHelper = new AnimationHelper();
    animationHelper.init();
    
    // Инициализация менеджера приложений
    appManager = new AppManager();
    window.appManager = appManager; // Делаем глобально доступным
    
    // Инициализация менеджера виджетов
    widgetManager = new WidgetManager();
    widgetManager.init();
    
    // Инициализация менеджера обоев
    wallpaperManager = new WallpaperManager();
    wallpaperManager.init();
    
    // Настройка обработчиков навигационной панели
    setupNavigationHandlers();
    
    // Загружаем настройки переключателей быстрого доступа
    loadToggleStates();
    
    // Показываем приветственное сообщение при первой загрузке
    setTimeout(() => {
      AnimationHelper.showToast("Добро пожаловать в Android 11 Web!");
    }, 1000);
  }
  
  // Загрузка состояний переключателей из настроек
  function loadToggleStates() {
    const toggleStates = SettingsManager.getSetting('toggleStates');
    if (!toggleStates) return;
    
    // Устанавливаем состояния переключателей
    for (const toggleId in toggleStates) {
      const toggleElement = document.querySelector(`.quick-toggle[data-toggle="${toggleId}"]`);
      if (toggleElement) {
        if (toggleStates[toggleId]) {
          toggleElement.classList.add('active');
        } else {
          toggleElement.classList.remove('active');
        }
      }
    }
    
    // Установка тёмной темы
    const darkMode = SettingsManager.getSetting('darkMode');
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
});

