import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config();

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration object
const config = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    apiKeyHeader: process.env.API_KEY_HEADER || 'x-api-key',
    defaultApiKey: process.env.DEFAULT_API_KEY || 'development-api-key'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    logsDir: path.join(__dirname, '../../logs')
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    cacheTtl: parseInt(process.env.CACHE_TTL || '3600', 10)
  },
  // No default Salesforce URLs or credentials - these must be provided by the client
  defaults: {} 
};

// Create logs directory if it doesn't exist
if (!fs.existsSync(config.logging.logsDir)) {
  fs.mkdirSync(config.logging.logsDir, { recursive: true });
}

export default config;