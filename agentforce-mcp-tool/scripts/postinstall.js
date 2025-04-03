#!/usr/bin/env node

import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { platform } from 'process';

const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

// Welcome message
console.log(`${colors.blue}============================================${colors.reset}`);
console.log(`${colors.blue}  AgentForce MCP Tool Installation Complete ${colors.reset}`);
console.log(`${colors.blue}============================================${colors.reset}`);
console.log('');

// Determine the Claude Desktop config path
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

// Show configuration instructions
console.log(`${colors.yellow}To configure this tool in Claude Desktop:${colors.reset}`);
console.log('');

if (claudeConfigPath) {
  console.log(`Edit the Claude Desktop config file at:`);
  console.log(`${colors.green}${claudeConfigPath}${colors.reset}`);
  console.log('');
  console.log(`Add the following to your config file:`);
} else {
  console.log(`Edit your Claude Desktop config file and add:`);
}

console.log(`${colors.green}{
  "mcpServers": {
    "agentforce": {
      "command": "npx",
      "args": ["agentforce-mcp-tool"]
    }
  }
}${colors.reset}`);

console.log('');
console.log(`${colors.blue}Quick Setup:${colors.reset}`);
console.log(`Run our configuration wizard to set up your AgentForce credentials:`);
console.log(`${colors.green}npx agentforce-mcp-tool configure${colors.reset}`);
console.log('');

console.log(`${colors.yellow}Available Tools:${colors.reset}`);
console.log('- agentforce_authenticate: Authenticate with AgentForce');
console.log('- agentforce_create_session: Create a new agent session');
console.log('- agentforce_send_message: Send a message to the agent');
console.log('- agentforce_get_status: Check connection status');
console.log('- agentforce_update_config: Update configuration');
console.log('');

console.log(`${colors.blue}For more information, visit:${colors.reset}`);
console.log('https://github.com/yourusername/agentforce-mcp-tool');
console.log('');