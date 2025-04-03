import logger from './logger.js';

/**
 * Validates the client configuration provided in the request
 * 
 * @param {Object} clientConfig - The configuration provided by the client
 * @returns {Object} - Object with isValid flag and errors array
 */
export const validateClientConfig = (clientConfig) => {
  const errors = [];
  
  // Required fields for client configuration
  if (!clientConfig) {
    return { isValid: false, errors: ['Client configuration is required'] };
  }
  
  // Validate Salesforce base URL
  if (!clientConfig.sfBaseUrl) {
    errors.push('Salesforce base URL is required');
  } else if (!isValidUrl(clientConfig.sfBaseUrl)) {
    errors.push('Invalid Salesforce base URL format');
  }
  
  // Validate API URL
  if (!clientConfig.apiUrl) {
    errors.push('API URL is required');
  } else if (!isValidUrl(clientConfig.apiUrl)) {
    errors.push('Invalid API URL format');
  }
  
  // Validate agent ID (not validating format, just presence)
  if (!clientConfig.agentId) {
    errors.push('Agent ID is required');
  }
  
  // Validate authentication credentials
  if (!clientConfig.clientId) {
    errors.push('Client ID is required');
  }
  
  if (!clientConfig.clientSecret) {
    errors.push('Client Secret is required');
  }
  
  if (!clientConfig.clientEmail) {
    errors.push('Client Email is required');
  } else if (!isValidEmail(clientConfig.clientEmail)) {
    errors.push('Invalid email format');
  }
  
  // Log validation results
  if (errors.length > 0) {
    logger.warn('Client configuration validation failed', { errors });
  } else {
    logger.debug('Client configuration validated successfully');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates a URL format
 * 
 * @param {string} url - URL to validate
 * @returns {boolean} - True if URL is valid
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Validates an email format
 * 
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};