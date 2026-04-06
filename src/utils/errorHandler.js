/**
 * Safe Error Handler Utility
 * Handles errors gracefully without crashing the app
 */

export const handleError = (error, context = 'Unknown') => {
  console.error(`Error in ${context}:`, error);
  
  // Log to external service in production
  if (process.env.NODE_ENV === 'production') {
    // Example: logErrorToService(error, context);
  }
  
  return {
    message: error?.message || 'An unexpected error occurred',
    context,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Safe localStorage operations
 */
export const safeStorage = {
  getItem: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      handleError(error, `localStorage.getItem(${key})`);
      return defaultValue;
    }
  },

  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      handleError(error, `localStorage.setItem(${key})`);
      return false;
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      handleError(error, `localStorage.removeItem(${key})`);
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      handleError(error, 'localStorage.clear()');
      return false;
    }
  },
};

/**
 * Input validation utilities
 */
export const validateInput = {
  isEmail: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  isText: (text, minLength = 1, maxLength = 255) => {
    if (typeof text !== 'string') return false;
    const length = text.trim().length;
    return length >= minLength && length <= maxLength;
  },

  isNumber: (value, allowNegative = false) => {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    if (!allowNegative && num < 0) return false;
    return true;
  },

  isDate: (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  },

  sanitizeText: (text) => {
    if (typeof text !== 'string') return '';
    return text
      .replace(/[<>]/g, '') // Remove angle brackets
      .trim();
  },
};
