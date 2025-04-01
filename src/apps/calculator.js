// Приложение калькулятора для Android 11 Web
import { SettingsManager } from '../settings-manager.js';
import { DOMUtils } from '../utils.js';
import { AnimationHelper } from '../animations.js';

export class CalculatorApp {
  constructor() {
    this.container = null;
    this.display = null;
    this.result = null;
    this.currentInput = '';
    this.lastResult = null;
    this.operator = null;
    this.hasDecimal = false;
    this.waitingForOperand = false;
    this.history = [];
    this.scientificMode = false;
  }

  // Инициализация приложения
  init(container) {
    this.container = container;
    this.container.classList.add('calculator-app');
    this.container.innerHTML = '';
    
    // Получаем настройки для калькулятора
    this.decimalPlaces = SettingsManager.getSetting('apps.calculator.decimalPlaces') || 2;
    this.scientificMode = SettingsManager.getSetting('apps.calculator.scientificMode') || false;
    this.historyEnabled = SettingsManager.getSetting('apps.calculator.historyEnabled') || true;
    
    this.render();
    this.attachEventListeners();
    
    // Загружаем историю, если она включена
    if (this.historyEnabled) {
      this.loadHistory();
    }
  }
  
  // Рендеринг интерфейса калькулятора
  render() {
    // Создаем основные компоненты интерфейса
    const header = DOMUtils.createElement('div', { className: 'calculator-header' }, [
      DOMUtils.createElement('h2', {}, ['Калькулятор']),
      DOMUtils.createElement('button', { 
        className: 'calculator-mode-toggle',
        onclick: () => this.toggleMode()
      }, [this.scientificMode ? 'Обычный' : 'Инженерный'])
    ]);
    
    // Дисплей калькулятора
    this.display = DOMUtils.createElement('div', { className: 'calculator-display' }, [
      this.expressionDisplay = DOMUtils.createElement('div', { className: 'calculator-expression' }, ['0']),
      this.result = DOMUtils.createElement('div', { className: 'calculator-result' }, [''])
    ]);
    
    // Кнопки калькулятора
    const buttonsContainer = DOMUtils.createElement('div', { className: 'calculator-buttons' });
    
    // Стандартные кнопки
    const standardButtons = [
      { value: 'C', type: 'action', onClick: () => this.clearAll() },
      { value: '±', type: 'action', onClick: () => this.toggleSign() },
      { value: '%', type: 'action', onClick: () => this.percentage() },
      { value: '÷', type: 'operator', onClick: () => this.setOperator('/') },
      
      { value: '7', type: 'digit', onClick: () => this.appendDigit('7') },
      { value: '8', type: 'digit', onClick: () => this.appendDigit('8') },
      { value: '9', type: 'digit', onClick: () => this.appendDigit('9') },
      { value: '×', type: 'operator', onClick: () => this.setOperator('*') },
      
      { value: '4', type: 'digit', onClick: () => this.appendDigit('4') },
      { value: '5', type: 'digit', onClick: () => this.appendDigit('5') },
      { value: '6', type: 'digit', onClick: () => this.appendDigit('6') },
      { value: '-', type: 'operator', onClick: () => this.setOperator('-') },
      
      { value: '1', type: 'digit', onClick: () => this.appendDigit('1') },
      { value: '2', type: 'digit', onClick: () => this.appendDigit('2') },
      { value: '3', type: 'digit', onClick: () => this.appendDigit('3') },
      { value: '+', type: 'operator', onClick: () => this.setOperator('+') },
      
      { value: '0', type: 'digit', onClick: () => this.appendDigit('0') },
      { value: '.', type: 'digit', onClick: () => this.appendDecimal() },
      { value: '⌫', type: 'action', onClick: () => this.backspace() },
      { value: '=', type: 'equals', onClick: () => this.calculate() }
    ];
    
    // Инженерные кнопки
    const scientificButtons = [
      { value: 'sin', type: 'function', onClick: () => this.applyFunction('sin') },
      { value: 'cos', type: 'function', onClick: () => this.applyFunction('cos') },
      { value: 'tan', type: 'function', onClick: () => this.applyFunction('tan') },
      { value: 'x²', type: 'function', onClick: () => this.applyFunction('square') },
      { value: '√', type: 'function', onClick: () => this.applyFunction('sqrt') },
      { value: 'π', type: 'constant', onClick: () => this.appendConstant('pi') },
      { value: 'e', type: 'constant', onClick: () => this.appendConstant('e') },
      { value: 'log', type: 'function', onClick: () => this.applyFunction('log') },
      { value: 'ln', type: 'function', onClick: () => this.applyFunction('ln') },
      { value: 'x^y', type: 'operator', onClick: () => this.setOperator('^') },
    ];
    
    // Добавляем кнопки
    standardButtons.forEach(button => {
      const btn = DOMUtils.createElement('button', { 
        className: `calculator-button calculator-button-${button.type}`,
        onclick: button.onClick
      }, [button.value]);
      buttonsContainer.appendChild(btn);
    });
    
    // Создаем контейнер для истории
    const historyContainer = DOMUtils.createElement('div', { 
      className: 'calculator-history' + (this.historyEnabled ? '' : ' hidden')
    }, [
      DOMUtils.createElement('h3', {}, ['История']),
      this.historyList = DOMUtils.createElement('div', { className: 'calculator-history-list' })
    ]);
    
    // Добавляем все элементы в контейнер
    this.container.appendChild(header);
    this.container.appendChild(this.display);
    
    if (this.scientificMode) {
      const scientificButtonsContainer = DOMUtils.createElement('div', { className: 'calculator-scientific-buttons' });
      
      scientificButtons.forEach(button => {
        const btn = DOMUtils.createElement('button', { 
          className: `calculator-button calculator-button-${button.type}`,
          onclick: button.onClick
        }, [button.value]);
        scientificButtonsContainer.appendChild(btn);
      });
      
      this.container.appendChild(scientificButtonsContainer);
    }
    
    this.container.appendChild(buttonsContainer);
    this.container.appendChild(historyContainer);
    
    // Обновляем содержимое
    this.updateDisplay();
  }
  
  // Прикрепляем обработчики событий для клавиатуры
  attachEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (!this.container.classList.contains('active')) return;
      
      if (e.key >= '0' && e.key <= '9') {
        this.appendDigit(e.key);
      } else if (e.key === '.') {
        this.appendDecimal();
      } else if (e.key === '+') {
        this.setOperator('+');
      } else if (e.key === '-') {
        this.setOperator('-');
      } else if (e.key === '*') {
        this.setOperator('*');
      } else if (e.key === '/') {
        this.setOperator('/');
      } else if (e.key === '=' || e.key === 'Enter') {
        this.calculate();
      } else if (e.key === 'Backspace') {
        this.backspace();
      } else if (e.key === 'Escape') {
        this.clearAll();
      } else if (e.key === '%') {
        this.percentage();
      }
    });
  }
  
  // Обновление отображения
  updateDisplay() {
    if (this.currentInput === '') {
      this.expressionDisplay.textContent = '0';
    } else {
      this.expressionDisplay.textContent = this.currentInput;
    }
    
    if (this.lastResult !== null) {
      this.result.textContent = '= ' + this.formatNumber(this.lastResult);
    } else {
      this.result.textContent = '';
    }
  }
  
  // Добавление цифры
  appendDigit(digit) {
    if (this.waitingForOperand) {
      this.currentInput = '';
      this.waitingForOperand = false;
      this.hasDecimal = false;
    }
    
    // Не допускаем начало с нуля (кроме десятичных)
    if (this.currentInput === '0' && digit !== '0' && !this.hasDecimal) {
      this.currentInput = digit;
    } else if (this.currentInput === '0' && digit === '0' && !this.hasDecimal) {
      return; // Не добавляем повторный ноль
    } else {
      this.currentInput += digit;
    }
    
    this.updateDisplay();
  }
  
  // Добавление десятичной точки
  appendDecimal() {
    if (this.waitingForOperand) {
      this.currentInput = '0';
      this.waitingForOperand = false;
    }
    
    if (!this.hasDecimal) {
      if (this.currentInput === '') {
        this.currentInput = '0';
      }
      this.currentInput += '.';
      this.hasDecimal = true;
    }
    
    this.updateDisplay();
  }
  
  // Установка оператора
  setOperator(op) {
    const value = parseFloat(this.currentInput);
    
    if (this.operator && !this.waitingForOperand) {
      this.calculate();
    } else if (this.currentInput !== '') {
      this.lastResult = value;
    }
    
    this.operator = op;
    this.waitingForOperand = true;
    this.updateDisplay();
  }
  
  // Вычисление результата
  calculate() {
    if (this.operator && !this.waitingForOperand) {
      const currentValue = parseFloat(this.currentInput);
      let newResult;
      
      switch (this.operator) {
        case '+':
          newResult = this.lastResult + currentValue;
          break;
        case '-':
          newResult = this.lastResult - currentValue;
          break;
        case '*':
          newResult = this.lastResult * currentValue;
          break;
        case '/':
          if (currentValue === 0) {
            AnimationHelper.showToast('Деление на ноль невозможно');
            this.clearAll();
            return;
          }
          newResult = this.lastResult / currentValue;
          break;
        case '^':
          newResult = Math.pow(this.lastResult, currentValue);
          break;
        default:
          return;
      }
      
      // Добавляем в историю
      if (this.historyEnabled) {
        this.addToHistory(`${this.lastResult} ${this.operator} ${currentValue} = ${newResult}`);
      }
      
      this.lastResult = newResult;
      this.currentInput = this.formatNumber(newResult);
      this.operator = null;
      this.waitingForOperand = true;
      this.hasDecimal = this.currentInput.includes('.');
      
      this.updateDisplay();
    }
  }
  
  // Очистка всех данных
  clearAll() {
    this.currentInput = '';
    this.lastResult = null;
    this.operator = null;
    this.hasDecimal = false;
    this.waitingForOperand = false;
    this.updateDisplay();
  }
  
  // Удаление последнего символа
  backspace() {
    if (this.waitingForOperand) return;
    
    if (this.currentInput.length > 0) {
      const lastChar = this.currentInput[this.currentInput.length - 1];
      this.currentInput = this.currentInput.slice(0, -1);
      
      if (lastChar === '.') {
        this.hasDecimal = false;
      }
      
      if (this.currentInput === '') {
        this.currentInput = '0';
      }
      
      this.updateDisplay();
    }
  }
  
  // Изменение знака числа
  toggleSign() {
    if (this.currentInput !== '' && this.currentInput !== '0') {
      if (this.currentInput.startsWith('-')) {
        this.currentInput = this.currentInput.substring(1);
      } else {
        this.currentInput = '-' + this.currentInput;
      }
      this.updateDisplay();
    } else if (this.lastResult !== null) {
      this.lastResult = -this.lastResult;
      this.currentInput = this.formatNumber(this.lastResult);
      this.updateDisplay();
    }
  }
  
  // Вычисление процента
  percentage() {
    if (this.currentInput !== '') {
      const value = parseFloat(this.currentInput);
      
      if (this.lastResult !== null && this.operator) {
        switch (this.operator) {
          case '+':
          case '-':
            this.currentInput = this.formatNumber(this.lastResult * (value / 100));
            break;
          case '*':
          case '/':
            this.currentInput = this.formatNumber(value / 100);
            break;
        }
      } else {
        this.currentInput = this.formatNumber(value / 100);
      }
      
      this.updateDisplay();
    }
  }
  
  // Применение математической функции
  applyFunction(func) {
    if (this.currentInput === '') return;
    
    const value = parseFloat(this.currentInput);
    let result;
    
    switch (func) {
      case 'sin':
        result = Math.sin(value);
        break;
      case 'cos':
        result = Math.cos(value);
        break;
      case 'tan':
        result = Math.tan(value);
        break;
      case 'square':
        result = value * value;
        break;
      case 'sqrt':
        result = Math.sqrt(value);
        break;
      case 'log':
        result = Math.log10(value);
        break;
      case 'ln':
        result = Math.log(value);
        break;
      default:
        return;
    }
    
    if (this.historyEnabled) {
      this.addToHistory(`${func}(${value}) = ${result}`);
    }
    
    this.currentInput = this.formatNumber(result);
    this.lastResult = result;
    this.hasDecimal = this.currentInput.includes('.');
    this.waitingForOperand = true;
    
    this.updateDisplay();
  }
  
  // Добавление константы
  appendConstant(constant) {
    let value;
    
    switch (constant) {
      case 'pi':
        value = Math.PI;
        break;
      case 'e':
        value = Math.E;
        break;
      default:
        return;
    }
    
    this.currentInput = this.formatNumber(value);
    this.hasDecimal = this.currentInput.includes('.');
    this.waitingForOperand = false;
    
    this.updateDisplay();
  }
  
  // Переключение между обычным и инженерным режимами
  toggleMode() {
    this.scientificMode = !this.scientificMode;
    SettingsManager.setSetting('apps.calculator.scientificMode', this.scientificMode);
    this.render();
    AnimationHelper.showToast(`${this.scientificMode ? 'Инженерный' : 'Обычный'} режим активирован`);
  }
  
  // Добавление записи в историю
  addToHistory(expression) {
    this.history.unshift(expression);
    
    // Обновляем отображение истории
    this.refreshHistoryDisplay();
    
    // Сохраняем историю
    this.saveHistory();
  }
  
  // Обновление отображения истории
  refreshHistoryDisplay() {
    if (!this.historyList) return;
    
    DOMUtils.clearElement(this.historyList);
    
    this.history.slice(0, 10).forEach(item => {
      const historyItem = DOMUtils.createElement('div', { 
        className: 'calculator-history-item',
        onclick: () => {
          const parts = item.split('=');
          if (parts.length === 2) {
            const result = parts[1].trim();
            this.currentInput = result;
            this.lastResult = parseFloat(result);
            this.updateDisplay();
          }
        }
      }, [item]);
      
      this.historyList.appendChild(historyItem);
    });
    
    // Добавляем кнопку очистки истории, если есть записи
    if (this.history.length > 0) {
      const clearButton = DOMUtils.createElement('button', { 
        className: 'calculator-history-clear',
        onclick: () => {
          this.clearHistory();
        }
      }, ['Очистить историю']);
      
      this.historyList.appendChild(clearButton);
    }
  }
  
  // Сохранение истории
  saveHistory() {
    if (this.historyEnabled) {
      localStorage.setItem('calculator_history', JSON.stringify(this.history));
    }
  }
  
  // Загрузка истории
  loadHistory() {
    const savedHistory = localStorage.getItem('calculator_history');
    if (savedHistory) {
      try {
        this.history = JSON.parse(savedHistory);
        this.refreshHistoryDisplay();
      } catch (e) {
        console.error('Ошибка загрузки истории калькулятора:', e);
      }
    }
  }
  
  // Очистка истории
  clearHistory() {
    this.history = [];
    this.refreshHistoryDisplay();
    localStorage.removeItem('calculator_history');
    AnimationHelper.showToast('История очищена');
  }
  
  // Форматирование числа с учетом настроек
  formatNumber(number) {
    // Проверяем на NaN и бесконечность
    if (isNaN(number) || !isFinite(number)) {
      return 'Ошибка';
    }
    
    // Форматируем число с учетом количества десятичных знаков
    return number.toLocaleString('ru-RU', {
      maximumFractionDigits: this.decimalPlaces,
      minimumFractionDigits: 0
    }).replace(/\s/g, '');
  }
} 