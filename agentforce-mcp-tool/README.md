# AgentForce MCP Tool

A Model Context Protocol (MCP) compliant tool for connecting Claude AI to Salesforce AgentForce.

## 💡 Overview

This tool enables Claude to interact with Salesforce's AgentForce API, allowing you to:

- Authenticate with Salesforce AgentForce
- Create and manage AgentForce sessions
- Send messages to agents and receive responses
- Configure connection parameters
- Access Salesforce data via AgentForce

The tool follows the Model Context Protocol (MCP) standard for maximum compatibility with Claude Desktop and other MCP-compatible clients.

## 🚀 Quick Start

### One-line Installation

```bash
npx agentforce-mcp-tool@latest
```

This will:
1. Install the tool globally
2. Run the post-installation guide
3. Provide configuration instructions

### Configure Claude Desktop

Add this to your Claude Desktop configuration file:

```json
{
  "mcpServers": {
    "agentforce": {
      "command": "npx",
      "args": ["agentforce-mcp-tool"]
    }
  }
}
```

Location of the config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

### Configure AgentForce Credentials

Run the configuration wizard:

```bash
npx agentforce-mcp-tool configure
```

## 🛠️ Available Tools

| Tool Name | Description |
|-----------|-------------|
| `agentforce_configure_server` | Configure the server connection |
| `agentforce_authenticate` | Authenticate with AgentForce |
| `agentforce_create_session` | Create a new session with an agent |
| `agentforce_send_message` | Send a message to the agent |
| `agentforce_get_last_response` | Get the last message exchange |
| `agentforce_get_status` | Check connection status |
| `agentforce_reset` | Reset the client connection |
| `agentforce_update_config` | Update configuration |

## 🏗️ Architecture

The AgentForce MCP solution consists of two components:

1. **MCP Tool (This Package)**: Runs locally with Claude Desktop and provides MCP tools for interacting with the AgentForce API.

2. **MCP Server**: Handles communication with Salesforce's AgentForce API. The server can be:
   - Self-hosted locally
   - Deployed to a remote server
   - Shared by multiple users

## 📋 Requirements

- Node.js 18 or later
- Claude Desktop
- Salesforce AgentForce credentials
- Connection to an AgentForce MCP server

## 🔧 Advanced Setup

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/agentforce-mcp-tool.git
cd agentforce-mcp-tool

# Install dependencies
npm install

# Build the project
npm run build

# Install globally
npm install -g .
```

### Server Setup

If you need to self-host the server component, see the [AgentForce MCP Server](https://github.com/yourusername/agentforce-mcp-server) repository.

## 🔒 Security

- No credentials are stored in the tool code
- Configuration is stored in your user directory
- All communication with AgentForce uses secure connections
- API keys are used for server authentication

## 📚 Documentation

For more detailed documentation on using the AgentForce MCP Tool, see the [User Guide](https://github.com/yourusername/agentforce-mcp-tool/wiki).

## 📄 License

MIT