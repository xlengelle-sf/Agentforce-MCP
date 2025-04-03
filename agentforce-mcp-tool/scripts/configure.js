#!/usr/bin/env node

import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { platform } from 'process';
import { createInterface } from 'readline';

const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

// Configuration constants
const CONFIG_DIR = join(homedir(), '.agentforce-mcp-tool');
const CONFIG_PATH = join(CONFIG_DIR, 'config.json');

// Default configuration
const defaultConfig = {
  agentId: '',
  clientEmail: '',
  clientId: '3MVG9OGq41FnYVsFgnaG0AzJDWnoy37Bb18e0R.GgDJu2qB9sqppVl7ehWmJhGvPSLrrA0cBNhDJdsbZXnv52',
  clientSecret: '210117AC36E9E4C8AFCA02FF062B8A677BACBFFB71D2BB1162D60D316382FADE',
  apiBaseUrl: '',
  apiUrl: 'https://api.salesforce.com',
  serverUrl: 'http://localhost:3000',
  logLevel: 'info'
};

// Create a readline interface
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt helper function
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Main configuration function
async function configureAgentForce() {
  console.log(`${colors.blue}============================================${colors.reset}`);
  console.log(`${colors.blue}  AgentForce MCP Tool Configuration Wizard  ${colors.reset}`);
  console.log(`${colors.blue}============================================${colors.reset}`);
  console.log('');
  
  // Create config directory if it doesn't exist
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  } catch (error) {
    console.error(`${colors.red}Error creating config directory:${colors.reset}`, error.message);
  }
  
  // Load existing config if available
  let config = { ...defaultConfig };
  try {
    const existingConfig = await fs.readFile(CONFIG_PATH, 'utf8');
    config = { ...config, ...JSON.parse(existingConfig) };
    console.log(`${colors.green}Loaded existing configuration.${colors.reset}`);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`${colors.red}Error loading existing config:${colors.reset}`, error.message);
    } else {
      console.log(`${colors.yellow}No existing configuration found. Creating new config.${colors.reset}`);
    }
  }
  
  console.log('');
  console.log(`${colors.yellow}Enter your AgentForce configuration details:${colors.reset}`);
  console.log('(Press Enter to keep existing values in brackets)');
  console.log('');
  
  // Collect configuration details
  config.agentId = await prompt(`AgentForce Agent ID ${config.agentId ? `[${config.agentId}]` : ''}: `) || config.agentId;
  config.clientEmail = await prompt(`Client Email ${config.clientEmail ? `[${config.clientEmail}]` : ''}: `) || config.clientEmail;
  config.apiBaseUrl = await prompt(`Salesforce Base URL (eg. https://yourdomain.my.salesforce.com) ${config.apiBaseUrl ? `[${config.apiBaseUrl}]` : ''}: `) || config.apiBaseUrl;
  config.apiUrl = await prompt(`API URL ${config.apiUrl ? `[${config.apiUrl}]` : ''}: `) || config.apiUrl;
  config.serverUrl = await prompt(`Server URL ${config.serverUrl ? `[${config.serverUrl}]` : ''}: `) || config.serverUrl;
  config.logLevel = await prompt(`Log Level (debug, info, warn, error) ${config.logLevel ? `[${config.logLevel}]` : ''}: `) || config.logLevel;
  
  // Validate required fields
  if (!config.agentId || !config.clientEmail) {
    console.log(`${colors.red}Agent ID and Client Email are required.${colors.reset}`);
    rl.close();
    return;
  }
  
  // Save the configuration
  try {
    await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
    console.log('');
    console.log(`${colors.green}Configuration saved successfully to ${CONFIG_PATH}${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error saving configuration:${colors.reset}`, error.message);
  }
  
  // Display Claude Desktop configuration info
  console.log('');
  console.log(`${colors.blue}Claude Desktop Configuration${colors.reset}`);
  console.log('');
  
  // Determine Claude Desktop config path
  let claudeConfigPath;
  switch (platform) {
    case 'darwin': // macOS
      claudeConfigPath = join(homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
      break;
    case 'linux':
      claudeConfigPath = join(homedir(), '.config', 'Claude', 'claude_desktop_config.json');
      break;
    case 'win32':
      claudeConfigPath = join(process.env.APPDATA || '', 'Claude', 'claude_desktop_config.json');
      break;
    default:
      claudeConfigPath = null;
  }
  
  if (claudeConfigPath) {
    console.log(`Add this to your Claude Desktop config file at:`);
    console.log(`${colors.green}${claudeConfigPath}${colors.reset}`);
  }
  
  console.log('');
  console.log(`${colors.green}{
  "mcpServers": {
    "agentforce": {
      "command": "npx",
      "args": ["agentforce-mcp-tool"]
    }
  }
}${colors.reset}`);
  
  // Would you like to update Claude Desktop config?
  const updateClaude = await prompt(`\nWould you like to attempt to update Claude Desktop config automatically? (y/n): `);
  
  if (updateClaude.toLowerCase() === 'y' && claudeConfigPath) {
    try {
      // Check if the file exists
      let claudeConfig = { mcpServers: {} };
      try {
        const existingFile = await fs.readFile(claudeConfigPath, 'utf8');
        claudeConfig = JSON.parse(existingFile);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error;
        }
        // Create the directory structure if it doesn't exist
        await fs.mkdir(join(claudeConfigPath, '..'), { recursive: true });
      }
      
      // Update the config
      claudeConfig.mcpServers = claudeConfig.mcpServers || {};
      claudeConfig.mcpServers.agentforce = {
        command: 'npx',
        args: ['agentforce-mcp-tool']
      };
      
      // Write the updated config
      await fs.writeFile(claudeConfigPath, JSON.stringify(claudeConfig, null, 2), 'utf8');
      console.log(`${colors.green}Claude Desktop configuration updated successfully!${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Error updating Claude Desktop config:${colors.reset}`, error.message);
      console.log(`${colors.yellow}Please update the Claude Desktop config manually.${colors.reset}`);
    }
  }
  
  console.log('');
  console.log(`${colors.blue}Next Steps:${colors.reset}`);
  console.log('1. Start or restart Claude Desktop');
  console.log('2. Create a new chat and enable the AgentForce MCP tool in Claude settings');
  console.log('3. Use the AgentForce tools in your conversation');
  console.log('');
  
  rl.close();
}

// Run the configuration wizard
configureAgentForce().catch(error => {
  console.error(`${colors.red}Configuration wizard error:${colors.reset}`, error);
  rl.close();
  process.exit(1);
});