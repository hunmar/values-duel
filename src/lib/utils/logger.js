/**
 * Simple logging utility for the application
 * Centralizes logging and allows for easy toggling of log levels
 */

// Log levels
export const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Current log level - can be adjusted based on environment
const currentLogLevel = process.env.NODE_ENV === 'production'
  ? LOG_LEVELS.ERROR
  : LOG_LEVELS.DEBUG;

/**
 * Log an error message
 * @param {string} message - The error message
 * @param {Error|any} [error] - Optional error object
 */
export function logError(message, error) {
  if (currentLogLevel >= LOG_LEVELS.ERROR) {
    console.error(`[ERROR] ${message}`, error || '');
  }
}

/**
 * Log a warning message
 * @param {string} message - The warning message
 * @param {any} [data] - Optional data to log
 */
export function logWarning(message, data) {
  if (currentLogLevel >= LOG_LEVELS.WARN) {
    console.warn(`[WARNING] ${message}`, data || '');
  }
}

/**
 * Log an info message
 * @param {string} message - The info message
 * @param {any} [data] - Optional data to log
 */
export function logInfo(message, data) {
  if (currentLogLevel >= LOG_LEVELS.INFO) {
    console.info(`[INFO] ${message}`, data || '');
  }
}

/**
 * Log a debug message
 * @param {string} message - The debug message
 * @param {any} [data] - Optional data to log
 */
export function logDebug(message, data) {
  if (currentLogLevel >= LOG_LEVELS.DEBUG) {
    console.debug(`[DEBUG] ${message}`, data || '');
  }
}

export default {
  error: logError,
  warning: logWarning,
  info: logInfo,
  debug: logDebug,
  levels: LOG_LEVELS
};
