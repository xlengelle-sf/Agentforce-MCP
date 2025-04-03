import config from '../config/config.js';
import logger from '../utils/logger.js';

/**
 * Middleware to verify API key
 */
export const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers[config.server.apiKeyHeader.toLowerCase()];
  
  // In development mode, we can skip API key validation if default is provided
  if (config.server.env === 'development' && config.server.defaultApiKey === apiKey) {
    return next();
  }
  
  // In production, implement more sophisticated API key validation
  // This could be a database lookup, JWT validation, etc.
  if (!apiKey) {
    logger.warn('API request rejected: Missing API key');
    return res.status(401).json({ error: 'API key is required' });
  }
  
  // Here, you would typically validate the API key against a database
  // For now, we'll use a simple check against environment variables
  // In a real implementation, you'd want to use a proper authentication system
  
  if (apiKey !== config.server.defaultApiKey) {
    logger.warn('API request rejected: Invalid API key');
    return res.status(403).json({ error: 'Invalid API key' });
  }
  
  next();
};