#!/usr/bin/env node

import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

// Welcome message
console.log(`${colors.blue}============================================${colors.reset}`);
console.log(`${colors.blue}  AgentForce MCP Server Installation Complete ${colors.reset}`);
console.log(`${colors.blue}============================================${colors.reset}`);
console.log('');

// Get home directory for config path
const configDir = join(homedir(), '.agentforce-mcp-server');
const configPath = join(configDir, 'config.json');

// Create the directory if it doesn't exist
try {
  await fs.mkdir(configDir, { recursive: true });
} catch (error) {
  console.error(`${colors.red}Error creating config directory:${colors.reset}`, error.message);
}

// Show configuration instructions
console.log(`${colors.blue}Quick Setup:${colors.reset}`);
console.log(`Run our configuration wizard to set up your server:`);
console.log(`${colors.green}npx agentforce-mcp-server configure${colors.reset}`);
console.log('');

console.log(`${colors.yellow}Manual Configuration:${colors.reset}`);
console.log(`Create a configuration file at: ${colors.green}${configPath}${colors.reset}`);
console.log(`With the following structure:`);
console.log(`${colors.green}{
  "server": {
    "port": 3000,
    "name": "agentforce-mcp-server",
    "version": "1.0.0",
    "apiKey": "your-secure-api-key-here"
  }
}${colors.reset}`);
console.log('');

console.log(`${colors.blue}Starting the Server:${colors.reset}`);
console.log(`Start the server with:`);
console.log(`${colors.green}npx agentforce-mcp-server${colors.reset}`);
console.log('');
console.log(`With HTTP server support:`);
console.log(`${colors.green}npx agentforce-mcp-server --http${colors.reset}`);
console.log('');

console.log(`${colors.blue}Using with AgentForce MCP Tool:${colors.reset}`);
console.log(`1. Install the AgentForce MCP Tool:`);
console.log(`   ${colors.green}npx agentforce-mcp-tool@latest${colors.reset}`);
console.log('');
console.log(`2. Configure the tool to connect to this server:`);
console.log(`   ${colors.green}npx agentforce-mcp-tool configure${colors.reset}`);
console.log('   (Use your server URL, e.g., http://localhost:3000)');
console.log('');

console.log(`${colors.blue}For more information, visit:${colors.reset}`);
console.log('https://github.com/xlengelle-sf/Agentforce-MCP/tree/main/agentforce-mcp-server');
console.log('');