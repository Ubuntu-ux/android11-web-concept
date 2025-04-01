// Enhanced Settings Manager for Android 11 Web
import { CookieUtils } from './utils.js';

export class SettingsManager {
  static COOKIE_NAME = 'android11WebSettings';
  static EXPIRY_DAYS = 365; // Настройки сохраняются на год
  
  // Расширенные настройки по умолчанию
  static defaultSettings = {
    // Основные настройки
    language: 'ru',
    darkMode: true,
    
    // Настройки внешнего вида
    appearance: {
      fontSize: 'medium', // small, medium, large
      fontFamily: 'Roboto',
      accentColor: '#4285F4',
      wallpaper: 'default',
      iconStyle: 'default', // default, rounded, square
      animations: true
    },
    
    // Настройки уведомлений
    notifications: {
      enabled: true,
      sound: true,
      vibration: true,
      doNotDisturb: false,
      doNotDisturbStart: '23:00',
      doNotDisturbEnd: '07:00'
    },
    
    // Настройки экрана
    display: {
      brightness: 70,
      autoRotate: false,
      nightMode: true,
      nightModeStart: '22:00',
      nightModeEnd: '06:00',
      timeout: 30 // в секундах
    },
    
    // Настройки звука
    sound: {
      ringtoneVolume: 70, 
      mediaVolume: 80,
      alarmVolume: 90,
      notificationVolume: 60,
      vibrationOnRing: true,
      silentMode: false
    },
    
    // Настройки приватности
    privacy: {
      locationEnabled: true,
      cameraEnabled: true,
      microphoneEnabled: true,
      screenLock: 'none', // none, pattern, pin
      biometricAuth: false,
      showNotificationsOnLockScreen: true
    },
    
    // Быстрые переключения
    toggleStates: {
      wifi: true,
      bluetooth: false,
      dnd: false,
      flashlight: false,
      auto: false,
      dark: true,
      rotation: false,
      battery: false
    },
    
    // Настройки для приложений
    apps: {
      calculator: {
        decimalPlaces: 2,
        scientificMode: false,
        historyEnabled: true
      },
      notes: {
        autoSave: true,
        defaultFontSize: 16,
        sortBy: 'modified' // created, modified, title
      },
      weather: {
        units: 'metric', // metric, imperial
        defaultCity: 'Москва',
        showHourlyForecast: true,
        showDailyForecast: true,
        refreshInterval: 30 // в минутах
      },
      calendar: {
        weekStartsOn: 1, // 0 = Sunday, 1 = Monday
        showWeekNumbers: true,
        defaultView: 'month' // day, week, month
      }
    }
  };

  // Получить все настройки
  static getSettings() {
    const settingsCookie = CookieUtils.getCookie(this.COOKIE_NAME);
    if (settingsCookie) {
      try {
        const parsedSettings = JSON.parse(settingsCookie);
        // Объединяем с настройками по умолчанию, чтобы гарантировать актуальность структуры
        return this.mergeSettings(this.defaultSettings, parsedSettings);
      } catch (e) {
        console.error('Ошибка парсинга настроек из cookies:', e);
        return this.defaultSettings;
      }
    }
    return this.defaultSettings;
  }

  // Рекурсивное объединение настроек
  static mergeSettings(defaults, custom) {
    const result = { ...defaults };
    
    // Перебираем пользовательские настройки
    for (const key in custom) {
      // Если значение - объект и не null, рекурсивно объединяем
      if (custom[key] !== null && typeof custom[key] === 'object' && typeof defaults[key] === 'object') {
        result[key] = this.mergeSettings(defaults[key], custom[key]);
      } else {
        // Иначе просто заменяем значение
        result[key] = custom[key];
      }
    }
    
    return result;
  }

  // Сохранить все настройки
  static saveSettings(settings) {
    try {
      CookieUtils.setCookie(this.COOKIE_NAME, JSON.stringify(settings), this.EXPIRY_DAYS);
      // Вызываем событие для оповещения об изменении настроек
      window.dispatchEvent(new CustomEvent('settingsChanged', { detail: settings }));
      return true;
    } catch (e) {
      console.error('Ошибка сохранения настроек в cookies:', e);
      return false;
    }
  }

  // Установить конкретную настройку
  static setSetting(path, value) {
    const settings = this.getSettings();
    const pathParts = path.split('.');
    let current = settings;
    
    // Идем по пути, создавая объекты, если необходимо
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }
    
    // Устанавливаем значение
    current[pathParts[pathParts.length - 1]] = value;
    
    // Сохраняем обновленные настройки
    return this.saveSettings(settings);
  }

  // Получить конкретную настройку
  static getSetting(path) {
    const settings = this.getSettings();
    const pathParts = path.split('.');
    let current = settings;
    
    // Идем по пути
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      if (current[part] === undefined) {
        // Если такого пути нет, возвращаем значение по умолчанию
        return this.getDefaultSetting(path);
      }
      current = current[part];
    }
    
    return current;
  }
  
  // Получить настройку по умолчанию
  static getDefaultSetting(path) {
    const pathParts = path.split('.');
    let current = this.defaultSettings;
    
    // Идем по пути
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      if (current[part] === undefined) {
        return undefined;
      }
      current = current[part];
    }
    
    return current;
  }
  
  // Сбросить конкретную настройку до значения по умолчанию
  static resetSetting(path) {
    const defaultValue = this.getDefaultSetting(path);
    if (defaultValue !== undefined) {
      return this.setSetting(path, defaultValue);
    }
    return false;
  }
  
  // Сбросить все настройки до значений по умолчанию
  static resetAllSettings() {
    return this.saveSettings(this.defaultSettings);
  }
  
  // Экспорт настроек в JSON
  static exportSettings() {
    try {
      const settings = this.getSettings();
      const jsonString = JSON.stringify(settings, null, 2);
      return jsonString;
    } catch (e) {
      console.error('Ошибка экспорта настроек:', e);
      return null;
    }
  }
  
  // Импорт настроек из JSON
  static importSettings(jsonString) {
    try {
      const settings = JSON.parse(jsonString);
      return this.saveSettings(settings);
    } catch (e) {
      console.error('Ошибка импорта настроек:', e);
      return false;
    }
  }
  
  // Подписка на изменения настроек
  static subscribeToChanges(callback) {
    window.addEventListener('settingsChanged', (event) => {
      callback(event.detail);
    });
  }
} 