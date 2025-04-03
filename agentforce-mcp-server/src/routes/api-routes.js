import express from 'express';
import { createAgentForceService } from '../services/agentforce-service.js';
import { validateClientConfig } from '../utils/validator.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Store client sessions in memory (in production, use Redis or another persistent store)
const clientSessions = new Map();

/**
 * Helper to get or create a client service
 */
const getOrCreateClientService = (clientId, clientConfig) => {
  if (!clientSessions.has(clientId)) {
    logger.info(`Creating new AgentForce service for client ${clientId}`);
    const service = createAgentForceService(clientConfig);
    clientSessions.set(clientId, { service, config: clientConfig, lastAccess: Date.now() });
    return service;
  }
  
  // Update last access time and return existing service
  const session = clientSessions.get(clientId);
  session.lastAccess = Date.now();
  
  // If config has changed, create a new service
  if (JSON.stringify(session.config) !== JSON.stringify(clientConfig)) {
    logger.info(`Configuration changed for client ${clientId}, creating new service`);
    const service = createAgentForceService(clientConfig);
    clientSessions.set(clientId, { service, config: clientConfig, lastAccess: Date.now() });
    return service;
  }
  
  return session.service;
};

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * Authenticate with AgentForce
 */
router.post('/authenticate', async (req, res) => {
  const { clientId, config } = req.body;
  
  if (!clientId) {
    return res.status(400).json({ error: 'Client ID is required' });
  }
  
  // Validate client configuration
  const validationResult = validateClientConfig(config);
  if (!validationResult.isValid) {
    return res.status(400).json({ error: 'Invalid client configuration', details: validationResult.errors });
  }
  
  try {
    const service = getOrCreateClientService(clientId, config);
    const result = await service.authenticate();
    
    res.status(200).json({
      accessToken: result.accessToken,
      instanceUrl: result.instanceUrl,
      clientId
    });
  } catch (error) {
    logger.error('Authentication error', { clientId, error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create a session with AgentForce
 */
router.post('/sessions', async (req, res) => {
  const { clientId, config } = req.body;
  
  if (!clientId) {
    return res.status(400).json({ error: 'Client ID is required' });
  }
  
  // Validate client configuration
  const validationResult = validateClientConfig(config);
  if (!validationResult.isValid) {
    return res.status(400).json({ error: 'Invalid client configuration', details: validationResult.errors });
  }
  
  try {
    const service = getOrCreateClientService(clientId, config);
    const sessionId = await service.createSession();
    
    res.status(200).json({
      sessionId,
      clientId,
      status: 'Session created successfully'
    });
  } catch (error) {
    logger.error('Session creation error', { clientId, error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Send a message to AgentForce
 */
router.post('/messages', async (req, res) => {
  const { clientId, config, message } = req.body;
  
  if (!clientId) {
    return res.status(400).json({ error: 'Client ID is required' });
  }
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  // Validate client configuration
  const validationResult = validateClientConfig(config);
  if (!validationResult.isValid) {
    return res.status(400).json({ error: 'Invalid client configuration', details: validationResult.errors });
  }
  
  try {
    const service = getOrCreateClientService(clientId, config);
    const response = await service.sendMessage(message);
    
    res.status(200).json({
      text: response.text,
      sequenceId: response.sequenceId,
      clientId
    });
  } catch (error) {
    logger.error('Message sending error', { clientId, error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get client status
 */
router.get('/status/:clientId', (req, res) => {
  const { clientId } = req.params;
  
  if (!clientSessions.has(clientId)) {
    return res.status(404).json({ error: 'Client session not found' });
  }
  
  const { service } = clientSessions.get(clientId);
  const status = service.getStatus();
  
  res.status(200).json({
    ...status,
    clientId
  });
});

/**
 * Reset client session
 */
router.post('/reset', (req, res) => {
  const { clientId } = req.body;
  
  if (!clientId) {
    return res.status(400).json({ error: 'Client ID is required' });
  }
  
  if (!clientSessions.has(clientId)) {
    return res.status(404).json({ error: 'Client session not found' });
  }
  
  const { service } = clientSessions.get(clientId);
  service.reset();
  
  res.status(200).json({
    status: 'Client session reset successfully',
    clientId
  });
});

export default router;