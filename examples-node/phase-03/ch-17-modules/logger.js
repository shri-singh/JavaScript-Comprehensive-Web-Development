/**
 * Chapter 17 — Module: logger.js
 *
 * Demonstrates a default export. This module's primary purpose is the
 * createLogger factory function, so it makes sense as a default export.
 *
 * It also has a named export (LOG_LEVELS) to show that default and named
 * exports can coexist in the same module.
 */

export const LOG_LEVELS = Object.freeze({
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
});

/**
 * Creates a logger with a given prefix and minimum log level.
 *
 * Usage:
 *   import createLogger from "./logger.js";
 *   const log = createLogger("App");
 *   log.info("Server started");
 */
function createLogger(prefix = "App", minLevel = LOG_LEVELS.DEBUG) {
  const levels = Object.values(LOG_LEVELS);
  const minIndex = levels.indexOf(minLevel);

  function shouldLog(level) {
    return levels.indexOf(level) >= minIndex;
  }

  function format(level, message) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] [${prefix}] ${message}`;
  }

  return {
    debug(message) {
      if (shouldLog(LOG_LEVELS.DEBUG)) console.log(format(LOG_LEVELS.DEBUG, message));
    },
    info(message) {
      if (shouldLog(LOG_LEVELS.INFO)) console.log(format(LOG_LEVELS.INFO, message));
    },
    warn(message) {
      if (shouldLog(LOG_LEVELS.WARN)) console.warn(format(LOG_LEVELS.WARN, message));
    },
    error(message) {
      if (shouldLog(LOG_LEVELS.ERROR)) console.error(format(LOG_LEVELS.ERROR, message));
    },
  };
}

// The default export — the main thing this module provides
export default createLogger;
