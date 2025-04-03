# AgentForce MCP Server

A Model Context Protocol (MCP) compliant server for Salesforce AgentForce API integration.

## 💡 Overview

This server acts as a gateway between Claude Desktop MCP tools and the Salesforce AgentForce API. It follows the Model Context Protocol standard for maximum compatibility with Claude and other MCP-compatible clients.

Key features:
- Full MCP standard compliance
- Secure API key authentication
- Session management with automatic cleanup
- Support for multiple transport types (Stdio and HTTP SSE)
- Clean, modern TypeScript implementation

## 🚀 Quick Start

### One-line Installation

```bash
npx agentforce-mcp-server@latest
```

This will:
1. Install the server globally
2. Run the post-installation guide
3. Provide configuration instructions

### Configuration

Run the configuration wizard:

```bash
npx agentforce-mcp-server configure
```

### Start the Server

Start with HTTP Server-Sent Events support (recommended for production):

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

2. **MCP Tool**: Runs locally with Claude Desktop and provides MCP tools for interacting with this server.

This separation provides:
- Centralized credential management
- Multi-user support
- Enhanced security

## 📋 Advanced Setup

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/agentforce-mcp-server.git
cd agentforce-mcp-server

# Run setup script
./scripts/setup.sh

# Start the server
npm start -- --http
```

### Environment Variables

The server supports both JSON configuration and environment variables:

- `PORT`: Server port (default: 3000)
- `DEFAULT_API_KEY`: API key for authentication
- `NODE_ENV`: Environment setting (development/production)
- `LOG_LEVEL`: Logging detail (debug/info/warn/error)

## 🔒 Security

- API key authentication for all requests
- No hardcoded credentials in the server code
- Automatic session cleanup
- All sensitive information provided by the client

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

## 📄 License

MIT