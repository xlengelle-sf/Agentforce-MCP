# 🚀 AgentForce MCP Tool

<div align="center">
  <img src="https://img.shields.io/badge/Salesforce-AgentForce-blue?style=for-the-badge" alt="Salesforce AgentForce" />
  <img src="https://img.shields.io/badge/Claude-MCP_Tool-blueviolet?style=for-the-badge" alt="Claude MCP Tool" />
  <img src="https://img.shields.io/badge/node.js-18+-green?style=for-the-badge" alt="Node.js 18+" />
</div>

<br>

A Model Context Protocol (MCP) compliant tool for connecting Claude AI to Salesforce AgentForce.

## 💡 Overview

This tool enables Claude to interact with Salesforce's AgentForce API, giving your AI assistant powerful capabilities to work with your Salesforce data and AI agents.

### Key Capabilities

- 🔐 **Authentication**: Secure OAuth flow with Salesforce
- 📊 **Session Management**: Create and manage agent sessions
- 💬 **Message Exchange**: Send messages to agents and process responses
- ⚙️ **Configuration**: Easy setup with interactive wizard
- 🔄 **AgentForce Integration**: Complete AgentForce API support
- 🧰 **MCP Compliance**: Full Model Context Protocol implementation
- 🛡️ **Security**: Secure credential storage

## 🚀 Quick Start

### Option 1: One-line Installation

```bash
npx agentforce-mcp-tool@latest
```

This will:
1. Install the tool globally
2. Run the post-installation guide
3. Provide configuration instructions

### Option 2: Manual Installation

```bash
# Install globally
npm install -g agentforce-mcp-tool

# Run configuration wizard
npx agentforce-mcp-tool configure
```

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

### Setup AgentForce Credentials

Run the configuration wizard:

```bash
npx agentforce-mcp-tool configure
```

This will:
- Guide you through connecting to the server
- Set up your AgentForce credentials
- Store configuration securely

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

## 📝 Using With Claude

Once installed and configured, Claude will have access to AgentForce capabilities through natural language. Here are some examples:

```
Can you authenticate to AgentForce for me?

Create a new session with the Customer Support agent.

Ask the AgentForce agent about our Q3 sales numbers.

Check the status of our AgentForce connection.
```

## 🏗️ Architecture

The AgentForce MCP solution consists of two components:

1. **MCP Tool (This Package)**: Runs locally with Claude Desktop and provides MCP tools for interacting with the AgentForce API.
   - Implements client-side MCP protocol
   - Manages tool definitions
   - Handles Claude requests
   - Secure configuration storage

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

### Source Code Installation

```bash
# Clone the repository
git clone https://github.com/xlengelle-sf/Agentforce-MCP.git
cd Agentforce-MCP/agentforce-mcp-tool

# Install dependencies
npm install

# Build the project
npm run build

# Install globally
npm install -g .
```

### Server Setup

If you need to self-host the server component, see the [AgentForce MCP Server](https://github.com/xlengelle-sf/Agentforce-MCP/tree/main/agentforce-mcp-server) directory in the repository.

## 🔒 Security

- **Secure Storage**: No credentials are stored in the tool code
- **Local Configuration**: Settings stored in your user directory
- **Encrypted Communication**: All API communication uses HTTPS
- **API Key Authentication**: Server authentication with API keys
- **Minimal Permissions**: Only requests necessary access

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT