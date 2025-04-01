// Приложение погоды для Android 11 Web
import { SettingsManager } from '../settings-manager.js';
import { DOMUtils } from '../utils.js';
import { AnimationHelper } from '../animations.js';

export class WeatherApp {
  constructor() {
    this.container = null;
    this.weatherData = {
      location: 'Москва',
      temperature: 12,
      condition: 'Облачно',
      icon: 'cloud',
      forecast: [
        { day: 'Пн', temp: 13, icon: 'cloud' },
        { day: 'Вт', temp: 15, icon: 'wb_sunny' },
        { day: 'Ср', temp: 12, icon: 'water_drop' },
        { day: 'Чт', temp: 10, icon: 'water_drop' },
        { day: 'Пт', temp: 11, icon: 'cloud' }
      ]
    };
  }

  // Инициализация приложения
  init(container) {
    this.container = container;
    this.container.classList.add('weather-app');
    this.render();
    
    // Показываем сообщение о том, что это приложение находится в разработке
    setTimeout(() => {
      AnimationHelper.showToast('Приложение Погода в разработке');
    }, 500);
  }
  
  // Отображение интерфейса
  render() {
    this.container.innerHTML = `
      <div class="weather-header">
        <h2>Погода</h2>
        <div class="weather-actions">
          <button class="weather-refresh-button">
            <span class="material-icons-round">refresh</span>
          </button>
          <button class="weather-settings-button">
            <span class="material-icons-round">settings</span>
          </button>
        </div>
      </div>
      
      <div class="weather-current">
        <div class="weather-location">${this.weatherData.location}</div>
        <div class="weather-icon">
          <span class="material-icons-round">${this.weatherData.icon}</span>
        </div>
        <div class="weather-temperature">${this.weatherData.temperature}°C</div>
        <div class="weather-condition">${this.weatherData.condition}</div>
      </div>
      
      <div class="weather-forecast">
        ${this.weatherData.forecast.map(day => `
          <div class="forecast-day">
            <div class="forecast-day-name">${day.day}</div>
            <div class="forecast-icon">
              <span class="material-icons-round">${day.icon}</span>
            </div>
            <div class="forecast-temp">${day.temp}°</div>
          </div>
        `).join('')}
      </div>
      
      <div class="weather-details">
        <div class="weather-detail-item">
          <span class="material-icons-round">water_drop</span>
          <span class="detail-label">Влажность</span>
          <span class="detail-value">65%</span>
        </div>
        <div class="weather-detail-item">
          <span class="material-icons-round">air</span>
          <span class="detail-label">Ветер</span>
          <span class="detail-value">5 м/с</span>
        </div>
        <div class="weather-detail-item">
          <span class="material-icons-round">visibility</span>
          <span class="detail-label">Видимость</span>
          <span class="detail-value">10 км</span>
        </div>
        <div class="weather-detail-item">
          <span class="material-icons-round">wb_twilight</span>
          <span class="detail-label">Закат</span>
          <span class="detail-value">18:42</span>
        </div>
      </div>
    `;
    
    // Добавляем обработчики событий
    const refreshButton = this.container.querySelector('.weather-refresh-button');
    refreshButton.addEventListener('click', () => {
      AnimationHelper.showToast('Обновление погоды будет доступно в следующем обновлении!');
    });
    
    const settingsButton = this.container.querySelector('.weather-settings-button');
    settingsButton.addEventListener('click', () => {
      AnimationHelper.showToast('Настройки погоды будут доступны в следующем обновлении!');
    });
  }
} 