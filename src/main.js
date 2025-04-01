// Android 11 Web Interface - Main JavaScript
import icons from './assets/icons.js';
import AppManager from './apps/app-manager.js';
import WidgetManager from './widgets.js';
import WallpaperManager from './wallpapers.js';
import { SettingsManager } from './utils.js';

// Глобальные переменные для доступа к менеджерам
let appManager;
let widgetManager;
let wallpaperManager;

document.addEventListener("DOMContentLoaded", function() {
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

  function handleSwipeGesture() {
    const swipeDistance = touchEndY - touchStartY;

    // If swipe down from top of screen, show notification panel
    if (touchStartY < 100 && swipeDistance > 50) {
      showNotificationPanel();
    }

    // If swipe up when notification panel is visible, hide it
    if (notificationPanel.classList.contains("visible") && swipeDistance < -50) {
      hideNotificationPanel();
    }
  }

  // Make status bar clickable to show notification panel
  statusBar.addEventListener("click", function() {
    console.log("Status bar clicked");
    showNotificationPanel();
  });

  // Show notification panel
  function showNotificationPanel() {
    console.log("Showing notification panel");
    notificationPanel.classList.add("visible");
  }

  // Hide notification panel
  function hideNotificationPanel() {
    console.log("Hiding notification panel");
    notificationPanel.classList.remove("visible");
  }

  // For desktop testing: allow status bar click to toggle notification panel
  document.addEventListener("click", function(event) {
    if (event.target.closest(".status-bar")) {
      if (notificationPanel.classList.contains("visible")) {
        hideNotificationPanel();
      } else {
        showNotificationPanel();
      }
    }
  });

  // Tap and hold on home screen (empty area) to change wallpaper options
  homeScreen.addEventListener("long-press", function(event) {
    // Prevent triggering if tapping on an app icon
    if (!event.target.closest(".app-icon") && !event.target.closest(".dock") && !event.target.closest(".navigation-bar")) {
      alert("Wallpaper options would show here");
    }
  });

  // Long press polyfill
  let timer;
  homeScreen.addEventListener("touchstart", function(event) {
    if (!event.target.closest(".app-icon") && !event.target.closest(".dock") && !event.target.closest(".navigation-bar")) {
      timer = setTimeout(() => {
        const customEvent = new Event("long-press");
        homeScreen.dispatchEvent(customEvent);
      }, 800);
    }
  });

  homeScreen.addEventListener("touchend", function() {
    clearTimeout(timer);
  });

  homeScreen.addEventListener("touchmove", function() {
    clearTimeout(timer);
  });

  // Handle quick toggle clicks
  quickToggles.forEach(toggle => {
    toggle.addEventListener("click", function() {
      this.classList.toggle("active");

      // If this is the dark mode toggle, toggle dark mode
      if (this.querySelector(".label").textContent === getTranslatedLabel(this.querySelector(".label"), "Dark")) {
        document.body.classList.toggle("dark-mode");
      }
    });
  });

  // Handle app icon clicks
  appIcons.forEach(icon => {
    icon.addEventListener("click", function() {
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
        return;
      }

      const appName = this.querySelector(".app-name")?.textContent || appId;
      if (appId !== "app-drawer") {
        alert(getTranslatedText("Opening") + " " + appName);
      }
    });
  });

  // Settings screen handlers
  document.getElementById("settings-back").addEventListener("click", hideSettingsScreen);
  document.getElementById("about-phone").addEventListener("click", showAboutPhoneScreen);
  document.getElementById("language-settings").addEventListener("click", showLanguageScreen);
  document.getElementById("about-back").addEventListener("click", hideAboutPhoneScreen);
  document.getElementById("language-back").addEventListener("click", hideLanguageScreen);

  // Language switching
  document.getElementById("lang-ru").addEventListener("click", () => {
    setLanguage("ru");
    document.getElementById("lang-ru").querySelector(".language-check").style.display = "block";
    document.getElementById("lang-en").querySelector(".language-check")?.remove();

    const checkIcon = document.createElement("span");
    checkIcon.className = "material-icons-round language-check";
    checkIcon.textContent = "check";
    document.getElementById("lang-ru").appendChild(checkIcon);

    // Update language subtitle
    const languageSubtitle = document.querySelector("#language-settings .settings-item-subtitle");
    languageSubtitle.textContent = "Русский";

    setTimeout(hideLanguageScreen, 500);
  });

  document.getElementById("lang-en").addEventListener("click", () => {
    setLanguage("en");
    document.getElementById("lang-en").querySelector(".language-check") ||
      document.getElementById("lang-en").appendChild((() => {
        const checkIcon = document.createElement("span");
        checkIcon.className = "material-icons-round language-check";
        checkIcon.textContent = "check";
        return checkIcon;
      })());

    document.getElementById("lang-ru").querySelector(".language-check")?.remove();

    // Update language subtitle
    const languageSubtitle = document.querySelector("#language-settings .settings-item-subtitle");
    languageSubtitle.textContent = "English";

    setTimeout(hideLanguageScreen, 500);
  });

  // Handle navigation button clicks
  navigationButtons.forEach(button => {
    button.addEventListener("click", function() {
      const buttonId = this.id;

      switch (buttonId) {
        case "back":
          if (aboutPhoneScreen.classList.contains("visible")) {
            hideAboutPhoneScreen();
          } else if (languageScreen.classList.contains("visible")) {
            hideLanguageScreen();
          } else if (settingsScreen.classList.contains("visible")) {
            hideSettingsScreen();
          } else {
            hideNotificationPanel();
          }
          break;
        case "home":
          hideAllScreens();
          break;
        case "recents":
          alert(getTranslatedText("Recent apps would show here"));
          break;
      }
    });
  });

  // Hide notification panel when clicking home screen
  homeScreen.addEventListener("click", function(event) {
    // Only hide if clicking directly on home screen (not on an app)
    if (notificationPanel.classList.contains("visible") &&
        event.target === homeScreen) {
      hideNotificationPanel();
    }
  });

  // Double tap to wake (just toggles notification panel in this demo)
  let lastTap = 0;
  document.addEventListener("touchend", function(event) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;

    if (tapLength < 300 && tapLength > 0) {
      // Double tap detected
      if (!notificationPanel.classList.contains("visible")) {
        showNotificationPanel();
      } else {
        hideNotificationPanel();
      }
    }

    lastTap = currentTime;
  });

  // Add SVG icons to app icons
  document.querySelectorAll('.app-icon-img').forEach(iconElement => {
    const iconId = iconElement.id.replace('-dock', '');
    if (icons[iconId]) {
      // Clear current content and add SVG
      while (iconElement.firstChild) {
        iconElement.removeChild(iconElement.firstChild);
      }
      iconElement.innerHTML = icons[iconId];
    }
  });

  // Add fake notification icons
  const createIcon = (name) => {
    // Create a canvas for the icon
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');

    // Draw a colored circle
    ctx.beginPath();
    ctx.arc(24, 24, 20, 0, 2 * Math.PI);

    // Set color based on app name
    if (name === 'gmail') {
      ctx.fillStyle = '#DB4437';
    } else if (name === 'messages') {
      ctx.fillStyle = '#4285F4';
    } else {
      ctx.fillStyle = '#0F9D58';
    }

    ctx.fill();

    // Draw text or initial
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name.charAt(0).toUpperCase(), 24, 24);

    return canvas.toDataURL();
  };

  // Set notification app icons
  document.querySelectorAll('.notification-icon').forEach(icon => {
    const appName = icon.alt.toLowerCase();
    icon.src = createIcon(appName);
  });

  // Show Settings Screen
  function showSettingsScreen() {
    settingsScreen.classList.add("visible");
  }

  // Hide Settings Screen
  function hideSettingsScreen() {
    settingsScreen.classList.remove("visible");
  }

  // Show About Phone Screen
  function showAboutPhoneScreen() {
    aboutPhoneScreen.classList.add("visible");
  }

  // Hide About Phone Screen
  function hideAboutPhoneScreen() {
    aboutPhoneScreen.classList.remove("visible");
  }

  // Show Language Screen
  function showLanguageScreen() {
    languageScreen.classList.add("visible");
  }

  // Hide Language Screen
  function hideLanguageScreen() {
    languageScreen.classList.remove("visible");
  }

  // Hide all screens (go to home)
  function hideAllScreens() {
    hideNotificationPanel();
    hideSettingsScreen();
    hideAboutPhoneScreen();
    hideLanguageScreen();
  }

  // Set language for UI
  function setLanguage(lang) {
    currentLanguage = lang;

    // Update all translated elements
    document.querySelectorAll('[data-en]').forEach(el => {
      el.textContent = el.getAttribute(`data-${lang}`);
    });

    // Set HTML lang attribute
    document.documentElement.lang = lang;
  }

  // Get translated text
  function getTranslatedText(key) {
    const translations = {
      "Opening": {
        "en": "Opening",
        "ru": "Открываю"
      },
      "Recent apps would show here": {
        "en": "Recent apps would show here",
        "ru": "Здесь будут недавние приложения"
      }
    };

    return translations[key]?.[currentLanguage] || key;
  }

  // Get translated label from element
  function getTranslatedLabel(element, defaultKey) {
    if (element && element.getAttribute(`data-${currentLanguage}`)) {
      return element.getAttribute(`data-${currentLanguage}`);
    }
    return defaultKey;
  }

  // Инициализация и настройка менеджеров
  function initializeManagers() {
    // Инициализация менеджера приложений
    appManager = new AppManager();
    
    // Инициализация менеджера виджетов
    widgetManager = new WidgetManager();
    widgetManager.init();
    
    // Инициализация менеджера обоев
    wallpaperManager = new WallpaperManager();
    wallpaperManager.init();
    
    // Настройка слушателя для темного режима
    const darkModeToggle = document.querySelector('.quick-toggle:nth-child(2):nth-of-type(2)');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', function() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        // Сохранить настройку темного режима
        SettingsManager.setSetting('darkMode', isDarkMode);
        
        // Обновить обои при изменении темы
        if (wallpaperManager) {
          wallpaperManager.updateForDarkMode(isDarkMode);
        }
      });
    }
    
    // Загрузить сохраненные настройки темного режима
    const settings = SettingsManager.getSettings();
    if (settings.darkMode) {
      document.body.classList.add('dark-mode');
      const darkModeToggle = document.querySelector('.quick-toggle:nth-child(6)');
      if (darkModeToggle) {
        darkModeToggle.classList.add('active');
      }
      
      // Обновить обои при загрузке в темном режиме
      if (wallpaperManager) {
        wallpaperManager.updateForDarkMode(true);
      }
    }
  }

  // Initialize with Russian language
  setLanguage('ru');
});
