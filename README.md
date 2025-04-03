# 🚀 AgentForce MCP

<div align="center">
  <img src="https://img.shields.io/badge/Salesforce-AgentForce-blue?style=for-the-badge" alt="Salesforce AgentForce" />
  <img src="https://img.shields.io/badge/claude-MCP_compatible-blueviolet?style=for-the-badge" alt="Claude MCP Compatible" />
  <img src="https://img.shields.io/badge/typescript-4.9+-blue?style=for-the-badge" alt="TypeScript" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" alt="MIT License" />
</div>

<br>

A complete Model Context Protocol (MCP) implementation for connecting Claude AI to Salesforce's AgentForce API.

## ✨ Features

- 🧠 **Seamless Claude Integration**: Connect Claude Desktop directly to Salesforce AgentForce
- 🔄 **Complete Workflow Support**: Authentication, session management, and messaging
- 🔐 **Secure Credential Management**: No hardcoded secrets, secure storage
- 🛠️ **Modular Architecture**: Separate server and client components
- 📱 **Multiple Transport Options**: Supports both stdio and HTTP SSE
- 🌐 **Multi-User Ready**: Central server can support multiple clients
- 📦 **Easy Installation**: Simple npm-based setup

## 📦 Packages

The repository consists of two main packages:

1. [**AgentForce MCP Server**](./agentforce-mcp-server): A server that acts as a gateway between Claude Desktop MCP tools and the Salesforce AgentForce API.

2. [**AgentForce MCP Tool**](./agentforce-mcp-tool): A Claude Desktop-compatible MCP tool that connects to the server for interacting with AgentForce.

## 🚀 Quick Start

### Server Setup

```bash
# Install the server
npm install -g agentforce-mcp-server

# Run the configuration wizard
npx agentforce-mcp-server configure

# Start the server (with HTTP SSE support)
npx agentforce-mcp-server --http
```

### Tool Setup

```bash
# Install the tool
npm install -g agentforce-mcp-tool

# Run the configuration wizard
npx agentforce-mcp-tool configure
```

### Claude Desktop Configuration

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

## 🏗️ Architecture

The AgentForce MCP solution consists of two components:

1. **MCP Server**: Handles communication with Salesforce's AgentForce API.
   - Centralized credential management
   - Multi-user support
   - Enhanced security and logging
   - Robust session management

2. **MCP Tool**: Runs locally with Claude Desktop and provides MCP tools.
   - Lightweight client component
   - Secure configuration storage
   - Seamless Claude Desktop integration
   - Local tool handling

## 📋 Requirements

- Node.js 18 or later
- Claude Desktop
- Salesforce AgentForce API credentials
- Proper permissions for the AgentForce API endpoints

## 📄 Documentation

See the individual package directories for detailed documentation:

- [Server Documentation](./agentforce-mcp-server/README.md)
- [Tool Documentation](./agentforce-mcp-tool/README.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT