import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import logger from './logger.js';

// Load .env file if it exists
dotenv.config();

// Config directory path
const configDir = path.join(os.homedir(), '.agentforce-mcp-tool');
const configPath = path.join(configDir, 'config.json');

// Default configuration
const defaultConfig = {
  // AgentForce configuration
  agentId: process.env.SF_AGENT_ID || '0XxHn000000x9F1KAI',
  clientEmail: process.env.CLIENT_EMAIL || 'user@example.com',
  clientId: process.env.CLIENT_ID || '3MVG9OGq41FnYVsFgnaG0AzJDWnoy37Bb18e0R.GgDJu2qB9sqppVl7ehWmJhGvPSLrrA0cBNhDJdsbZXnv52',
  clientSecret: process.env.CLIENT_SECRET || '210117AC36E9E4C8AFCA02FF062B8A677BACBFFB71D2BB1162D60D316382FADE',
  apiBaseUrl: process.env.SF_BASE_URL || 'https://storm-41153b85fca0d8.my.salesforce.com',
  apiUrl: process.env.API_URL || 'https://api.salesforce.com',
  
  // Server configuration
  serverUrl: process.env.SERVER_URL || 'http://localhost:3000',
  apiKey: process.env.API_KEY || 'development-api-key',
  
  // MCP tool configuration
  clientToolId: process.env.CLIENT_TOOL_ID || uuidv4(),
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Interface for config
export interface Config {
  // AgentForce configuration
  agentId: string;
  clientEmail: string;
  clientId: string;
  clientSecret: string;
  apiBaseUrl: string;
  apiUrl: string;
  
  // Server configuration
  serverUrl: string;
  apiKey: string;
  
  // MCP tool configuration
  clientToolId: string;
  logLevel: string;
}

// Load config from file or create default
function loadConfig(): Config {
  try {
    // Create config directory if it doesn't exist
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Check if config file exists, create it if not
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
      logger.info('Created default config file', { path: configPath });
      return defaultConfig;
    }

    // Read and parse config file
    const configFile = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configFile);
    logger.debug('Loaded config from file', { path: configPath });
    
    // Merge with defaults to ensure all fields exist
    return { ...defaultConfig, ...config };
  } catch (error) {
    logger.error('Error loading config, using defaults', { error });
    return defaultConfig;
  }
}

// Update configuration
export function updateConfig(newConfig: Partial<Config>): Config {
  try {
    const currentConfig = loadConfig();
    const updatedConfig = { ...currentConfig, ...newConfig };
    
    fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2));
    logger.info('Updated config file', { path: configPath });
    
    return updatedConfig;
  } catch (error) {
    logger.error('Error updating config', { error });
    throw error;
  }
}

// Export config
export const config = loadConfig();