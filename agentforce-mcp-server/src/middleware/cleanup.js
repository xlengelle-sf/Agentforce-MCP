import logger from '../utils/logger.js';

/**
 * Session expiration time in milliseconds (default: 1 hour)
 */
const SESSION_EXPIRATION_MS = 60 * 60 * 1000;

/**
 * Creates a session cleanup middleware
 * 
 * @param {Map} sessions - The sessions map to clean up
 * @returns {Function} - Express middleware function
 */
export const createSessionCleanup = (sessions) => {
  // Run cleanup every 15 minutes
  setInterval(() => {
    const now = Date.now();
    let cleanupCount = 0;
    
    for (const [clientId, session] of sessions.entries()) {
      if (now - session.lastAccess > SESSION_EXPIRATION_MS) {
        sessions.delete(clientId);
        cleanupCount++;
      }
    }
    
    if (cleanupCount > 0) {
      logger.info(`Cleaned up ${cleanupCount} expired client sessions`);
    }
  }, 15 * 60 * 1000);
  
  // Return middleware function
  return (req, res, next) => {
    next();
  };
};