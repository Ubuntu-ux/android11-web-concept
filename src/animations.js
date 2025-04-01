// Animations and Visual Effects for Android 11 Web

// Ripple Effect Handler
export class RippleEffect {
  constructor() {
    this.attachRippleEffect();
  }

  // Attach ripple effect to interactive elements
  attachRippleEffect() {
    // Для элементов, которые уже существуют при загрузке страницы
    const interactiveElements = document.querySelectorAll('.nav-button, .app-icon, .quick-toggle, .settings-item, .btn, .language-item, .dev-app-button');
    
    interactiveElements.forEach(element => {
      // Удаляем старые обработчики, чтобы избежать дублирования
      element.removeEventListener('mousedown', this.createRipple);
      element.removeEventListener('touchstart', this.createRipple);
      
      // Добавляем новые обработчики
      element.addEventListener('mousedown', this.createRipple, { once: true });
      element.addEventListener('touchstart', this.createRipple, { passive: true, once: true });
    });
    
    // Удаляем старые глобальные обработчики
    document.removeEventListener('mousedown', this._delegatedMousedownHandler);
    document.removeEventListener('touchstart', this._delegatedTouchstartHandler);
    
    // Создаем новые функции-обработчики с привязкой к this
    this._delegatedMousedownHandler = (e) => {
      if (e.target && e.target.closest('.nav-button, .app-icon, .quick-toggle, .settings-item, .btn, .language-item, .dev-app-button, .app-card, .recents-close, .recents-clear, .app-card-close')) {
        this.createRipple(e);
      }
    };
    
    this._delegatedTouchstartHandler = (e) => {
      if (e.target && e.target.closest('.nav-button, .app-icon, .quick-toggle, .settings-item, .btn, .language-item, .dev-app-button, .app-card, .recents-close, .recents-clear, .app-card-close')) {
        this.createRipple(e);
      }
    };
    
    // Добавляем новые глобальные обработчики
    document.addEventListener('mousedown', this._delegatedMousedownHandler);
    document.addEventListener('touchstart', this._delegatedTouchstartHandler, { passive: true });
  }

  // Create ripple effect
  createRipple(event) {
    // Предотвращаем обработку события дважды
    if (event.rippleProcessed) return;
    event.rippleProcessed = true;
    
    // Find the target element (the closest interactive element)
    const targetElement = event.target.closest('.nav-button, .app-icon, .quick-toggle, .settings-item, .btn, .language-item, .dev-app-button, .app-card, .recents-close, .recents-clear, .app-card-close');
    if (!targetElement) return;
    
    // Ensure the element has position relative
    if (getComputedStyle(targetElement).position === 'static') {
      targetElement.style.position = 'relative';
    }
    
    // Create ripple element
    const circle = document.createElement('span');
    const diameter = Math.max(targetElement.clientWidth, targetElement.clientHeight);
    const radius = diameter / 2;
    
    // Get the position for the ripple
    const rect = targetElement.getBoundingClientRect();
    
    // Get client position
    let clientX, clientY;
    if (event.type === 'touchstart') {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    // Calculate position
    const left = clientX - rect.left - radius;
    const top = clientY - rect.top - radius;
    
    // Set ripple styling
    circle.className = 'ripple';
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${left}px`;
    circle.style.top = `${top}px`;
    
    // Apply color based on dark mode
    if (document.body.classList.contains('dark-mode')) {
      circle.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    } else {
      circle.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    }
    
    // Remove any existing ripples
    const existingRipple = targetElement.querySelector('.ripple');
    if (existingRipple) {
      existingRipple.remove();
    }
    
    // Add ripple to element
    targetElement.appendChild(circle);
    
    // Remove ripple after animation completes
    setTimeout(() => {
      if (circle && circle.parentNode) {
        circle.parentNode.removeChild(circle);
      }
    }, 600);
  }
}

// Animation Helper
export class AnimationHelper {
  constructor() {
    this.initSwipeIndicator();
    this.setupPageTransitions();
  }

  // Initialize swipe indicator
  initSwipeIndicator() {
    const swipeIndicator = document.querySelector('.swipe-indicator');
    if (!swipeIndicator) return;
    
    let touchStartY = 0;
    
    // Remove existing event listeners to avoid duplicates
    document.removeEventListener('touchstart', this._touchStartHandler);
    document.removeEventListener('touchmove', this._touchMoveHandler);
    document.removeEventListener('touchend', this._touchEndHandler);
    
    // Create bound event handlers
    this._touchStartHandler = (e) => {
      touchStartY = e.touches[0].clientY;
      
      // Only for touches near the top of the screen
      if (touchStartY < 50) {
        document.body.classList.add('swipe-active');
      }
    };
    
    this._touchMoveHandler = (e) => {
      if (touchStartY < 50) {
        const touchMoveY = e.touches[0].clientY;
        const distance = touchMoveY - touchStartY;
        
        if (distance > 30) {
          // Adjust opacity based on distance
          swipeIndicator.style.opacity = Math.min(distance / 100, 1);
        } else {
          swipeIndicator.style.opacity = 0;
        }
      }
    };
    
    this._touchEndHandler = () => {
      document.body.classList.remove('swipe-active');
      swipeIndicator.style.opacity = 0;
    };
    
    // Add event listeners
    document.addEventListener('touchstart', this._touchStartHandler, { passive: true });
    document.addEventListener('touchmove', this._touchMoveHandler, { passive: true });
    document.addEventListener('touchend', this._touchEndHandler, { passive: true });
  }

  // Setup page transitions
  setupPageTransitions() {
    // Add page transition class to screens
    document.querySelectorAll('.settings-screen, .about-phone-screen, .language-screen').forEach(element => {
      element.classList.add('page-transition');
    });
  }

  // Add toast notification
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
  
  // Safe click handler to prevent double/ghost clicks
  static safeClickHandler(element, handler, delay = 300) {
    let lastClickTime = 0;
    
    // Remove existing click handlers to avoid duplicates
    const oldClickHandler = element._safeClickHandler;
    if (oldClickHandler) {
      element.removeEventListener('click', oldClickHandler);
    }
    
    // Create a new handler with debounce
    const newHandler = (event) => {
      const now = new Date().getTime();
      if (now - lastClickTime > delay) {
        lastClickTime = now;
        handler(event);
      }
    };
    
    // Store reference to the handler for later removal
    element._safeClickHandler = newHandler;
    
    // Add new click handler
    element.addEventListener('click', newHandler);
    
    return newHandler;
  }
}

// Initialize when document is loaded - but make sure it only runs once
if (!window._animationsInitialized) {
  window._animationsInitialized = true;
  
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize ripple effect
    const rippleEffect = new RippleEffect();
    
    // Initialize animation helper
    const animationHelper = new AnimationHelper();
    
    // Make animation helper globally available
    window.AnimationHelper = AnimationHelper;
    window.RippleEffect = RippleEffect;
    
    console.log('Animation effects initialized');
  });
} 