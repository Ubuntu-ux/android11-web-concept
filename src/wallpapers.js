// Wallpaper Manager for Android 11 Web
import { SettingsManager } from './settings-manager.js';

export default class WallpaperManager {
  constructor() {
    this.wallpapers = {
      'default': {
        name: 'Android 11 по умолчанию',
        light: 'url("https://4.bp.blogspot.com/-k4Vd3Ls4iwI/XvCpRJ7Y9-I/AAAAAAAAB4U/gJN9-47-KGMsWEFN6SR9GU_QCaCYzDBLQCK4BGAYYCw/s1600/android%2B11%2Bwallpaper%2B3.png")',
        dark: 'url("https://1.bp.blogspot.com/-V4Dbm9Z_Sss/XvCpKl-b0SI/AAAAAAAAB4M/wKoUCy1DkWAejwGo-f1-q4eWB3yqRV6fQCK4BGAYYCw/s1600/android%2B11%2Bwallpaper%2B2.png")'
      },
      'landscape': {
        name: 'Пейзаж',
        light: 'url("https://images.pexels.com/photos/1612353/pexels-photo-1612353.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")',
        dark: 'url("https://images.pexels.com/photos/631477/pexels-photo-631477.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")'
      },
      'abstract': {
        name: 'Абстракция',
        light: 'url("https://images.pexels.com/photos/2693212/pexels-photo-2693212.png?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")',
        dark: 'url("https://images.pexels.com/photos/3109807/pexels-photo-3109807.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")'
      },
      'solid': {
        name: 'Однотонный',
        light: 'linear-gradient(to bottom right, #e0f7fa, #80deea)',
        dark: 'linear-gradient(to bottom right, #263238, #0d47a1)'
      }
    };
    
    this.currentWallpaper = 'default';
  }
  
  // Initialize wallpaper manager
  init() {
    // Load saved wallpaper
    this.loadSavedWallpaper();
    
    // Apply current wallpaper
    this.applyWallpaper();
    
    // Add long press handler for wallpaper change
    this.addWallpaperChangeHandler();
  }
  
  // Load saved wallpaper from settings
  loadSavedWallpaper() {
    const settings = SettingsManager.getSettings();
    if (settings.wallpaper && this.wallpapers[settings.wallpaper]) {
      this.currentWallpaper = settings.wallpaper;
    }
  }
  
  // Save current wallpaper to settings
  saveWallpaper() {
    SettingsManager.setSetting('wallpaper', this.currentWallpaper);
  }
  
  // Apply current wallpaper
  applyWallpaper() {
    const homeScreen = document.querySelector('.home-screen');
    if (!homeScreen) return;
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    const wallpaper = this.wallpapers[this.currentWallpaper];
    
    if (wallpaper) {
      const backgroundImage = isDarkMode ? wallpaper.dark : wallpaper.light;
      homeScreen.style.backgroundImage = backgroundImage;
    }
  }
  
  // Add handler for long press to change wallpaper
  addWallpaperChangeHandler() {
    // Get the home screen element
    const homeScreen = document.querySelector('.home-screen');
    if (!homeScreen) return;
    
    // Long press event handler
    homeScreen.addEventListener('long-press', (event) => {
      // Only trigger if pressed on empty area (not on app icon, dock, or navigation)
      if (!event.target.closest('.app-icon') && 
          !event.target.closest('.dock') && 
          !event.target.closest('.navigation-bar') &&
          !event.target.closest('.widget-container')) {
        this.showWallpaperMenu();
      }
    });
  }
  
  // Show wallpaper selection menu
  showWallpaperMenu() {
    // Create wallpaper menu
    const wallpaperMenu = document.createElement('div');
    wallpaperMenu.className = 'wallpaper-menu';
    
    // Add title
    const titleElement = document.createElement('div');
    titleElement.className = 'wallpaper-menu-title';
    titleElement.textContent = 'Выберите обои';
    wallpaperMenu.appendChild(titleElement);
    
    // Add wallpaper options
    const wallpaperGrid = document.createElement('div');
    wallpaperGrid.className = 'wallpaper-grid';
    
    // Add each wallpaper option
    Object.entries(this.wallpapers).forEach(([id, wallpaper]) => {
      const option = document.createElement('div');
      option.className = `wallpaper-option ${id === this.currentWallpaper ? 'selected' : ''}`;
      option.dataset.wallpaperId = id;
      
      // Wallpaper preview
      const preview = document.createElement('div');
      preview.className = 'wallpaper-preview';
      preview.style.backgroundImage = document.body.classList.contains('dark-mode') ? 
        wallpaper.dark : wallpaper.light;
      
      // Wallpaper name
      const name = document.createElement('div');
      name.className = 'wallpaper-name';
      name.textContent = wallpaper.name;
      
      option.appendChild(preview);
      option.appendChild(name);
      
      // Add click handler
      option.addEventListener('click', () => {
        this.setWallpaper(id);
        document.body.removeChild(wallpaperMenu);
      });
      
      wallpaperGrid.appendChild(option);
    });
    
    wallpaperMenu.appendChild(wallpaperGrid);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'wallpaper-menu-close';
    closeButton.textContent = 'Отмена';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(wallpaperMenu);
    });
    
    wallpaperMenu.appendChild(closeButton);
    
    // Add to body
    document.body.appendChild(wallpaperMenu);
  }
  
  // Set wallpaper
  setWallpaper(wallpaperId) {
    if (!this.wallpapers[wallpaperId]) return;
    
    this.currentWallpaper = wallpaperId;
    this.saveWallpaper();
    this.applyWallpaper();
  }
  
  // Update wallpaper when dark mode changes
  updateForDarkMode(isDarkMode) {
    this.applyWallpaper();
  }
} 