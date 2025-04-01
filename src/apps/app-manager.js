// App Manager for Android 11 Web
import Calculator from './calculator.js';
import Notes from './notes.js';
import Weather from './weather.js';

export default class AppManager {
  constructor() {
    this.apps = {
      calculator: new Calculator(),
      notes: new Notes(),
      weather: new Weather()
    };
    
    this.appScreen = null;
    this.currentApp = null;
    
    this.init();
  }
  
  // Initialize the App Manager
  init() {
    // Create app screen container if it doesn't exist
    if (!document.querySelector('.app-screen')) {
      this.createAppScreen();
    } else {
      this.appScreen = document.querySelector('.app-screen');
    }
    
    // Add event listeners for app launching
    this.setupAppLaunchers();
  }
  
  // Create the app screen container
  createAppScreen() {
    this.appScreen = document.createElement('div');
    this.appScreen.className = 'app-screen';
    document.querySelector('.android-phone').appendChild(this.appScreen);
  }
  
  // Setup app launcher event listeners
  setupAppLaunchers() {
    // Calculator
    document.querySelectorAll('#calculator, #calculator-dock').forEach(element => {
      if (element) {
        element.parentElement.addEventListener('click', () => this.launchApp('calculator'));
      }
    });
    
    // Notes
    document.querySelectorAll('#notes, #notes-dock').forEach(element => {
      if (element) {
        element.parentElement.addEventListener('click', () => this.launchApp('notes'));
      }
    });
    
    // Weather
    document.querySelectorAll('#weather, #weather-dock').forEach(element => {
      if (element) {
        element.parentElement.addEventListener('click', () => this.launchApp('weather'));
      }
    });
  }
  
  // Launch an app
  launchApp(appId) {
    if (!this.apps[appId]) {
      console.error(`App ${appId} not found`);
      return;
    }
    
    // Reset app screen
    this.appScreen.innerHTML = '';
    
    // Show app screen with animation
    this.appScreen.classList.add('visible');
    
    // Set current app
    this.currentApp = appId;
    
    // Initialize app
    this.apps[appId].init(this.appScreen);
    
    // Hide notification panel if open
    document.querySelector('.notification-panel')?.classList.remove('visible');
  }
  
  // Close current app
  closeCurrentApp() {
    if (this.appScreen) {
      this.appScreen.classList.remove('visible');
      this.currentApp = null;
    }
  }
  
  // Get currently running app
  getCurrentApp() {
    return this.currentApp ? this.apps[this.currentApp] : null;
  }
  
  // Check if an app is running
  isAppRunning() {
    return this.currentApp !== null;
  }
  
  // Add a new app to the manager
  registerApp(appId, appInstance) {
    this.apps[appId] = appInstance;
  }
} 