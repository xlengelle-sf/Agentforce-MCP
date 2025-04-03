import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration interface
export interface Config {
  server: {
    port: number;
    name: string;
    version: string;
    env: string;
  };
}

// Configuration object
const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    name: 'agentforce-mcp-server',
    version: '1.0.0',
    env: process.env.NODE_ENV || 'development',
  },
};

export default config;