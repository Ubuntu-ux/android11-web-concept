// Animations and Visual Effects for Android 11 Web

// Ripple Effect Handler
export class RippleEffect {
  constructor() {
    this.attachRippleEffect();
  }

  // Attach ripple effect to interactive elements
  attachRippleEffect() {
    const interactiveElements = document.querySelectorAll('.nav-button, .app-icon, .quick-toggle, .settings-item, .btn, .language-item, .dev-app-button');
    
    interactiveElements.forEach(element => {
      element.addEventListener('mousedown', this.createRipple);
      element.addEventListener('touchstart', this.createRipple, { passive: true });
    });
    
    // For dynamically added elements, use event delegation
    document.addEventListener('mousedown', (e) => {
      if (e.target && e.target.closest('.nav-button, .app-icon, .quick-toggle, .settings-item, .btn, .language-item, .dev-app-button, .app-card, .recents-close, .recents-clear, .app-card-close')) {
        this.createRipple(e);
      }
    });
    
    document.addEventListener('touchstart', (e) => {
      if (e.target && e.target.closest('.nav-button, .app-icon, .quick-toggle, .settings-item, .btn, .language-item, .dev-app-button, .app-card, .recents-close, .recents-clear, .app-card-close')) {
        this.createRipple(e);
      }
    }, { passive: true });
  }

  // Create ripple effect
  createRipple(event) {
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
    
    // Show swipe indicator on swipe down from status bar
    document.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
      
      // Only for touches near the top of the screen
      if (touchStartY < 50) {
        document.body.classList.add('swipe-active');
      }
    });
    
    document.addEventListener('touchmove', (e) => {
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
    });
    
    document.addEventListener('touchend', () => {
      document.body.classList.remove('swipe-active');
      swipeIndicator.style.opacity = 0;
    });
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
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize ripple effect
  const rippleEffect = new RippleEffect();
  
  // Initialize animation helper
  const animationHelper = new AnimationHelper();
  
  // Make animation helper globally available
  window.AnimationHelper = AnimationHelper;
}); 