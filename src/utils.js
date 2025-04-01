// Utilities for Android 11 Web

// Cookie utilities
export const CookieUtils = {
  // Set a cookie with given name, value and expiration days
  setCookie(name, value, days = 30) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
  },

  // Get a cookie by name
  getCookie(name) {
    const cookieName = `${name}=`;
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.indexOf(cookieName) === 0) {
        return cookie.substring(cookieName.length, cookie.length);
      }
    }
    return '';
  },

  // Delete a cookie by name
  deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
};

// Settings storage using cookies
export const SettingsManager = {
  // Default settings
  defaultSettings: {
    language: 'ru',
    darkMode: true,
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
    brightness: 70,
    wallpaper: 'default'
  },

  // Get all settings
  getSettings() {
    const settingsCookie = CookieUtils.getCookie('androidWebSettings');
    if (settingsCookie) {
      try {
        return JSON.parse(settingsCookie);
      } catch (e) {
        console.error('Error parsing settings cookie:', e);
        return this.defaultSettings;
      }
    }
    return this.defaultSettings;
  },

  // Save all settings
  saveSettings(settings) {
    try {
      CookieUtils.setCookie('androidWebSettings', JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings to cookie:', e);
    }
  },

  // Set a specific setting
  setSetting(key, value) {
    const settings = this.getSettings();
    settings[key] = value;
    this.saveSettings(settings);
  },

  // Get a specific setting
  getSetting(key) {
    return this.getSettings()[key];
  }
};

// Local storage for apps
export const AppStorage = {
  // Get app data
  getAppData(appName) {
    const data = localStorage.getItem(`app_${appName}`);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error(`Error parsing data for app ${appName}:`, e);
        return null;
      }
    }
    return null;
  },

  // Save app data
  saveAppData(appName, data) {
    try {
      localStorage.setItem(`app_${appName}`, JSON.stringify(data));
    } catch (e) {
      console.error(`Error saving data for app ${appName}:`, e);
    }
  },

  // Clear app data
  clearAppData(appName) {
    localStorage.removeItem(`app_${appName}`);
  }
}; 