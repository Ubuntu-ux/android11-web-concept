// Weather App for Android 11 Web
import { AppStorage } from '../utils.js';

export default class Weather {
  constructor() {
    this.container = null;
    this.weatherData = null;
    this.isLoading = false;
    this.error = null;
    this.apiKey = '4d8fb5b93d4af21d66a2948710284366'; // OpenWeatherMap free API key
    this.city = 'Москва';
  }

  // Initialize the weather app
  init(container) {
    this.container = container;
    this.loadSavedCity();
    this.render();
    this.fetchWeather();
    this.attachEventListeners();
  }

  // Load saved city from storage
  loadSavedCity() {
    const savedData = AppStorage.getAppData('weather');
    if (savedData && savedData.city) {
      this.city = savedData.city;
    }
  }

  // Save city to storage
  saveCity(city) {
    AppStorage.saveAppData('weather', { city: city });
  }

  // Render the weather UI
  render() {
    this.container.innerHTML = `
      <div class="weather-app">
        <div class="weather-header">
          <span class="material-icons-round app-back">arrow_back</span>
          <span class="app-title">Погода</span>
          <span class="material-icons-round refresh-weather">refresh</span>
        </div>
        
        <div class="city-search">
          <input type="text" class="city-input" placeholder="Введите город" value="${this.city}">
          <button class="search-button">Поиск</button>
        </div>
        
        <div class="weather-content">
          ${this.renderWeatherContent()}
        </div>
      </div>
    `;
  }

  // Render the weather content based on current state
  renderWeatherContent() {
    if (this.isLoading) {
      return `<div class="weather-loading">
        <span class="material-icons-round spin">refresh</span>
        <p>Загрузка погодных данных...</p>
      </div>`;
    }
    
    if (this.error) {
      return `<div class="weather-error">
        <span class="material-icons-round">error_outline</span>
        <p>${this.error}</p>
      </div>`;
    }
    
    if (!this.weatherData) {
      return `<div class="weather-empty">
        <span class="material-icons-round">cloud</span>
        <p>Нет данных о погоде</p>
      </div>`;
    }
    
    // Display weather data
    const weather = this.weatherData;
    const temp = Math.round(weather.main.temp);
    const feelsLike = Math.round(weather.main.feels_like);
    const description = weather.weather[0].description;
    const icon = weather.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    
    return `
      <div class="weather-data">
        <div class="weather-main">
          <div class="weather-city">${weather.name}</div>
          <div class="weather-temp">${temp}°C</div>
          <div class="weather-description">${this.capitalizeFirstLetter(description)}</div>
          <img class="weather-icon" src="${iconUrl}" alt="${description}">
        </div>
        
        <div class="weather-details">
          <div class="weather-detail">
            <span class="material-icons-round">thermostat</span>
            <span class="detail-label">Ощущается как</span>
            <span class="detail-value">${feelsLike}°C</span>
          </div>
          
          <div class="weather-detail">
            <span class="material-icons-round">water_drop</span>
            <span class="detail-label">Влажность</span>
            <span class="detail-value">${weather.main.humidity}%</span>
          </div>
          
          <div class="weather-detail">
            <span class="material-icons-round">air</span>
            <span class="detail-label">Ветер</span>
            <span class="detail-value">${Math.round(weather.wind.speed)} м/с</span>
          </div>
          
          <div class="weather-detail">
            <span class="material-icons-round">compress</span>
            <span class="detail-label">Давление</span>
            <span class="detail-value">${Math.round(weather.main.pressure * 0.750062)} мм рт.ст.</span>
          </div>
        </div>
      </div>
    `;
  }

  // Attach event listeners
  attachEventListeners() {
    // Back button
    this.container.querySelector('.app-back').addEventListener('click', () => {
      document.querySelector('.app-screen').classList.remove('visible');
    });

    // Refresh button
    this.container.querySelector('.refresh-weather').addEventListener('click', () => {
      this.fetchWeather();
    });

    // Search button
    this.container.querySelector('.search-button').addEventListener('click', () => {
      const cityInput = this.container.querySelector('.city-input');
      const newCity = cityInput.value.trim();
      if (newCity && newCity !== this.city) {
        this.city = newCity;
        this.saveCity(newCity);
        this.fetchWeather();
      }
    });

    // Enter key in search input
    this.container.querySelector('.city-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const newCity = e.target.value.trim();
        if (newCity && newCity !== this.city) {
          this.city = newCity;
          this.saveCity(newCity);
          this.fetchWeather();
        }
      }
    });
  }

  // Fetch weather data from API
  async fetchWeather() {
    this.isLoading = true;
    this.error = null;
    this.updateWeatherContent();
    
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${this.city}&appid=${this.apiKey}&units=metric&lang=ru`);
      
      if (!response.ok) {
        throw new Error(response.status === 404 ? 'Город не найден' : 'Ошибка при получении данных о погоде');
      }
      
      this.weatherData = await response.json();
      this.isLoading = false;
      this.updateWeatherContent();
    } catch (error) {
      this.isLoading = false;
      this.error = error.message || 'Произошла ошибка при получении погодных данных';
      this.updateWeatherContent();
    }
  }

  // Update only the weather content section
  updateWeatherContent() {
    const weatherContent = this.container.querySelector('.weather-content');
    if (weatherContent) {
      weatherContent.innerHTML = this.renderWeatherContent();
    }
  }

  // Helper function to capitalize first letter
  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
} 