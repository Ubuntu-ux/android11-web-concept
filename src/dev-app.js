// Development App Module for Android 11 Web

export default class DevApp {
  constructor() {
    this.container = null;
    this.appName = '';
  }

  // Initialize with container and app name
  init(container, appName = 'Приложение') {
    this.container = container;
    this.appName = appName;
    this.render();
    this.attachEventListeners();
  }

  // Render the development app UI
  render() {
    this.container.innerHTML = `
      <div class="app-under-development">
        <div class="dev-app-header">
          <span class="material-icons-round app-back">arrow_back</span>
          <span class="app-title">${this.appName}</span>
        </div>
        
        <div class="dev-app-content">
          <div class="dev-app-icon">
            <span class="material-icons-round">build</span>
          </div>
          <h2 class="dev-app-title">Приложение в разработке</h2>
          <p class="dev-app-message">Это приложение находится в разработке и пока недоступно.</p>
          <p class="dev-app-details">Мы работаем над улучшением Android 11 Web и добавляем новые функции. Пожалуйста, проверьте позже.</p>
          
          <div class="dev-app-actions">
            <button class="dev-app-button">Вернуться на главный экран</button>
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

    // Home button
    this.container.querySelector('.dev-app-button').addEventListener('click', () => {
      document.querySelector('.app-screen').classList.remove('visible');
    });
  }

  // Static method to show development app
  static showDevApp(appName) {
    const appScreen = document.querySelector('.app-screen');
    if (!appScreen) return;
    
    // Reset app screen
    appScreen.innerHTML = '';
    
    // Show app screen with animation
    appScreen.classList.add('visible');
    
    // Initialize development app
    const devApp = new DevApp();
    devApp.init(appScreen, appName);
    
    // Hide notification panel if open
    document.querySelector('.notification-panel')?.classList.remove('visible');
    
    // Add a toast notification
    DevApp.showToast('Приложение находится в разработке');
  }

  // Show a toast notification
  static showToast(message, duration = 3000) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      document.body.removeChild(existingToast);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    // Add to body
    document.body.appendChild(toast);
    
    // Remove after duration
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, duration);
  }
} 