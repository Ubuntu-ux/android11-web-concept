// Приложение часов для Android 11 Web
import { SettingsManager } from '../settings-manager.js';
import { DOMUtils } from '../utils.js';
import { AnimationHelper } from '../animations.js';

export class ClockApp {
  constructor() {
    this.container = null;
    this.currentTab = 'clock'; // clock, alarm, timer, stopwatch
    this.timers = [];
    this.alarms = [];
    this.stopwatchInterval = null;
    this.stopwatchTime = 0;
    this.timeInterval = null;
  }

  // Инициализация приложения
  init(container) {
    this.container = container;
    this.container.classList.add('clock-app');
    this.loadSavedData();
    this.render();
    
    // Показываем сообщение о том, что это приложение находится в разработке
    setTimeout(() => {
      AnimationHelper.showToast('Приложение Часы в разработке');
    }, 500);
  }

  // Загрузка сохраненных данных из хранилища
  loadSavedData() {
    // В будущем здесь будет загрузка сохраненных таймеров и будильников
  }
  
  // Отображение интерфейса
  render() {
    this.container.innerHTML = `
      <div class="clock-header">
        <h2>Часы</h2>
        <div class="clock-actions">
          <button class="clock-settings-button">
            <span class="material-icons-round">settings</span>
          </button>
        </div>
      </div>
      
      <div class="clock-tabs">
        <div class="clock-tab ${this.currentTab === 'clock' ? 'active' : ''}" data-tab="clock">
          <span class="material-icons-round">schedule</span>
          <span class="tab-label">Часы</span>
        </div>
        <div class="clock-tab ${this.currentTab === 'alarm' ? 'active' : ''}" data-tab="alarm">
          <span class="material-icons-round">alarm</span>
          <span class="tab-label">Будильник</span>
        </div>
        <div class="clock-tab ${this.currentTab === 'timer' ? 'active' : ''}" data-tab="timer">
          <span class="material-icons-round">timer</span>
          <span class="tab-label">Таймер</span>
        </div>
        <div class="clock-tab ${this.currentTab === 'stopwatch' ? 'active' : ''}" data-tab="stopwatch">
          <span class="material-icons-round">timer</span>
          <span class="tab-label">Секундомер</span>
        </div>
      </div>
      
      <div class="clock-content">
        ${this.renderTabContent()}
      </div>
    `;
    
    // Добавляем обработчики событий
    this.addEventListeners();
    
    // Запускаем обновление времени, если открыта вкладка часов
    if (this.currentTab === 'clock') {
      this.startClock();
    }
  }
  
  // Отрисовка содержимого выбранной вкладки
  renderTabContent() {
    switch(this.currentTab) {
      case 'clock':
        return this.renderClockTab();
      case 'alarm':
        return this.renderAlarmTab();
      case 'timer':
        return this.renderTimerTab();
      case 'stopwatch':
        return this.renderStopwatchTab();
      default:
        return this.renderClockTab();
    }
  }
  
  // Отрисовка вкладки с часами
  renderClockTab() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const date = now.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    return `
      <div class="clock-face">
        <div class="digital-time">${hours}:${minutes}<span class="seconds">:${seconds}</span></div>
        <div class="date">${date}</div>
        
        <div class="analog-clock">
          <div class="clock-circle">
            <div class="hour-hand" style="transform: rotate(${30 * hours + minutes / 2}deg)"></div>
            <div class="minute-hand" style="transform: rotate(${6 * minutes}deg)"></div>
            <div class="second-hand" style="transform: rotate(${6 * seconds}deg)"></div>
            <div class="clock-center"></div>
          </div>
        </div>
        
        <div class="world-clock">
          <h3>Мировое время</h3>
          <p>Функция мирового времени будет доступна в следующем обновлении.</p>
        </div>
      </div>
    `;
  }
  
  // Отрисовка вкладки с будильниками
  renderAlarmTab() {
    return `
      <div class="alarms-container">
        <div class="no-alarms-message">
          <span class="material-icons-round">alarm_off</span>
          <p>У вас нет установленных будильников</p>
          <button class="add-alarm-button">
            <span class="material-icons-round">add</span>
            <span>Добавить будильник</span>
          </button>
        </div>
      </div>
    `;
  }
  
  // Отрисовка вкладки с таймерами
  renderTimerTab() {
    return `
      <div class="timers-container">
        <div class="new-timer">
          <div class="timer-input">
            <div class="timer-digit-group">
              <input type="number" class="timer-hours" min="0" max="23" value="0">
              <label>ч</label>
            </div>
            <div class="timer-separator">:</div>
            <div class="timer-digit-group">
              <input type="number" class="timer-minutes" min="0" max="59" value="0">
              <label>м</label>
            </div>
            <div class="timer-separator">:</div>
            <div class="timer-digit-group">
              <input type="number" class="timer-seconds" min="0" max="59" value="0">
              <label>с</label>
            </div>
          </div>
          <button class="start-timer-button">
            <span class="material-icons-round">play_arrow</span>
            <span>Запустить</span>
          </button>
        </div>
        
        <div class="no-timers-message">
          <span class="material-icons-round">timer_off</span>
          <p>У вас нет активных таймеров</p>
        </div>
      </div>
    `;
  }
  
  // Отрисовка вкладки с секундомером
  renderStopwatchTab() {
    const minutes = Math.floor(this.stopwatchTime / 60000);
    const seconds = Math.floor((this.stopwatchTime % 60000) / 1000);
    const milliseconds = Math.floor((this.stopwatchTime % 1000) / 10);
    
    return `
      <div class="stopwatch-container">
        <div class="stopwatch-display">
          <div class="stopwatch-time">
            <span class="stopwatch-minutes">${minutes.toString().padStart(2, '0')}</span>:
            <span class="stopwatch-seconds">${seconds.toString().padStart(2, '0')}</span>.
            <span class="stopwatch-milliseconds">${milliseconds.toString().padStart(2, '0')}</span>
          </div>
        </div>
        
        <div class="stopwatch-controls">
          <button class="stopwatch-reset-button">
            <span class="material-icons-round">refresh</span>
          </button>
          <button class="stopwatch-start-button">
            <span class="material-icons-round">play_arrow</span>
          </button>
          <button class="stopwatch-lap-button" disabled>
            <span class="material-icons-round">flag</span>
          </button>
        </div>
        
        <div class="stopwatch-laps">
          <h3>Круги</h3>
          <div class="laps-list"></div>
        </div>
      </div>
    `;
  }
  
  // Запуск цифровых часов
  startClock() {
    // Очищаем предыдущий интервал, если он существует
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    
    // Обновляем время каждую секунду
    this.timeInterval = setInterval(() => {
      if (this.currentTab !== 'clock') {
        clearInterval(this.timeInterval);
        return;
      }
      
      const clockContent = this.container.querySelector('.clock-content');
      if (!clockContent) return;
      
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      
      const digitalTime = clockContent.querySelector('.digital-time');
      if (digitalTime) {
        digitalTime.innerHTML = `${hours}:${minutes}<span class="seconds">:${seconds}</span>`;
      }
      
      const secondHand = clockContent.querySelector('.second-hand');
      const minuteHand = clockContent.querySelector('.minute-hand');
      const hourHand = clockContent.querySelector('.hour-hand');
      
      if (secondHand) {
        secondHand.style.transform = `rotate(${6 * seconds}deg)`;
      }
      
      if (minuteHand) {
        minuteHand.style.transform = `rotate(${6 * minutes}deg)`;
      }
      
      if (hourHand) {
        hourHand.style.transform = `rotate(${30 * hours + minutes / 2}deg)`;
      }
    }, 1000);
  }
  
  // Добавление обработчиков событий
  addEventListeners() {
    // Переключение вкладок
    const tabs = this.container.querySelectorAll('.clock-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.dataset.tab;
        if (tabId !== this.currentTab) {
          this.currentTab = tabId;
          this.render();
        }
      });
    });
    
    // Обработчик кнопки настроек
    const settingsButton = this.container.querySelector('.clock-settings-button');
    if (settingsButton) {
      settingsButton.addEventListener('click', () => {
        AnimationHelper.showToast('Настройки часов будут доступны в следующем обновлении!');
      });
    }
    
    // Добавляем обработчики в зависимости от активной вкладки
    switch(this.currentTab) {
      case 'alarm':
        this.addAlarmListeners();
        break;
      case 'timer':
        this.addTimerListeners();
        break;
      case 'stopwatch':
        this.addStopwatchListeners();
        break;
    }
  }
  
  // Обработчики для вкладки будильников
  addAlarmListeners() {
    const addAlarmButton = this.container.querySelector('.add-alarm-button');
    if (addAlarmButton) {
      addAlarmButton.addEventListener('click', () => {
        AnimationHelper.showToast('Создание будильников будет доступно в следующем обновлении!');
      });
    }
  }
  
  // Обработчики для вкладки таймеров
  addTimerListeners() {
    const startTimerButton = this.container.querySelector('.start-timer-button');
    if (startTimerButton) {
      startTimerButton.addEventListener('click', () => {
        AnimationHelper.showToast('Создание таймеров будет доступно в следующем обновлении!');
      });
    }
    
    // Ограничиваем ввод только цифрами и правильными диапазонами
    const timerInputs = this.container.querySelectorAll('.timer-digit-group input');
    timerInputs.forEach(input => {
      input.addEventListener('input', () => {
        const value = parseInt(input.value);
        const min = parseInt(input.min);
        const max = parseInt(input.max);
        
        if (isNaN(value) || value < min) {
          input.value = min;
        } else if (value > max) {
          input.value = max;
        }
      });
    });
  }
  
  // Обработчики для вкладки секундомера
  addStopwatchListeners() {
    const startButton = this.container.querySelector('.stopwatch-start-button');
    const resetButton = this.container.querySelector('.stopwatch-reset-button');
    const lapButton = this.container.querySelector('.stopwatch-lap-button');
    
    if (startButton) {
      startButton.addEventListener('click', () => {
        if (this.stopwatchInterval) {
          // Если секундомер запущен, останавливаем его
          clearInterval(this.stopwatchInterval);
          this.stopwatchInterval = null;
          startButton.innerHTML = '<span class="material-icons-round">play_arrow</span>';
          
          if (lapButton) {
            lapButton.disabled = true;
          }
        } else {
          // Если секундомер остановлен, запускаем его
          const startTime = Date.now() - this.stopwatchTime;
          this.stopwatchInterval = setInterval(() => {
            this.updateStopwatch(startTime);
          }, 10);
          
          startButton.innerHTML = '<span class="material-icons-round">pause</span>';
          
          if (lapButton) {
            lapButton.disabled = false;
          }
        }
      });
    }
    
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        if (this.stopwatchInterval) {
          clearInterval(this.stopwatchInterval);
          this.stopwatchInterval = null;
        }
        
        this.stopwatchTime = 0;
        this.updateStopwatchDisplay();
        
        if (startButton) {
          startButton.innerHTML = '<span class="material-icons-round">play_arrow</span>';
        }
        
        if (lapButton) {
          lapButton.disabled = true;
        }
        
        const lapsList = this.container.querySelector('.laps-list');
        if (lapsList) {
          lapsList.innerHTML = '';
        }
      });
    }
    
    if (lapButton) {
      lapButton.addEventListener('click', () => {
        AnimationHelper.showToast('Функция кругов будет доступна в следующем обновлении!');
      });
    }
  }
  
  // Обновление отображения секундомера
  updateStopwatch(startTime) {
    this.stopwatchTime = Date.now() - startTime;
    this.updateStopwatchDisplay();
  }
  
  // Обновление отображения времени секундомера
  updateStopwatchDisplay() {
    const minutes = Math.floor(this.stopwatchTime / 60000);
    const seconds = Math.floor((this.stopwatchTime % 60000) / 1000);
    const milliseconds = Math.floor((this.stopwatchTime % 1000) / 10);
    
    const minutesElement = this.container.querySelector('.stopwatch-minutes');
    const secondsElement = this.container.querySelector('.stopwatch-seconds');
    const millisecondsElement = this.container.querySelector('.stopwatch-milliseconds');
    
    if (minutesElement) {
      minutesElement.textContent = minutes.toString().padStart(2, '0');
    }
    
    if (secondsElement) {
      secondsElement.textContent = seconds.toString().padStart(2, '0');
    }
    
    if (millisecondsElement) {
      millisecondsElement.textContent = milliseconds.toString().padStart(2, '0');
    }
  }
} 