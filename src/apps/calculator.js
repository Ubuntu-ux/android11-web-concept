// Calculator App for Android 11 Web
import { AppStorage } from '../utils.js';

export default class Calculator {
  constructor() {
    this.container = null;
    this.result = '0';
    this.currentExpression = '';
    this.lastOperation = '';
    this.waitingForOperand = false;
  }

  // Initialize the calculator app
  init(container) {
    this.container = container;
    this.render();
    this.attachEventListeners();
  }

  // Render the calculator UI
  render() {
    this.container.innerHTML = `
      <div class="calculator-app">
        <div class="calculator-header">
          <span class="material-icons-round app-back">arrow_back</span>
          <span class="app-title">Калькулятор</span>
        </div>
        
        <div class="calculator-display">
          <div class="expression">${this.currentExpression}</div>
          <div class="result">${this.result}</div>
        </div>
        
        <div class="calculator-buttons">
          <button class="calc-button function" data-action="clear">C</button>
          <button class="calc-button function" data-action="backspace">⌫</button>
          <button class="calc-button function" data-action="percent">%</button>
          <button class="calc-button operator" data-action="divide">÷</button>
          
          <button class="calc-button number" data-digit="7">7</button>
          <button class="calc-button number" data-digit="8">8</button>
          <button class="calc-button number" data-digit="9">9</button>
          <button class="calc-button operator" data-action="multiply">×</button>
          
          <button class="calc-button number" data-digit="4">4</button>
          <button class="calc-button number" data-digit="5">5</button>
          <button class="calc-button number" data-digit="6">6</button>
          <button class="calc-button operator" data-action="subtract">−</button>
          
          <button class="calc-button number" data-digit="1">1</button>
          <button class="calc-button number" data-digit="2">2</button>
          <button class="calc-button number" data-digit="3">3</button>
          <button class="calc-button operator" data-action="add">+</button>
          
          <button class="calc-button number" data-digit="0">0</button>
          <button class="calc-button number" data-digit=".">.</button>
          <button class="calc-button function" data-action="negate">±</button>
          <button class="calc-button equals" data-action="equals">=</button>
        </div>
      </div>
    `;
  }

  // Attach event listeners to calculator buttons
  attachEventListeners() {
    // Back button
    this.container.querySelector('.app-back').addEventListener('click', () => {
      document.querySelector('.app-screen').classList.remove('visible');
    });

    // Number buttons
    this.container.querySelectorAll('.number').forEach(button => {
      button.addEventListener('click', () => {
        const digit = button.getAttribute('data-digit');
        this.inputDigit(digit);
      });
    });

    // Operator buttons
    this.container.querySelectorAll('.operator').forEach(button => {
      button.addEventListener('click', () => {
        const operation = button.getAttribute('data-action');
        this.inputOperator(operation);
      });
    });

    // Function buttons
    this.container.querySelectorAll('.function').forEach(button => {
      button.addEventListener('click', () => {
        const action = button.getAttribute('data-action');
        
        switch(action) {
          case 'clear':
            this.clearAll();
            break;
          case 'backspace':
            this.backspace();
            break;
          case 'percent':
            this.inputPercent();
            break;
          case 'negate':
            this.negate();
            break;
        }
      });
    });

    // Equals button
    this.container.querySelector('.equals').addEventListener('click', () => {
      this.calculate();
    });
  }

  // Input a digit
  inputDigit(digit) {
    if (this.waitingForOperand) {
      this.result = digit;
      this.waitingForOperand = false;
    } else {
      this.result = this.result === '0' && digit !== '.' ? digit : this.result + digit;
    }
    this.updateDisplay();
  }

  // Input an operator
  inputOperator(operation) {
    const operationSymbols = {
      'add': '+',
      'subtract': '−',
      'multiply': '×',
      'divide': '÷'
    };

    const inputValue = parseFloat(this.result);

    // If we already have a pending operation, calculate it first
    if (this.currentExpression !== '') {
      this.calculate();
    }

    this.lastOperation = operation;
    this.currentExpression = `${this.result} ${operationSymbols[operation]} `;
    this.waitingForOperand = true;
    this.updateDisplay();
  }

  // Calculate the result
  calculate() {
    if (this.currentExpression === '' || this.waitingForOperand) {
      return;
    }

    const expression = this.currentExpression + this.result;
    let calculationExpression = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-');

    try {
      // Using Function instead of eval for safer execution
      const result = Function('"use strict";return (' + calculationExpression + ')')();
      this.result = String(result);
      this.currentExpression = '';
      this.updateDisplay();
    } catch (e) {
      this.result = 'Ошибка';
      this.currentExpression = '';
      this.updateDisplay();
    }
  }

  // Clear all inputs
  clearAll() {
    this.result = '0';
    this.currentExpression = '';
    this.lastOperation = '';
    this.waitingForOperand = false;
    this.updateDisplay();
  }

  // Backspace function
  backspace() {
    if (this.waitingForOperand) return;
    
    this.result = this.result.length > 1 ? this.result.slice(0, -1) : '0';
    this.updateDisplay();
  }

  // Percentage function
  inputPercent() {
    const value = parseFloat(this.result);
    this.result = String(value / 100);
    this.updateDisplay();
  }

  // Negate function
  negate() {
    const value = parseFloat(this.result);
    this.result = String(-value);
    this.updateDisplay();
  }

  // Update the display
  updateDisplay() {
    this.container.querySelector('.result').textContent = this.result;
    this.container.querySelector('.expression').textContent = this.currentExpression;
  }
} 