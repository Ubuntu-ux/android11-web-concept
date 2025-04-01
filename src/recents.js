// Recent Apps Module for Android 11 Web

export default class RecentsManager {
  constructor() {
    this.container = null;
    this.recentApps = [];
    this.isVisible = false;
    this.maxRecents = 5; // Maximum number of recent apps to store
  }

  // Initialize recents manager
  init() {
    this.createRecentScreen();
    this.loadRecentApps();
    this.attachEventListeners();
  }

  // Create recents screen container
  createRecentScreen() {
    // Check if recents screen already exists
    if (document.querySelector('.recents-screen')) {
      this.container = document.querySelector('.recents-screen');
      return;
    }
    
    // Create recents screen
    this.container = document.createElement('div');
    this.container.className = 'recents-screen';
    
    // Add swipe indicator
    const swipeIndicator = document.createElement('div');
    swipeIndicator.className = 'swipe-indicator';
    this.container.appendChild(swipeIndicator);
    
    // Add to body
    document.querySelector('.android-phone').appendChild(this.container);
  }

  // Load recent apps from storage
  loadRecentApps() {
    const stored = localStorage.getItem('recentApps');
    if (stored) {
      try {
        this.recentApps = JSON.parse(stored);
      } catch (e) {
        console.error('Error loading recent apps:', e);
        this.recentApps = [];
      }
    }
  }

  // Save recent apps to storage
  saveRecentApps() {
    try {
      localStorage.setItem('recentApps', JSON.stringify(this.recentApps));
    } catch (e) {
      console.error('Error saving recent apps:', e);
    }
  }

  // Add app to recents
  addAppToRecents(appId, appName, iconName) {
    // Remove app if already in recents
    this.recentApps = this.recentApps.filter(app => app.id !== appId);
    
    // Add to front of array
    this.recentApps.unshift({
      id: appId,
      name: appName,
      icon: iconName,
      timestamp: Date.now()
    });
    
    // Limit number of recent apps
    if (this.recentApps.length > this.maxRecents) {
      this.recentApps = this.recentApps.slice(0, this.maxRecents);
    }
    
    // Save to storage
    this.saveRecentApps();
  }

  // Show recents screen
  showRecents() {
    if (this.isVisible) return;
    
    this.renderRecentApps();
    this.container.classList.add('visible');
    document.body.classList.add('blur-background');
    this.isVisible = true;
    
    // Hide notification panel if open
    document.querySelector('.notification-panel')?.classList.remove('visible');
  }

  // Hide recents screen
  hideRecents() {
    if (!this.isVisible) return;
    
    this.container.classList.remove('visible');
    document.body.classList.remove('blur-background');
    this.isVisible = false;
  }

  // Render recent apps
  renderRecentApps() {
    let html = '<div class="recents-header">';
    html += '<span class="recents-title">Недавние приложения</span>';
    html += '<span class="recents-close material-icons-round">close</span>';
    html += '<span class="recents-clear material-icons-round">delete_sweep</span>';
    html += '</div>';
    
    html += '<div class="recents-content">';
    
    if (this.recentApps.length === 0) {
      html += '<div class="no-recents">';
      html += '<span class="material-icons-round">history</span>';
      html += '<p>Нет недавних приложений</p>';
      html += '</div>';
    } else {
      html += '<div class="app-cards">';
      
      this.recentApps.forEach((app, index) => {
        const stackClass = index === 0 ? '' : index === 1 ? 'stack-1' : 'stack-2';
        html += `<div class="app-card ${stackClass}" data-app-id="${app.id}">`;
        html += '<div class="app-card-header">';
        html += `<span class="app-card-title">${app.name}</span>`;
        html += `<span class="app-card-close material-icons-round" data-app-id="${app.id}">close</span>`;
        html += '</div>';
        
        html += '<div class="app-card-content">';
        html += `<div class="app-card-icon"><span class="material-icons-round">${app.icon}</span></div>`;
        
        // Format timestamp
        const date = new Date(app.timestamp);
        const timeString = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        html += `<div class="app-card-time">${timeString}</div>`;
        html += '</div>';
        html += '</div>';
      });
      
      html += '</div>';
    }
    
    html += '</div>';
    
    this.container.innerHTML = html;
    this.attachCardEventListeners();
  }

  // Attach event listeners
  attachEventListeners() {
    // Global event for back button
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hideRecents();
      }
    });
    
    // Close on tap outside
    document.addEventListener('click', (e) => {
      if (this.isVisible && !this.container.contains(e.target) && 
          !e.target.classList.contains('nav-button-recents')) {
        this.hideRecents();
      }
    });
  }

  // Attach event listeners to app cards
  attachCardEventListeners() {
    if (!this.container) return;
    
    // Close recents button
    const closeButton = this.container.querySelector('.recents-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.hideRecents());
    }
    
    // Clear all recents button
    const clearButton = this.container.querySelector('.recents-clear');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        this.recentApps = [];
        this.saveRecentApps();
        this.renderRecentApps();
      });
    }
    
    // Individual app card close buttons
    const cardCloseButtons = this.container.querySelectorAll('.app-card-close');
    cardCloseButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const appId = button.getAttribute('data-app-id');
        this.recentApps = this.recentApps.filter(app => app.id !== appId);
        this.saveRecentApps();
        this.renderRecentApps();
      });
    });
    
    // App card clicks
    const appCards = this.container.querySelectorAll('.app-card');
    appCards.forEach(card => {
      card.addEventListener('click', () => {
        const appId = card.getAttribute('data-app-id');
        this.launchAppFromRecents(appId);
      });
    });
  }

  // Launch app from recents
  launchAppFromRecents(appId) {
    this.hideRecents();
    
    // Find app in recents
    const app = this.recentApps.find(a => a.id === appId);
    if (!app) return;
    
    // Launch app using app manager if available
    if (window.appManager) {
      if (['calculator', 'notes', 'weather'].includes(appId)) {
        window.appManager.launchApp(appId);
      } else {
        // Show development app for other apps
        const devAppModule = import('./dev-app.js')
          .then(module => {
            const DevApp = module.default;
            DevApp.showDevApp(app.name);
          })
          .catch(err => console.error('Error loading dev app module:', err));
      }
    }
  }

  // Toggle recents screen
  toggleRecents() {
    if (this.isVisible) {
      this.hideRecents();
    } else {
      this.showRecents();
    }
  }
} 