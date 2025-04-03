#!/bin/bash
# Setup script for AgentForce MCP Server

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==============================================${NC}"
echo -e "${BLUE}    Setting up AgentForce MCP Server        ${NC}"
echo -e "${BLUE}==============================================${NC}"
echo

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js 18 or later from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d '.' -f 1)
if [ $NODE_MAJOR -lt 18 ]; then
    echo -e "${YELLOW}Warning: Node.js 18 or later is recommended${NC}"
    echo "Current version: $NODE_VERSION"
    echo -e "Continue anyway? [y/N]"
    read -r answer
    if [[ ! "$answer" =~ ^[Yy]$ ]]; then
        echo -e "${RED}Setup aborted.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Node.js $NODE_VERSION detected${NC}"

# Determine configuration directory
CONFIG_DIR="$HOME/.agentforce-mcp-server"
CONFIG_PATH="$CONFIG_DIR/config.json"

# Generate API key
API_KEY=$(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | xxd -p)

# Check if configuration directory exists
if [ ! -d "$CONFIG_DIR" ]; then
    mkdir -p "$CONFIG_DIR"
    echo -e "${GREEN}✓ Created configuration directory${NC}"
fi

# Check if config file exists
if [ -f "$CONFIG_PATH" ]; then
    echo -e "${YELLOW}A configuration file already exists at $CONFIG_PATH${NC}"
    echo -e "Do you want to overwrite it? (y/n)"
    read -r answer
    if [[ ! "$answer" =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Setup continued with existing configuration.${NC}"
        # Load port from existing config
        if command -v jq &> /dev/null; then
            PORT=$(jq -r '.server.port // 3000' "$CONFIG_PATH")
        else
            PORT=3000
        fi
    else
        # Get port number
        read -p "Enter the port for the server [3000]: " PORT
        PORT=${PORT:-3000}
        
        # Create new config
        cat > "$CONFIG_PATH" << EOF
{
  "server": {
    "port": $PORT,
    "name": "agentforce-mcp-server",
    "version": "1.0.0",
    "env": "development",
    "apiKey": "$API_KEY"
  }
}
EOF
        echo -e "${GREEN}✓ Generated new configuration file with API key${NC}"
    fi
else
    # Get port number
    read -p "Enter the port for the server [3000]: " PORT
    PORT=${PORT:-3000}
    
    # Create new config
    cat > "$CONFIG_PATH" << EOF
{
  "server": {
    "port": $PORT,
    "name": "agentforce-mcp-server",
    "version": "1.0.0",
    "env": "development",
    "apiKey": "$API_KEY"
  }
}
EOF
    echo -e "${GREEN}✓ Generated new configuration file with API key${NC}"
fi

# Create .env file for backwards compatibility
echo -e "${YELLOW}Creating .env file for backward compatibility...${NC}"
cat > .env << EOL
# Server settings
PORT=$PORT
NODE_ENV=development

# Security
API_KEY_HEADER=x-api-key
DEFAULT_API_KEY=$API_KEY

# Logging
LOG_LEVEL=info
EOL
echo -e "${GREEN}✓ Created .env file${NC}"

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Build TypeScript
echo -e "${BLUE}Building TypeScript...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to build TypeScript${NC}"
    exit 1
fi

echo -e "${GREEN}✓ TypeScript built successfully${NC}"
echo

# Make sure logs directory exists
mkdir -p logs

# Server instructions
echo -e "${BLUE}==============================================${NC}"
echo -e "${BLUE}          Server Setup Complete             ${NC}"
echo -e "${BLUE}==============================================${NC}"
echo

echo -e "${YELLOW}API Key: ${NC}$API_KEY"
echo -e "${YELLOW}Keep this key secure! You'll need it to authenticate with the server.${NC}"
echo

echo -e "${BLUE}Starting the Server:${NC}"
echo -e "To start the server locally:"
echo -e "${GREEN}npm start${NC}"
echo
echo -e "With HTTP SSE support (recommended):"
echo -e "${GREEN}npm start -- --http${NC}"
echo
echo -e "For development with auto-restart:"
echo -e "${GREEN}npm run dev${NC}"
echo

echo -e "${BLUE}Server Details:${NC}"
echo -e "  - Port: ${GREEN}$PORT${NC}"
echo -e "  - API Key Header: ${GREEN}x-api-key${NC}"
echo -e "  - API Endpoint: ${GREEN}http://localhost:$PORT/api${NC}"
echo

echo -e "${BLUE}Global Installation:${NC}"
echo -e "To install globally and use from anywhere:"
echo -e "${GREEN}npm install -g .${NC}"
echo
echo -e "Then run with:"
echo -e "${GREEN}agentforce-mcp-server --http${NC}"
echo

echo -e "${BLUE}Using with AgentForce MCP Tool:${NC}"
echo -e "1. Install the client tool:"
echo -e "   ${GREEN}npx agentforce-mcp-tool@latest${NC}"
echo
echo -e "2. Configure the tool:"
echo -e "   ${GREEN}npx agentforce-mcp-tool configure${NC}"
echo -e "   - Server URL: ${GREEN}http://localhost:$PORT${NC}"
echo -e "   - API Key: ${GREEN}$API_KEY${NC}"
echo

echo -e "${BLUE}Deployment:${NC}"
echo -e "For production deployment, we recommend:"
echo -e "1. PM2 for process management"
echo -e "2. NGINX as a reverse proxy with SSL"
echo -e "3. Setting configuration env to 'production'"
echo

echo -e "${GREEN}Setup complete!${NC}"