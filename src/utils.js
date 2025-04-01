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
  },
  
  // Проверить поддержку cookies в браузере
  areCookiesEnabled() {
    try {
      const testCookie = 'cookietest=1';
      document.cookie = testCookie;
      const cookieEnabled = document.cookie.indexOf(testCookie) !== -1;
      document.cookie = `${testCookie};expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
      return cookieEnabled;
    } catch (e) {
      return false;
    }
  },
  
  // Получить все cookies как объект
  getAllCookies() {
    const cookiesObj = {};
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      const separatorIndex = cookie.indexOf('=');
      
      if (separatorIndex > 0) {
        const name = cookie.substring(0, separatorIndex);
        const value = cookie.substring(separatorIndex + 1);
        cookiesObj[name] = value;
      }
    }
    
    return cookiesObj;
  },
  
  // Удалить все cookies
  clearAllCookies() {
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      const name = cookie.split('=')[0];
      this.deleteCookie(name);
    }
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
        console.error(`Ошибка парсинга данных для приложения ${appName}:`, e);
        return null;
      }
    }
    return null;
  },

  // Save app data
  saveAppData(appName, data) {
    try {
      localStorage.setItem(`app_${appName}`, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error(`Ошибка сохранения данных для приложения ${appName}:`, e);
      return false;
    }
  },

  // Clear app data
  clearAppData(appName) {
    localStorage.removeItem(`app_${appName}`);
  },
  
  // Получить все данные приложений
  getAllAppsData() {
    const appsData = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('app_')) {
        const appName = key.substring(4);
        appsData[appName] = this.getAppData(appName);
      }
    }
    return appsData;
  },
  
  // Экспортировать все данные приложений в JSON
  exportAllAppsData() {
    return JSON.stringify(this.getAllAppsData(), null, 2);
  },
  
  // Импортировать данные приложений из JSON
  importAppsData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      for (const appName in data) {
        this.saveAppData(appName, data[appName]);
      }
      return true;
    } catch (e) {
      console.error('Ошибка импорта данных приложений:', e);
      return false;
    }
  },
  
  // Очистить данные всех приложений
  clearAllAppsData() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('app_')) {
        keys.push(key);
      }
    }
    keys.forEach(key => localStorage.removeItem(key));
  }
};

// Утилиты форматирования
export const FormatUtils = {
  // Форматирование даты
  formatDate(date, format = 'dd.MM.yyyy') {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return 'Invalid Date';
    }
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
      .replace('dd', day)
      .replace('MM', month)
      .replace('yyyy', year)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },
  
  // Форматирование числа в финансовый формат
  formatCurrency(number, currency = 'RUB', locale = 'ru-RU') {
    return new Intl.NumberFormat(locale, { 
      style: 'currency', 
      currency: currency,
      minimumFractionDigits: 2
    }).format(number);
  },
  
  // Преобразование размера файла в читаемый формат
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Байт';
    const k = 1024;
    const sizes = ['Байт', 'КБ', 'МБ', 'ГБ', 'ТБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  // Безопасное форматирование HTML (предотвращение XSS)
  escapeHtml(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }
};

// Утилиты для работы с DOM
export const DOMUtils = {
  // Создание элемента с атрибутами и дочерними элементами
  createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    for (const key in attributes) {
      if (key === 'style' && typeof attributes[key] === 'object') {
        Object.assign(element.style, attributes[key]);
      } else if (key === 'dataset' && typeof attributes[key] === 'object') {
        Object.assign(element.dataset, attributes[key]);
      } else if (key === 'className') {
        element.className = attributes[key];
      } else if (key === 'innerHTML') {
        element.innerHTML = attributes[key];
      } else if (key === 'textContent') {
        element.textContent = attributes[key];
      } else if (key.startsWith('on') && typeof attributes[key] === 'function') {
        element.addEventListener(key.substring(2).toLowerCase(), attributes[key]);
      } else {
        element.setAttribute(key, attributes[key]);
      }
    }
    
    for (const child of children) {
      if (child instanceof Node) {
        element.appendChild(child);
      } else if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      }
    }
    
    return element;
  },
  
  // Удаление всех дочерних элементов
  clearElement(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  },
  
  // Добавление или удаление класса в зависимости от условия
  toggleClass(element, className, condition) {
    if (condition) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  },
  
  // Добавление стилей в head
  addStyle(cssText) {
    const style = document.createElement('style');
    style.textContent = cssText;
    document.head.appendChild(style);
    return style;
  }
}; 