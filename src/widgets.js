// Widgets for Android 11 Web
import { AppStorage } from './utils.js';

export default class WidgetManager {
  constructor() {
    this.widgetContainer = null;
    this.widgets = [];
    this.availableWidgets = {
      'clock': this.createClockWidget,
      'weather': this.createWeatherWidget,
      'notes': this.createNotesWidget,
      'calendar': this.createCalendarWidget
    };
  }

  // Initialize the widget manager
  init() {
    // Create widget container if it doesn't exist
    if (!document.querySelector('.widget-container')) {
      this.createWidgetContainer();
    } else {
      this.widgetContainer = document.querySelector('.widget-container');
    }

    // Load saved widgets
    this.loadWidgets();
    
    // Render widgets
    this.renderWidgets();
    
    // Add long press handler for widget management
    this.addWidgetManagementHandlers();
  }

  // Create the widget container
  createWidgetContainer() {
    this.widgetContainer = document.createElement('div');
    this.widgetContainer.className = 'widget-container';
    
    // Insert before the app grid
    const appGrid = document.querySelector('.app-grid');
    if (appGrid) {
      appGrid.parentNode.insertBefore(this.widgetContainer, appGrid);
    }
  }

  // Load saved widgets from storage
  loadWidgets() {
    const savedWidgets = AppStorage.getAppData('widgets');
    this.widgets = savedWidgets || [
      { id: 'clock', position: 0 },
      { id: 'weather', position: 1 }
    ];
  }

  // Save widgets to storage
  saveWidgets() {
    AppStorage.saveAppData('widgets', this.widgets);
  }

  // Render all widgets
  renderWidgets() {
    if (!this.widgetContainer) return;
    
    // Clear container
    this.widgetContainer.innerHTML = '';
    
    // Sort widgets by position
    const sortedWidgets = [...this.widgets].sort((a, b) => a.position - b.position);
    
    // Render each widget
    sortedWidgets.forEach(widget => {
      if (this.availableWidgets[widget.id]) {
        const widgetElement = this.availableWidgets[widget.id].call(this);
        if (widgetElement) {
          widgetElement.dataset.widgetId = widget.id;
          this.widgetContainer.appendChild(widgetElement);
        }
      }
    });
  }

  // Add handlers for widget management
  addWidgetManagementHandlers() {
    // Long press on empty area to add widgets
    this.widgetContainer.addEventListener('long-press', (event) => {
      if (event.target === this.widgetContainer) {
        this.showWidgetMenu();
      }
    });

    // Long press polyfill
    let timer;
    this.widgetContainer.addEventListener('touchstart', (event) => {
      if (event.target === this.widgetContainer) {
        timer = setTimeout(() => {
          const customEvent = new Event('long-press');
          this.widgetContainer.dispatchEvent(customEvent);
        }, 800);
      }
    });

    this.widgetContainer.addEventListener('touchend', () => {
      clearTimeout(timer);
    });

    this.widgetContainer.addEventListener('touchmove', () => {
      clearTimeout(timer);
    });

    // Long press on widget to remove
    this.widgetContainer.addEventListener('touchstart', (event) => {
      const widgetElement = event.target.closest('.widget');
      if (widgetElement) {
        timer = setTimeout(() => {
          this.showWidgetOptions(widgetElement);
        }, 800);
      }
    });
  }

  // Show widget management menu
  showWidgetMenu() {
    // Get unused widgets
    const usedWidgetIds = new Set(this.widgets.map(w => w.id));
    const unusedWidgets = Object.keys(this.availableWidgets)
      .filter(id => !usedWidgetIds.has(id));
    
    if (unusedWidgets.length === 0) {
      alert('Все доступные виджеты уже добавлены');
      return;
    }
    
    // Create widget menu
    const widgetMenuElement = document.createElement('div');
    widgetMenuElement.className = 'widget-menu';
    
    // Add title
    const titleElement = document.createElement('div');
    titleElement.className = 'widget-menu-title';
    titleElement.textContent = 'Добавить виджет';
    widgetMenuElement.appendChild(titleElement);
    
    // Add widget options
    unusedWidgets.forEach(widgetId => {
      const widgetOption = document.createElement('div');
      widgetOption.className = 'widget-option';
      
      const widgetName = this.getWidgetName(widgetId);
      widgetOption.textContent = widgetName;
      
      widgetOption.addEventListener('click', () => {
        this.addWidget(widgetId);
        document.body.removeChild(widgetMenuElement);
      });
      
      widgetMenuElement.appendChild(widgetOption);
    });
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'widget-menu-close';
    closeButton.textContent = 'Отмена';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(widgetMenuElement);
    });
    widgetMenuElement.appendChild(closeButton);
    
    // Add to body
    document.body.appendChild(widgetMenuElement);
  }

  // Show options for a specific widget
  showWidgetOptions(widgetElement) {
    const widgetId = widgetElement.dataset.widgetId;
    
    // Create options menu
    const optionsElement = document.createElement('div');
    optionsElement.className = 'widget-options';
    
    // Add title
    const titleElement = document.createElement('div');
    titleElement.className = 'widget-options-title';
    titleElement.textContent = this.getWidgetName(widgetId);
    optionsElement.appendChild(titleElement);
    
    // Add remove option
    const removeOption = document.createElement('div');
    removeOption.className = 'widget-option remove';
    removeOption.textContent = 'Удалить виджет';
    
    removeOption.addEventListener('click', () => {
      this.removeWidget(widgetId);
      document.body.removeChild(optionsElement);
    });
    
    optionsElement.appendChild(removeOption);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'widget-options-close';
    closeButton.textContent = 'Отмена';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(optionsElement);
    });
    optionsElement.appendChild(closeButton);
    
    // Add to body
    document.body.appendChild(optionsElement);
  }

  // Add a new widget
  addWidget(widgetId) {
    const newPosition = this.widgets.length > 0 ? 
      Math.max(...this.widgets.map(w => w.position)) + 1 : 0;
    
    this.widgets.push({
      id: widgetId,
      position: newPosition
    });
    
    this.saveWidgets();
    this.renderWidgets();
  }

  // Remove a widget
  removeWidget(widgetId) {
    this.widgets = this.widgets.filter(widget => widget.id !== widgetId);
    this.saveWidgets();
    this.renderWidgets();
  }

  // Get human-readable widget name
  getWidgetName(widgetId) {
    const widgetNames = {
      'clock': 'Часы и дата',
      'weather': 'Погода',
      'notes': 'Заметки',
      'calendar': 'Календарь'
    };
    
    return widgetNames[widgetId] || widgetId;
  }

  // Create clock widget
  createClockWidget() {
    const widget = document.createElement('div');
    widget.className = 'widget clock-widget';
    
    const timeElement = document.createElement('div');
    timeElement.className = 'clock-time';
    
    const dateElement = document.createElement('div');
    dateElement.className = 'clock-date';
    
    widget.appendChild(timeElement);
    widget.appendChild(dateElement);
    
    // Update time function
    const updateTime = () => {
      const now = new Date();
      
      // Format time
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      timeElement.textContent = `${hours}:${minutes}`;
      
      // Format date
      const options = { weekday: 'long', day: 'numeric', month: 'long' };
      dateElement.textContent = now.toLocaleDateString('ru-RU', options);
    };
    
    // Initial update
    updateTime();
    
    // Update every minute
    setInterval(updateTime, 60000);
    
    return widget;
  }

  // Create weather widget
  createWeatherWidget() {
    const widget = document.createElement('div');
    widget.className = 'widget weather-widget';
    
    // Load weather data from storage
    const weatherData = AppStorage.getAppData('weather');
    const city = weatherData && weatherData.city ? weatherData.city : 'Москва';
    
    widget.innerHTML = `
      <div class="weather-widget-content">
        <div class="weather-widget-city">${city}</div>
        <div class="weather-widget-loading">
          <span class="material-icons-round">cloud</span>
          <span>Загрузка...</span>
        </div>
      </div>
    `;
    
    // Add click handler to open weather app
    widget.addEventListener('click', () => {
      // Find and call the weather app launcher
      const weatherApp = document.querySelector('#weather');
      if (weatherApp) {
        weatherApp.parentElement.click();
      }
    });
    
    // Fetch weather data
    this.updateWeatherWidget(widget, city);
    
    return widget;
  }

  // Update weather widget with data
  async updateWeatherWidget(widget, city) {
    try {
      const apiKey = '4d8fb5b93d4af21d66a2948710284366'; // OpenWeatherMap free API key
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=ru`);
      
      if (!response.ok) {
        throw new Error('Ошибка получения данных');
      }
      
      const data = await response.json();
      
      // Update widget
      const temp = Math.round(data.main.temp);
      const description = data.weather[0].description;
      const icon = data.weather[0].icon;
      const iconUrl = `https://openweathermap.org/img/wn/${icon}.png`;
      
      widget.querySelector('.weather-widget-content').innerHTML = `
        <div class="weather-widget-city">${data.name}</div>
        <div class="weather-widget-info">
          <img src="${iconUrl}" alt="${description}" class="weather-widget-icon">
          <div class="weather-widget-temp">${temp}°C</div>
        </div>
        <div class="weather-widget-desc">${description}</div>
      `;
    } catch (error) {
      console.error('Weather widget error:', error);
      widget.querySelector('.weather-widget-loading').innerHTML = `
        <span class="material-icons-round">error_outline</span>
        <span>Ошибка загрузки</span>
      `;
    }
  }

  // Create notes widget
  createNotesWidget() {
    const widget = document.createElement('div');
    widget.className = 'widget notes-widget';
    
    // Load notes from storage
    const notes = AppStorage.getAppData('notes') || [];
    
    if (notes.length === 0) {
      widget.innerHTML = `
        <div class="notes-widget-empty">
          <span class="material-icons-round">note_add</span>
          <span>Нет заметок</span>
        </div>
      `;
    } else {
      // Sort by last updated
      const sortedNotes = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
      const recentNotes = sortedNotes.slice(0, 3); // Show up to 3 recent notes
      
      widget.innerHTML = `
        <div class="notes-widget-title">Последние заметки</div>
        <div class="notes-widget-list">
          ${recentNotes.map(note => `
            <div class="notes-widget-item" data-id="${note.id}">
              <div class="notes-widget-item-title">${this.escapeHtml(note.title)}</div>
              <div class="notes-widget-item-preview">${this.escapeHtml(note.content.substring(0, 40))}${note.content.length > 40 ? '...' : ''}</div>
            </div>
          `).join('')}
        </div>
      `;
    }
    
    // Add click handler to open notes app
    widget.addEventListener('click', () => {
      const notesApp = document.querySelector('#notes');
      if (notesApp) {
        notesApp.parentElement.click();
      }
    });
    
    return widget;
  }

  // Create calendar widget
  createCalendarWidget() {
    const widget = document.createElement('div');
    widget.className = 'widget calendar-widget';
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentDay = now.getDate();
    
    // Month names
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                         'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    
    // Day names
    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    
    // Get first day of month
    const firstDay = new Date(currentYear, currentMonth, 1).getDay() || 7; // 0 is Sunday, convert to 7
    
    // Get days in month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Create header
    const header = `
      <div class="calendar-widget-header">
        <div class="calendar-month-year">${monthNames[currentMonth]} ${currentYear}</div>
      </div>
    `;
    
    // Create days of week header
    const daysHeader = `
      <div class="calendar-days-header">
        ${dayNames.map(day => `<div class="calendar-day-name">${day}</div>`).join('')}
      </div>
    `;
    
    // Create days grid
    let daysGrid = '<div class="calendar-days-grid">';
    
    // Add empty cells for days before the first day of month
    for (let i = 1; i < firstDay; i++) {
      daysGrid += '<div class="calendar-day empty"></div>';
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isCurrentDay = day === currentDay;
      daysGrid += `
        <div class="calendar-day ${isCurrentDay ? 'current' : ''}">
          ${day}
        </div>
      `;
    }
    
    daysGrid += '</div>';
    
    // Assemble widget
    widget.innerHTML = header + daysHeader + daysGrid;
    
    // Add click handler
    widget.addEventListener('click', () => {
      const calendarApp = document.querySelector('#calendar');
      if (calendarApp) {
        calendarApp.parentElement.click();
      }
    });
    
    return widget;
  }

  // Helper function to escape HTML
  escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
} 