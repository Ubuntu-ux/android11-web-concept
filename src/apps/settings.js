// Приложение настроек для Android 11 Web
import { SettingsManager } from '../settings-manager.js';
import { DOMUtils, FormatUtils } from '../utils.js';
import { AnimationHelper } from '../animations.js';

export class SettingsApp {
  constructor() {
    this.container = null;
    this.currentSection = null;
    this.currentSectionContent = null;
    this.backButton = null;
    this.sections = {
      main: {
        title: 'Настройки',
        render: () => this.renderMainMenu()
      },
      display: {
        title: 'Экран',
        render: () => this.renderDisplaySettings()
      },
      sound: {
        title: 'Звук',
        render: () => this.renderSoundSettings()
      },
      appearance: {
        title: 'Внешний вид',
        render: () => this.renderAppearanceSettings()
      },
      notifications: {
        title: 'Уведомления',
        render: () => this.renderNotificationSettings()
      },
      privacy: {
        title: 'Конфиденциальность',
        render: () => this.renderPrivacySettings()
      },
      apps: {
        title: 'Приложения',
        render: () => this.renderAppsSettings()
      },
      about: {
        title: 'О телефоне',
        render: () => this.renderAboutPhone()
      }
    };
  }

  // Инициализация приложения
  init(container) {
    this.container = container;
    this.container.classList.add('settings-app');
    this.container.innerHTML = '';
    
    this.header = DOMUtils.createElement('div', { className: 'settings-header' }, [
      this.backButton = DOMUtils.createElement('button', { 
        className: 'settings-back-button hidden',
        onclick: () => this.goBack()
      }, ['<']),
      this.titleElement = DOMUtils.createElement('h2', { className: 'settings-title' }, ['Настройки'])
    ]);
    
    this.container.appendChild(this.header);
    
    this.contentContainer = DOMUtils.createElement('div', { className: 'settings-content' });
    this.container.appendChild(this.contentContainer);
    
    // Создаем контейнер для секции
    this.currentSectionContent = DOMUtils.createElement('div', { className: 'settings-section-content' });
    this.contentContainer.appendChild(this.currentSectionContent);
    
    // Загружаем главное меню
    this.navigateTo('main');
    
    // Подписка на изменения настроек
    SettingsManager.subscribeToChanges(() => {
      // Перерисовываем текущую секцию при изменении настроек
      if (this.currentSection) {
        this.navigateTo(this.currentSection);
      }
    });
  }
  
  // Навигация к определенной секции
  navigateTo(sectionId, params = {}) {
    const section = this.sections[sectionId];
    if (!section) return;
    
    this.currentSection = sectionId;
    this.titleElement.textContent = section.title;
    
    // Показываем кнопку назад, если это не главное меню
    if (sectionId === 'main') {
      this.backButton.classList.add('hidden');
    } else {
      this.backButton.classList.remove('hidden');
    }
    
    // Анимируем переход
    this.currentSectionContent.classList.add('fade-out');
    
    setTimeout(() => {
      DOMUtils.clearElement(this.currentSectionContent);
      section.render(params);
      this.currentSectionContent.classList.remove('fade-out');
      this.currentSectionContent.classList.add('fade-in');
      
      setTimeout(() => {
        this.currentSectionContent.classList.remove('fade-in');
      }, 300);
    }, 150);
  }
  
  // Возврат на предыдущий экран
  goBack() {
    this.navigateTo('main');
  }
  
  // Создание элемента меню
  createMenuItem(icon, title, subtitle = '', onClick) {
    const item = DOMUtils.createElement('div', { className: 'settings-menu-item' });
    
    const iconElement = DOMUtils.createElement('div', { className: 'settings-menu-item-icon' }, [icon]);
    
    const textContainer = DOMUtils.createElement('div', { className: 'settings-menu-item-text' }, [
      DOMUtils.createElement('div', { className: 'settings-menu-item-title' }, [title])
    ]);
    
    if (subtitle) {
      textContainer.appendChild(
        DOMUtils.createElement('div', { className: 'settings-menu-item-subtitle' }, [subtitle])
      );
    }
    
    const arrowElement = DOMUtils.createElement('div', { className: 'settings-menu-item-arrow' }, ['›']);
    
    item.appendChild(iconElement);
    item.appendChild(textContainer);
    item.appendChild(arrowElement);
    
    if (onClick) {
      item.addEventListener('click', onClick);
    }
    
    return item;
  }
  
  // Создание элемента переключателя
  createToggleItem(icon, title, subtitle = '', settingPath) {
    const currentValue = SettingsManager.getSetting(settingPath);
    
    const item = DOMUtils.createElement('div', { className: 'settings-menu-item' });
    
    const iconElement = DOMUtils.createElement('div', { className: 'settings-menu-item-icon' }, [icon]);
    
    const textContainer = DOMUtils.createElement('div', { className: 'settings-menu-item-text' }, [
      DOMUtils.createElement('div', { className: 'settings-menu-item-title' }, [title])
    ]);
    
    if (subtitle) {
      textContainer.appendChild(
        DOMUtils.createElement('div', { className: 'settings-menu-item-subtitle' }, [subtitle])
      );
    }
    
    const toggleElement = DOMUtils.createElement('label', { className: 'settings-toggle' }, [
      DOMUtils.createElement('input', { 
        type: 'checkbox', 
        checked: currentValue ? 'checked' : '',
        onchange: (e) => {
          SettingsManager.setSetting(settingPath, e.target.checked);
          AnimationHelper.showToast(`${title} ${e.target.checked ? 'включено' : 'выключено'}`);
        }
      }),
      DOMUtils.createElement('span', { className: 'settings-toggle-slider' })
    ]);
    
    item.appendChild(iconElement);
    item.appendChild(textContainer);
    item.appendChild(toggleElement);
    
    return item;
  }
  
  // Создание элемента выбора значения
  createSelectItem(icon, title, subtitle = '', settingPath, options) {
    const currentValue = SettingsManager.getSetting(settingPath);
    
    const item = DOMUtils.createElement('div', { className: 'settings-menu-item' });
    
    const iconElement = DOMUtils.createElement('div', { className: 'settings-menu-item-icon' }, [icon]);
    
    const textContainer = DOMUtils.createElement('div', { className: 'settings-menu-item-text' }, [
      DOMUtils.createElement('div', { className: 'settings-menu-item-title' }, [title])
    ]);
    
    if (subtitle) {
      textContainer.appendChild(
        DOMUtils.createElement('div', { className: 'settings-menu-item-subtitle' }, [subtitle])
      );
    }
    
    const selectElement = DOMUtils.createElement('select', { 
      className: 'settings-select',
      onchange: (e) => {
        SettingsManager.setSetting(settingPath, e.target.value);
        AnimationHelper.showToast(`${title} изменено на ${options.find(o => o.value === e.target.value).label}`);
      }
    });
    
    options.forEach(option => {
      const optionElement = DOMUtils.createElement('option', { 
        value: option.value,
        selected: currentValue === option.value ? 'selected' : ''
      }, [option.label]);
      selectElement.appendChild(optionElement);
    });
    
    item.appendChild(iconElement);
    item.appendChild(textContainer);
    item.appendChild(selectElement);
    
    return item;
  }
  
  // Создание элемента с ползунком
  createSliderItem(icon, title, subtitle = '', settingPath, min = 0, max = 100, step = 1) {
    const currentValue = SettingsManager.getSetting(settingPath);
    
    const item = DOMUtils.createElement('div', { className: 'settings-menu-item settings-slider-item' });
    
    const iconElement = DOMUtils.createElement('div', { className: 'settings-menu-item-icon' }, [icon]);
    
    const textContainer = DOMUtils.createElement('div', { className: 'settings-menu-item-text' }, [
      DOMUtils.createElement('div', { className: 'settings-menu-item-title' }, [title])
    ]);
    
    if (subtitle) {
      textContainer.appendChild(
        DOMUtils.createElement('div', { className: 'settings-menu-item-subtitle' }, [subtitle])
      );
    }
    
    const sliderContainer = DOMUtils.createElement('div', { className: 'settings-slider-container' });
    
    const valueDisplay = DOMUtils.createElement('div', { className: 'settings-slider-value' }, [currentValue]);
    
    const sliderElement = DOMUtils.createElement('input', {
      type: 'range',
      className: 'settings-slider',
      min: min,
      max: max,
      step: step,
      value: currentValue,
      oninput: (e) => {
        valueDisplay.textContent = e.target.value;
        SettingsManager.setSetting(settingPath, parseInt(e.target.value, 10));
      },
      onchange: () => {
        AnimationHelper.showToast(`${title} установлено на ${valueDisplay.textContent}`);
      }
    });
    
    sliderContainer.appendChild(sliderElement);
    sliderContainer.appendChild(valueDisplay);
    
    item.appendChild(iconElement);
    item.appendChild(textContainer);
    item.appendChild(sliderContainer);
    
    return item;
  }
  
  // Создание заголовка раздела
  createSectionHeader(title) {
    return DOMUtils.createElement('div', { className: 'settings-section-header' }, [title]);
  }
  
  // Рендеринг главного меню
  renderMainMenu() {
    const menuItems = [
      this.createMenuItem('🖥️', 'Экран', 'Яркость, ночной режим, тайм-аут', () => this.navigateTo('display')),
      this.createMenuItem('🔊', 'Звук', 'Громкость, мелодии, вибрация', () => this.navigateTo('sound')),
      this.createMenuItem('🎨', 'Внешний вид', 'Шрифты, цвета, обои', () => this.navigateTo('appearance')),
      this.createMenuItem('🔔', 'Уведомления', 'Звуки, режим "Не беспокоить"', () => this.navigateTo('notifications')),
      this.createMenuItem('🔒', 'Конфиденциальность', 'Доступ к функциям телефона', () => this.navigateTo('privacy')),
      this.createMenuItem('📱', 'Приложения', 'Настройки для приложений', () => this.navigateTo('apps')),
      this.createMenuItem('ℹ️', 'О телефоне', 'Версия системы, сброс настроек', () => this.navigateTo('about'))
    ];
    
    const fragment = document.createDocumentFragment();
    
    // Добавляем все элементы меню
    menuItems.forEach(item => {
      fragment.appendChild(item);
    });
    
    this.currentSectionContent.appendChild(fragment);
  }
  
  // Рендеринг настроек экрана
  renderDisplaySettings() {
    const fragment = document.createDocumentFragment();
    
    // Добавляем заголовок и элементы настроек экрана
    fragment.appendChild(this.createSectionHeader('Яркость и подсветка'));
    fragment.appendChild(this.createSliderItem('☀️', 'Яркость', 'Уровень яркости экрана', 'display.brightness'));
    fragment.appendChild(this.createToggleItem('🌙', 'Ночной режим', 'Уменьшает нагрузку на глаза', 'display.nightMode'));
    fragment.appendChild(this.createSelectItem('⏱️', 'Тайм-аут экрана', 'Время до отключения экрана', 'display.timeout', [
      { value: '15', label: '15 секунд' },
      { value: '30', label: '30 секунд' },
      { value: '60', label: '1 минута' },
      { value: '120', label: '2 минуты' },
      { value: '300', label: '5 минут' },
    ]));
    
    fragment.appendChild(this.createSectionHeader('Дисплей'));
    fragment.appendChild(this.createToggleItem('🔄', 'Автоповорот', 'Автоматически поворачивать экран', 'display.autoRotate'));
    
    this.currentSectionContent.appendChild(fragment);
  }
  
  // Рендеринг настроек звука
  renderSoundSettings() {
    const fragment = document.createDocumentFragment();
    
    // Добавляем заголовок и элементы настроек звука
    fragment.appendChild(this.createSectionHeader('Громкость'));
    fragment.appendChild(this.createSliderItem('🔔', 'Громкость звонка', 'Для входящих вызовов', 'sound.ringtoneVolume'));
    fragment.appendChild(this.createSliderItem('🎵', 'Громкость медиа', 'Для музыки и видео', 'sound.mediaVolume'));
    fragment.appendChild(this.createSliderItem('⏰', 'Громкость будильника', 'Для будильников и таймеров', 'sound.alarmVolume'));
    fragment.appendChild(this.createSliderItem('📲', 'Громкость уведомлений', 'Для системных уведомлений', 'sound.notificationVolume'));
    
    fragment.appendChild(this.createSectionHeader('Режимы звука'));
    fragment.appendChild(this.createToggleItem('📳', 'Вибрация при звонке', 'Вибрировать при входящих вызовах', 'sound.vibrationOnRing'));
    fragment.appendChild(this.createToggleItem('🔕', 'Беззвучный режим', 'Отключить все звуки', 'sound.silentMode'));
    
    this.currentSectionContent.appendChild(fragment);
  }
  
  // Рендеринг настроек внешнего вида
  renderAppearanceSettings() {
    const fragment = document.createDocumentFragment();
    
    // Добавляем заголовок и элементы настроек внешнего вида
    fragment.appendChild(this.createSectionHeader('Тема'));
    fragment.appendChild(this.createToggleItem('🌙', 'Темная тема', 'Использовать темный интерфейс', 'darkMode'));
    
    fragment.appendChild(this.createSectionHeader('Шрифт'));
    fragment.appendChild(this.createSelectItem('🔤', 'Размер шрифта', 'Размер текста в интерфейсе', 'appearance.fontSize', [
      { value: 'small', label: 'Маленький' },
      { value: 'medium', label: 'Средний' },
      { value: 'large', label: 'Большой' }
    ]));
    
    fragment.appendChild(this.createSectionHeader('Обои'));
    fragment.appendChild(this.createSelectItem('🖼️', 'Обои', 'Фоновое изображение', 'appearance.wallpaper', [
      { value: 'default', label: 'По умолчанию' },
      { value: 'mountains', label: 'Горы' },
      { value: 'ocean', label: 'Океан' },
      { value: 'forest', label: 'Лес' },
      { value: 'space', label: 'Космос' }
    ]));
    
    fragment.appendChild(this.createSectionHeader('Анимации'));
    fragment.appendChild(this.createToggleItem('✨', 'Анимации', 'Использовать анимации интерфейса', 'appearance.animations'));
    
    this.currentSectionContent.appendChild(fragment);
  }
  
  // Рендеринг настроек уведомлений
  renderNotificationSettings() {
    const fragment = document.createDocumentFragment();
    
    // Добавляем заголовок и элементы настроек уведомлений
    fragment.appendChild(this.createSectionHeader('Основные настройки'));
    fragment.appendChild(this.createToggleItem('🔔', 'Уведомления', 'Разрешить уведомления', 'notifications.enabled'));
    fragment.appendChild(this.createToggleItem('🔊', 'Звуки уведомлений', 'Воспроизводить звуки для уведомлений', 'notifications.sound'));
    fragment.appendChild(this.createToggleItem('📳', 'Вибрация', 'Вибрировать при уведомлениях', 'notifications.vibration'));
    
    fragment.appendChild(this.createSectionHeader('Режим "Не беспокоить"'));
    fragment.appendChild(this.createToggleItem('🔕', 'Не беспокоить', 'Отключить звуки и вибрацию', 'notifications.doNotDisturb'));
    
    // Если режим "Не беспокоить" включен, показываем дополнительные настройки
    if (SettingsManager.getSetting('notifications.doNotDisturb')) {
      fragment.appendChild(this.createMenuItem('🕒', 'Расписание', 'Настроить время активации', () => {
        // Здесь можно добавить диалоговое окно для установки времени
        AnimationHelper.showToast('Расписание настроено');
      }));
    }
    
    this.currentSectionContent.appendChild(fragment);
  }
  
  // Рендеринг настроек конфиденциальности
  renderPrivacySettings() {
    const fragment = document.createDocumentFragment();
    
    // Добавляем заголовок и элементы настроек конфиденциальности
    fragment.appendChild(this.createSectionHeader('Доступ к функциям'));
    fragment.appendChild(this.createToggleItem('📍', 'Местоположение', 'Доступ к данным геолокации', 'privacy.locationEnabled'));
    fragment.appendChild(this.createToggleItem('📷', 'Камера', 'Доступ к камере устройства', 'privacy.cameraEnabled'));
    fragment.appendChild(this.createToggleItem('🎤', 'Микрофон', 'Доступ к микрофону устройства', 'privacy.microphoneEnabled'));
    
    fragment.appendChild(this.createSectionHeader('Безопасность'));
    fragment.appendChild(this.createSelectItem('🔒', 'Блокировка экрана', 'Метод разблокировки устройства', 'privacy.screenLock', [
      { value: 'none', label: 'Нет' },
      { value: 'pattern', label: 'Графический ключ' },
      { value: 'pin', label: 'PIN-код' }
    ]));
    fragment.appendChild(this.createToggleItem('👆', 'Биометрическая аутентификация', 'Использовать отпечаток пальца', 'privacy.biometricAuth'));
    
    this.currentSectionContent.appendChild(fragment);
  }
  
  // Рендеринг настроек приложений
  renderAppsSettings() {
    const fragment = document.createDocumentFragment();
    
    // Добавляем заголовок и элементы настроек приложений
    fragment.appendChild(this.createSectionHeader('Приложения'));
    fragment.appendChild(this.createMenuItem('🧮', 'Калькулятор', 'Настройки калькулятора', () => {
      this.navigateTo('calculator-settings');
    }));
    fragment.appendChild(this.createMenuItem('📝', 'Заметки', 'Настройки заметок', () => {
      this.navigateTo('notes-settings');
    }));
    fragment.appendChild(this.createMenuItem('⛅', 'Погода', 'Настройки погоды', () => {
      this.navigateTo('weather-settings');
    }));
    fragment.appendChild(this.createMenuItem('📅', 'Календарь', 'Настройки календаря', () => {
      this.navigateTo('calendar-settings');
    }));
    
    this.currentSectionContent.appendChild(fragment);
  }
  
  // Рендеринг информации о телефоне
  renderAboutPhone() {
    const fragment = document.createDocumentFragment();
    
    // Добавляем заголовок и элементы с информацией о телефоне
    fragment.appendChild(this.createSectionHeader('Системная информация'));
    fragment.appendChild(this.createMenuItem('🔢', 'Версия Android', 'Android 11 Web Edition', null));
    fragment.appendChild(this.createMenuItem('🔄', 'Обновления', 'Проверить наличие обновлений', () => {
      AnimationHelper.showToast('Это последняя версия');
    }));
    
    fragment.appendChild(this.createSectionHeader('Управление данными'));
    fragment.appendChild(this.createMenuItem('💾', 'Резервное копирование', 'Экспорт настроек', () => {
      const jsonData = SettingsManager.exportSettings();
      // Здесь можно реализовать сохранение настроек
      AnimationHelper.showToast('Настройки экспортированы');
    }));
    fragment.appendChild(this.createMenuItem('📥', 'Восстановление', 'Импорт настроек', () => {
      // Здесь можно реализовать загрузку настроек
      AnimationHelper.showToast('Настройки восстановлены');
    }));
    fragment.appendChild(this.createMenuItem('🔄', 'Сброс настроек', 'Вернуть настройки по умолчанию', () => {
      if (confirm('Вы уверены, что хотите сбросить все настройки до значений по умолчанию?')) {
        SettingsManager.resetAllSettings();
        AnimationHelper.showToast('Настройки сброшены');
      }
    }));
    
    this.currentSectionContent.appendChild(fragment);
  }
} 