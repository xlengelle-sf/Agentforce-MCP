import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { WebSocketServer } from 'ws';

import config from './config/config.js';
import logger from './utils/logger.js';
import apiRoutes from './routes/api-routes.js';
import { verifyApiKey } from './middleware/auth.js';

// Create Express application
const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Request logging middleware
app.use(morgan('combined', { stream: logger.stream }));

// Request parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API key verification for all API routes
app.use('/api', verifyApiKey);

// API routes
app.use('/api', apiRoutes);

// Root route for server info
app.get('/', (req, res) => {
  res.json({
    name: 'AgentForce MCP Server',
    version: '1.0.0',
    status: 'running',
    environment: config.server.env,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
  logger.info('WebSocket connection established');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      logger.debug('WebSocket message received', { type: data.type });
      
      // TODO: Implement WebSocket message handling
      
      ws.send(JSON.stringify({ type: 'ACK', message: 'Message received' }));
    } catch (error) {
      logger.error('Error processing WebSocket message', { error: error.message });
      ws.send(JSON.stringify({ type: 'ERROR', error: error.message }));
    }
  });
  
  ws.on('close', () => {
    logger.info('WebSocket connection closed');
  });
  
  ws.on('error', (error) => {
    logger.error('WebSocket error', { error: error.message });
  });
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'CONNECTED',
    message: 'Connected to AgentForce MCP Server',
    timestamp: new Date().toISOString()
  }));
});

// Start the server
const PORT = config.server.port;
server.listen(PORT, () => {
  logger.info(`Server started on port ${PORT} in ${config.server.env} mode`);
});

// Handle graceful shutdown
const gracefulShutdown = () => {
  logger.info('Shutting down server gracefully...');
  server.close(() => {
    logger.info('Server shutdown complete');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);