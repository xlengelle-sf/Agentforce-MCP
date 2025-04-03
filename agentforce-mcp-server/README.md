# 🚀 AgentForce MCP Server

<div align="center">
  <img src="https://img.shields.io/badge/Salesforce-AgentForce-blue?style=for-the-badge" alt="Salesforce AgentForce" />
  <img src="https://img.shields.io/badge/MCP-server-blueviolet?style=for-the-badge" alt="MCP Server" />
  <img src="https://img.shields.io/badge/node.js-18+-green?style=for-the-badge" alt="Node.js 18+" />
</div>

<br>

A Model Context Protocol (MCP) compliant server for Salesforce AgentForce API integration.

## 💡 Overview

This server acts as a gateway between Claude Desktop MCP tools and the Salesforce AgentForce API. It follows the Model Context Protocol standard for maximum compatibility with Claude and other MCP-compatible clients.

### Key Features

- ✅ **Full MCP Compliance**: Implements the complete MCP standard
- 🔐 **Secure Authentication**: API key-based server auth + Salesforce OAuth 
- ⚡ **Efficient Session Management**: Smart session handling with automatic cleanup
- 📡 **Multiple Transports**: Support for both stdio and HTTP SSE connections
- 🔄 **Complete AgentForce Workflow**: Auth > Session > Messaging flow
- 📝 **Detailed Logging**: Comprehensive logs for easy debugging
- 🧩 **Modular Design**: Clean TypeScript implementation with separation of concerns

## 🚀 Quick Start

### Option 1: One-line Installation

```bash
npx agentforce-mcp-server@latest
```

This will:
1. Install the server globally
2. Run the post-installation guide
3. Provide configuration instructions

### Option 2: Manual Installation

```bash
# Install globally
npm install -g agentforce-mcp-server

# Run configuration wizard
npx agentforce-mcp-server configure
```

### Configuration

Run the interactive configuration wizard:

```bash
npx agentforce-mcp-server configure
```

This will:
- Create a config directory in your home folder
- Guide you through setting up the server
- Store configuration securely

### Starting the Server

#### For Development (stdio mode)

```bash
npx agentforce-mcp-server
```

#### For Production (HTTP SSE mode)

```bash
npx agentforce-mcp-server --http
```

## 🔄 Using with AgentForce MCP Tool

This server is designed to work with the AgentForce MCP Tool client:

1. Install the client:
   ```bash
   npx agentforce-mcp-tool@latest
   ```

2. Run the client configuration wizard:
   ```bash
   npx agentforce-mcp-tool configure
   ```

3. When prompted, enter your server URL and API key

4. Configure Claude Desktop to use the tool

## 🏗️ Architecture

The AgentForce MCP solution consists of two components:

1. **MCP Server (This Package)**: Handles communication with Salesforce's AgentForce API.
   - Implements server-side MCP protocol
   - Manages authentication with Salesforce
   - Maintains sessions and message sequencing
   - Provides secure API endpoints

2. **MCP Tool**: Runs locally with Claude Desktop and provides MCP tools for interacting with this server.
   - Implements client-side MCP protocol
   - Handles Claude Desktop integration
   - Provides tool definitions for Claude to use

This separation provides:
- Centralized credential management
- Multi-user support
- Enhanced security
- Simplified deployment

## 📋 Advanced Setup

### Source Code Installation

```bash
# Clone the repository
git clone https://github.com/xlengelle-sf/Agentforce-MCP.git
cd Agentforce-MCP/agentforce-mcp-server

# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Run setup script
./scripts/setup.sh

# Start the server
npm start -- --http
```

### Environment Variables

The server supports both JSON configuration and environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server HTTP port | 3000 |
| `DEFAULT_API_KEY` | API key for authentication | Generated randomly |
| `NODE_ENV` | Environment setting | development |
| `LOG_LEVEL` | Logging detail | info |

## 🔒 Security

- **API Key Authentication**: All requests require valid API key
- **No Hardcoded Credentials**: All sensitive information stored securely
- **Automatic Session Cleanup**: Inactive sessions are removed
- **Secure by Default**: Minimal configuration required for secure operation

## 🌐 Deployment

For production deployment, we recommend:

1. Deploy on a secure server with HTTPS
2. Use a process manager like PM2:
   ```bash
   pm2 start agentforce-mcp-server -- --http
   ```
3. Set up NGINX or similar as a reverse proxy
4. Configure firewalls to restrict access to trusted sources

## 📚 API Reference

### Authentication

All API requests require the `x-api-key` header with the server API key.

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Server information |
| `/api/health` | GET | Health check |
| `/api/authenticate` | POST | Authenticate with Salesforce |
| `/api/sessions` | POST | Create a new session |
| `/api/messages` | POST | Send a message |
| `/api/status/:clientId` | GET | Get client status |
| `/api/reset` | POST | Reset a client session |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT