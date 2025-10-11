/**
 * Shopping Cart Module
 * Handles all cart-related operations with proper error handling
 */
class ShoppingCart {
  constructor(storageKey = "cart") {
    this.storageKey = storageKey;
    this.listeners = new Set();
  }

  /**
   * Get cart items from localStorage
   * @returns {Array} Array of cart items
   */
  getItems() {
    try {
      const cart = localStorage.getItem(this.storageKey);
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error("Error reading cart from localStorage:", error);
      return [];
    }
  }

  /**
   * Save cart to localStorage
   * @param {Array} cart - Array of cart items
   */
  save(cart) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(cart));
      this.notifyListeners();
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }

  /**
   * Add item to cart
   * @param {Object} product - Product object
   * @param {number} quantity - Quantity to add
   */
  addItem(product, quantity = 1) {
    if (!product || !product.id) {
      throw new Error("Invalid product object");
    }

    if (quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }

    const cart = this.getItems();
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: product.discountedPrice || product.price,
        originalPrice: product.price,
        image: product.image,
        quantity: quantity,
      });
    }

    this.save(cart);
    return cart;
  }

  /**
   * Remove item from cart
   * @param {string} productId - Product ID to remove
   */
  removeItem(productId) {
    const cart = this.getItems();
    const filteredCart = cart.filter((item) => item.id !== productId);
    this.save(filteredCart);
    return filteredCart;
  }

  /**
   * Update item quantity
   * @param {string} productId - Product ID
   * @param {number} quantity - New quantity
   */
  updateQuantity(productId, quantity) {
    if (quantity < 0) {
      throw new Error("Quantity cannot be negative");
    }

    if (quantity === 0) {
      return this.removeItem(productId);
    }

    const cart = this.getItems();
    const item = cart.find((item) => item.id === productId);

    if (item) {
      item.quantity = quantity;
      this.save(cart);
    }

    return cart;
  }

  /**
   * Get total items count
   * @returns {number} Total number of items
   */
  getTotalItems() {
    return this.getItems().reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Get total price
   * @returns {number} Total price of all items
   */
  getTotalPrice() {
    return this.getItems().reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  /**
   * Clear entire cart
   */
  clear() {
    localStorage.removeItem(this.storageKey);
    this.notifyListeners();
  }

  /**
   * Add change listener
   * @param {Function} callback - Callback function
   */
  addListener(callback) {
    this.listeners.add(callback);
  }

  /**
   * Remove change listener
   * @param {Function} callback - Callback function
   */
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of cart changes
   */
  notifyListeners() {
    const cart = this.getItems();
    const totalItems = this.getTotalItems();

    this.listeners.forEach((callback) => {
      try {
        callback({ cart, totalItems });
      } catch (error) {
        console.error("Error in cart listener:", error);
      }
    });
  }
}

/**
 * UI Utilities Module
 * Handles common UI operations
 */
class UIUtils {
  /**
   * Format price for display
   * @param {number} price - Price to format
   * @param {string} currency - Currency code
   * @returns {string} Formatted price
   */
  static formatPrice(price, currency = "NOK") {
    try {
      return new Intl.NumberFormat("no-NO", {
        style: "currency",
        currency: currency,
      }).format(price);
    } catch (error) {
      console.error("Error formatting price:", error);
      return `${currency} ${price.toFixed(2)}`;
    }
  }

  /**
   * Show loading state
   * @param {HTMLElement} element - Element to show loading in
   */
  static showLoading(element) {
    if (!element) return;

    element.innerHTML = `
      <div class="loading" role="status" aria-label="Loading">
        <span>Loading...</span>
      </div>
    `;
  }

  /**
   * Show error message
   * @param {HTMLElement} element - Element to show error in
   * @param {string} message - Error message
   */
  static showError(element, message) {
    if (!element) return;

    element.innerHTML = `
      <div class="error" role="alert">
        <strong>Error:</strong> ${message}
      </div>
    `;
  }

  /**
   * Show notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, info)
   * @param {number} duration - Duration in milliseconds
   */
  static showNotification(message, type = "success", duration = 4000) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.setAttribute("role", "alert");
    notification.setAttribute("aria-live", "polite");

    document.body.appendChild(notification);

    // Auto-remove after duration
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, duration);

    return notification;
  }

  /**
   * Debounce function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Is email valid
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Sanitize HTML to prevent XSS
   * @param {string} str - String to sanitize
   * @returns {string} Sanitized string
   */
  static sanitizeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
}

/**
 * Form Validator Class
 * Handles form validation with error messages
 */
class FormValidator {
  constructor(form) {
    this.form = form;
    this.errors = new Map();
  }

  /**
   * Add validation rule
   * @param {string} fieldName - Field name
   * @param {Function} validator - Validation function
   * @param {string} message - Error message
   */
  addRule(fieldName, validator, message) {
    const field = this.form.querySelector(`[name="${fieldName}"]`);
    if (!field) return;

    field.addEventListener("blur", () => {
      this.validateField(fieldName, validator, message);
    });
  }

  /**
   * Validate single field
   * @param {string} fieldName - Field name
   * @param {Function} validator - Validation function
   * @param {string} message - Error message
   */
  validateField(fieldName, validator, message) {
    const field = this.form.querySelector(`[name="${fieldName}"]`);
    if (!field) return false;

    const isValid = validator(field.value);

    if (isValid) {
      this.clearError(fieldName);
    } else {
      this.showError(fieldName, message);
    }

    return isValid;
  }

  /**
   * Show field error
   * @param {string} fieldName - Field name
   * @param {string} message - Error message
   */
  showError(fieldName, message) {
    this.errors.set(fieldName, message);
    const field = this.form.querySelector(`[name="${fieldName}"]`);

    if (field) {
      field.classList.add("error");
      field.setAttribute("aria-invalid", "true");

      let errorDiv = field.parentNode.querySelector(".field-error");
      if (!errorDiv) {
        errorDiv = document.createElement("div");
        errorDiv.className = "field-error";
        errorDiv.setAttribute("role", "alert");
        field.parentNode.appendChild(errorDiv);
      }
      errorDiv.textContent = message;
    }
  }

  /**
   * Clear field error
   * @param {string} fieldName - Field name
   */
  clearError(fieldName) {
    this.errors.delete(fieldName);
    const field = this.form.querySelector(`[name="${fieldName}"]`);

    if (field) {
      field.classList.remove("error");
      field.removeAttribute("aria-invalid");

      const errorDiv = field.parentNode.querySelector(".field-error");
      if (errorDiv) {
        errorDiv.remove();
      }
    }
  }

  /**
   * Validate entire form
   * @returns {boolean} Is form valid
   */
  isValid() {
    return this.errors.size === 0;
  }
}

// Export modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { ShoppingCart, UIUtils, FormValidator };
} else {
  window.ShoppingCart = ShoppingCart;
  window.UIUtils = UIUtils;
  window.FormValidator = FormValidator;
}
