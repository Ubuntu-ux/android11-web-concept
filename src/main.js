// Android 11 Web Interface - Main JavaScript
import icons from './assets/icons.js';
import AppManager from './apps/app-manager.js';
import WidgetManager from './widgets.js';
import WallpaperManager from './wallpapers.js';
import RecentsManager from './recents.js';
import { SettingsManager } from './utils.js';
import { RippleEffect, AnimationHelper } from './animations.js';

// Глобальные переменные для доступа к менеджерам
let appManager;
let widgetManager;
let wallpaperManager;
let recentsManager;
let rippleEffect;
let animationHelper;

document.addEventListener("DOMContentLoaded", function() {
  // Сразу устанавливаем тёмную тему по умолчанию
  document.body.classList.add('dark-mode');
  
  // Get DOM elements
  const statusBar = document.querySelector(".status-bar");
  const notificationPanel = document.querySelector(".notification-panel");
  const homeScreen = document.querySelector(".home-screen");
  const settingsScreen = document.querySelector(".settings-screen");
  const aboutPhoneScreen = document.querySelector(".about-phone-screen");
  const languageScreen = document.querySelector(".language-screen");
  const timeElement = document.querySelector(".time");
  const quickToggles = document.querySelectorAll(".quick-toggle");
  const appIcons = document.querySelectorAll(".app-icon");
  const navigationButtons = document.querySelectorAll(".nav-button");

  // Инициализируем менеджеры
  initializeManagers();

  // Current language (default is Russian)
  let currentLanguage = 'ru';

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
  }, false);

  document.addEventListener("touchend", function(event) {
    touchEndY = event.changedTouches[0].clientY;
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
    if (swipeDistance < -70 && notificationPanel.classList.contains("visible")) {
      hideNotificationPanel();
      return;
    }
  }

  // Show notification panel with animation
  function showNotificationPanel() {
    notificationPanel.classList.add("visible");
  }

  // Hide notification panel with animation
  function hideNotificationPanel() {
    notificationPanel.classList.remove("visible");
  }

  // Handle quick toggle clicks
  quickToggles.forEach(toggle => {
    toggle.addEventListener("click", function() {
      this.classList.toggle("active");

      // If this is the dark mode toggle, toggle dark mode
      if (this.querySelector(".label").textContent === getTranslatedLabel(this.querySelector(".label"), "Dark")) {
        document.body.classList.toggle("dark-mode");
        // Активируем тёмный режим сразу
        document.querySelector('.quick-toggle:nth-child(6)').classList.add('active');
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
      // Добавляем визуальный эффект нажатия
      this.classList.add('app-pressed');
      setTimeout(() => this.classList.remove('app-pressed'), 300);
      
      const appIconImg = this.querySelector(".app-icon-img");
      const appId = appIconImg ? appIconImg.id.replace("-dock", "") : "";

      // Special handling for settings app
      if (appId === "settings" || this.id === "settings-app") {
        showSettingsScreen();
        return;
      }

      // Проверяем, является ли нажатое приложение одним из наших специальных приложений
      if (["calculator", "notes", "weather"].includes(appId) && appManager) {
        appManager.launchApp(appId);
        
        // Добавляем в недавние приложения
        if (recentsManager) {
          const appName = this.querySelector(".app-name")?.textContent || 
                          getAppNameById(appId);
          const appIcon = getAppIconById(appId);
          recentsManager.addAppToRecents(appId, appName, appIcon);
        }
        return;
      }

      // Для всех других приложений показываем экран "В разработке"
      import('./dev-app.js')
        .then(module => {
          const DevApp = module.default;
          const appName = this.querySelector(".app-name")?.textContent || appId;
          DevApp.showDevApp(appName);
          
          // Добавляем в недавние приложения
          if (recentsManager) {
            const appIcon = this.querySelector(".material-icons-round")?.textContent || "apps";
            recentsManager.addAppToRecents(appId, appName, appIcon);
          }
        });
    });
  });

  // Settings screen handlers with improved animations
  document.getElementById("settings-back").addEventListener("click", function() {
    hideSettingsScreen();
    AnimationHelper.showToast("Настройки закрыты");
  });
  
  document.getElementById("about-phone").addEventListener("click", function() {
    showAboutPhoneScreen();
    AnimationHelper.showToast("О телефоне");
  });
  
  document.getElementById("language-settings").addEventListener("click", function() {
    showLanguageScreen();
    AnimationHelper.showToast("Языковые настройки");
  });
  
  document.getElementById("about-back").addEventListener("click", hideAboutPhoneScreen);
  document.getElementById("language-back").addEventListener("click", hideLanguageScreen);

  // Language selection
  document.querySelectorAll(".language-item").forEach(item => {
    item.addEventListener("click", function() {
      const lang = this.getAttribute("data-lang");
      setLanguage(lang);
      
      // Visual feedback
      document.querySelectorAll(".language-item .language-check span").forEach(check => {
        check.textContent = "";
      });
      this.querySelector(".language-check span").textContent = "check";
      
      // Show toast
      const langName = this.querySelector(".language-name").textContent;
      AnimationHelper.showToast(`Язык изменен на: ${langName}`);
    });
  });

  // Show settings screen with animation
  function showSettingsScreen() {
    settingsScreen.classList.add("visible");
  }

  // Hide settings screen with animation
  function hideSettingsScreen() {
    settingsScreen.classList.remove("visible");
  }

  // Show about phone screen with animation
  function showAboutPhoneScreen() {
    aboutPhoneScreen.classList.add("visible");
  }

  // Hide about phone screen with animation
  function hideAboutPhoneScreen() {
    aboutPhoneScreen.classList.remove("visible");
  }

  // Show language screen with animation
  function showLanguageScreen() {
    languageScreen.classList.add("visible");
  }

  // Hide language screen with animation
  function hideLanguageScreen() {
    languageScreen.classList.remove("visible");
  }

  // Set app language
  function setLanguage(lang) {
    currentLanguage = lang;
    
    // Toggle check mark icons
    document.querySelectorAll(".language-item").forEach(item => {
      const itemLang = item.getAttribute("data-lang");
      const checkIcon = item.querySelector(".language-check .material-icons-round");
      checkIcon.textContent = itemLang === lang ? "check" : "";
    });
    
    // Save language setting
    SettingsManager.setSetting('language', lang);
    
    // Update texts based on language
    updateTexts();
  }

  // Update UI texts based on current language
  function updateTexts() {
    // Update quick toggle labels
    const toggleLabels = {
      "ru": ["Wi-Fi", "Bluetooth", "Не беспокоить", "Фонарик", "Авто", "Тёмная тема", "Поворот", "Экономия"],
      "en": ["Wi-Fi", "Bluetooth", "Do Not Disturb", "Flashlight", "Auto", "Dark Mode", "Rotation", "Battery"]
    };
    
    document.querySelectorAll(".quick-toggle .label").forEach((label, index) => {
      if (toggleLabels[currentLanguage] && toggleLabels[currentLanguage][index]) {
        label.textContent = toggleLabels[currentLanguage][index];
      }
    });
    
    // More text updates can be added here
  }

  // Get translated text
  function getTranslatedText(key) {
    const translations = {
      "Opening": {
        "ru": "Открываю",
        "en": "Opening"
      }
    };
    
    return translations[key] && translations[key][currentLanguage] 
      ? translations[key][currentLanguage] 
      : key;
  }

  // Get translated label
  function getTranslatedLabel(element, defaultKey) {
    const translations = {
      "Dark": {
        "ru": "Тёмная тема",
        "en": "Dark Mode"
      }
    };
    
    const text = element.textContent;
    
    for (const key in translations) {
      if (translations[key]["en"] === defaultKey && 
          (text === translations[key]["ru"] || text === translations[key]["en"])) {
        return key;
      }
    }
    
    return defaultKey;
  }

  // Улучшенные обработчики навигационной панели
  function setupNavigationHandlers() {
    // Получаем кнопки
    const backButton = document.querySelector('.nav-button:nth-child(1)');
    const homeButton = document.querySelector('.nav-button:nth-child(2)');
    const recentsButton = document.querySelector('.nav-button:nth-child(3)');
    
    if (!backButton || !homeButton || !recentsButton) return;
    
    // Добавляем классы для идентификации
    backButton.classList.add('nav-button-back');
    homeButton.classList.add('nav-button-home', 'home-button');
    recentsButton.classList.add('nav-button-recents');
    
    // Обработчик для кнопки "Назад"
    backButton.addEventListener('click', function() {
      // Добавляем эффект нажатия
      this.classList.add('nav-pressed');
      setTimeout(() => this.classList.remove('nav-pressed'), 300);
      
      // Проверяем, какие экраны открыты и закрываем их в правильном порядке
      const appScreen = document.querySelector('.app-screen');
      const settingsScreen = document.querySelector('.settings-screen');
      const aboutPhoneScreen = document.querySelector('.about-phone-screen');
      const languageScreen = document.querySelector('.language-screen');
      const notificationPanel = document.querySelector('.notification-panel');
      
      if (languageScreen && languageScreen.classList.contains('visible')) {
        hideLanguageScreen();
        AnimationHelper.showToast("Назад к настройкам");
      } else if (aboutPhoneScreen && aboutPhoneScreen.classList.contains('visible')) {
        hideAboutPhoneScreen();
        AnimationHelper.showToast("Назад к настройкам");
      } else if (settingsScreen && settingsScreen.classList.contains('visible')) {
        hideSettingsScreen();
        AnimationHelper.showToast("Назад на главный экран");
      } else if (appScreen && appScreen.classList.contains('visible')) {
        appScreen.classList.remove('visible');
        AnimationHelper.showToast("Приложение закрыто");
      } else if (notificationPanel && notificationPanel.classList.contains('visible')) {
        notificationPanel.classList.remove('visible');
      } else if (recentsManager && recentsManager.isVisible) {
        recentsManager.hideRecents();
        AnimationHelper.showToast("Недавние приложения закрыты");
      }
    });
    
    // Обработчик для кнопки "Домой"
    homeButton.addEventListener('click', function() {
      // Добавляем эффект нажатия
      this.classList.add('nav-pressed');
      setTimeout(() => this.classList.remove('nav-pressed'), 300);
      
      // Закрываем все открытые экраны
      document.querySelectorAll('.visible').forEach(element => {
        if (element.classList.contains('notification-panel') ||
            element.classList.contains('settings-screen') ||
            element.classList.contains('about-phone-screen') ||
            element.classList.contains('language-screen') ||
            element.classList.contains('app-screen')) {
          element.classList.remove('visible');
        }
      });
      
      // Скрываем экран недавних приложений если он открыт
      if (recentsManager && recentsManager.isVisible) {
        recentsManager.hideRecents();
      }
      
      // Показываем уведомление о переходе на главный экран
      AnimationHelper.showToast("Главный экран");
    });
    
    // Обработчик для кнопки "Недавние"
    recentsButton.addEventListener('click', function() {
      // Добавляем эффект нажатия
      this.classList.add('nav-pressed');
      setTimeout(() => this.classList.remove('nav-pressed'), 300);
      
      // Показываем/скрываем экран недавних приложений
      if (recentsManager) {
        recentsManager.toggleRecents();
        
        if (!recentsManager.isVisible) {
          AnimationHelper.showToast("Недавние приложения");
        }
      }
    });
  }

  // Получить имя приложения по ID
  function getAppNameById(appId) {
    const appNames = {
      'calculator': 'Калькулятор',
      'notes': 'Заметки',
      'weather': 'Погода',
      'settings': 'Настройки',
      'camera': 'Камера',
      'phone': 'Телефон',
      'messages': 'Сообщения',
      'chrome': 'Chrome',
      'gmail': 'Gmail',
      'maps': 'Карты',
      'youtube': 'YouTube',
      'photos': 'Фото',
      'calendar': 'Календарь',
      'clock': 'Часы',
      'play-store': 'Play Маркет'
    };
    
    return appNames[appId] || appId;
  }
  
  // Получить иконку приложения по ID
  function getAppIconById(appId) {
    const appIcons = {
      'calculator': 'calculate',
      'notes': 'note',
      'weather': 'cloud',
      'settings': 'settings',
      'camera': 'camera',
      'phone': 'phone',
      'messages': 'message',
      'chrome': 'language',
      'gmail': 'mail',
      'maps': 'map',
      'youtube': 'smart_display',
      'photos': 'photo',
      'calendar': 'calendar_today',
      'clock': 'access_time',
      'play-store': 'shop'
    };
    
    return appIcons[appId] || 'android';
  }

  // Инициализация и настройка менеджеров
  function initializeManagers() {
    // Создаем и добавляем контейнер для приложений если его еще нет
    if (!document.querySelector('.app-screen')) {
      const appScreen = document.createElement('div');
      appScreen.className = 'app-screen';
      document.querySelector('.android-phone').appendChild(appScreen);
    }
    
    // Инициализация менеджера приложений
    appManager = new AppManager();
    window.appManager = appManager; // Делаем глобально доступным
    
    // Инициализация менеджера виджетов
    widgetManager = new WidgetManager();
    widgetManager.init();
    
    // Инициализация менеджера обоев
    wallpaperManager = new WallpaperManager();
    wallpaperManager.init();
    
    // Инициализация менеджера недавних приложений
    recentsManager = new RecentsManager();
    recentsManager.init();
    
    // Инициализация эффектов и анимаций
    rippleEffect = new RippleEffect();
    animationHelper = new AnimationHelper();
    
    // Настройка обработчиков навигационной панели
    setupNavigationHandlers();
    
    // Активируем тёмный режим по умолчанию
    SettingsManager.setSetting('darkMode', true);
    
    // Находим переключатель темного режима
    const darkToggle = document.querySelector('.quick-toggle:nth-child(6)');
    if (darkToggle) {
      darkToggle.classList.add('active');
      
      // Настройка слушателя для темного режима
      darkToggle.addEventListener('click', function() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        // Сохранить настройку темного режима
        SettingsManager.setSetting('darkMode', isDarkMode);
        
        // Обновить обои при изменении темы
        if (wallpaperManager) {
          wallpaperManager.updateForDarkMode(isDarkMode);
        }
      });
    }
    
    // Обновить обои при загрузке в темном режиме
    if (wallpaperManager) {
      wallpaperManager.updateForDarkMode(true);
    }
    
    // Показываем приветственное сообщение при первой загрузке
    setTimeout(() => {
      AnimationHelper.showToast("Добро пожаловать в Android 11 Web!");
    }, 1000);
  }

  // Initialize with Russian language
  setLanguage('ru');
});
