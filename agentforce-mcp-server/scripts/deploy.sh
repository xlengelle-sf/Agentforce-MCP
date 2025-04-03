#!/bin/bash
# Deployment script for AgentForce MCP Server

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== AgentForce MCP Server Deployment ===${NC}"
echo

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2 not found. Installing PM2 globally...${NC}"
    npm install -g pm2
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to install PM2${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ PM2 installed${NC}"
fi

# Create production .env file if it doesn't exist
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}Creating production .env file...${NC}"
    
    # Generate a random API key
    API_KEY=$(openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
    
    # Get port number
    read -p "Enter the port for the server [3000]: " PORT
    PORT=${PORT:-3000}
    
    # Create .env.production file
    cat > .env.production << EOL
# Server settings
PORT=$PORT
NODE_ENV=production

# Security
API_KEY_HEADER=x-api-key
DEFAULT_API_KEY=$API_KEY

# Logging
LOG_LEVEL=info
EOL
    
    echo -e "${GREEN}✓ .env.production file created${NC}"
    echo -e "${YELLOW}Your production API key is: ${NC}$API_KEY"
    echo -e "${YELLOW}Keep this key secure! You'll need it to authenticate with the server.${NC}"
else
    echo -e "${GREEN}✓ .env.production file already exists${NC}"
fi

# Install dependencies for production
echo -e "${BLUE}Installing dependencies for production...${NC}"
npm ci --production
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to install dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Copy .env.production to .env
echo -e "${BLUE}Copying .env.production to .env...${NC}"
cp .env.production .env

# Make sure logs directory exists
mkdir -p logs

# Start or restart with PM2
if pm2 list | grep -q "agentforce-mcp-server"; then
    echo -e "${BLUE}Restarting server with PM2...${NC}"
    pm2 restart agentforce-mcp-server
else
    echo -e "${BLUE}Starting server with PM2...${NC}"
    pm2 start src/server.js --name agentforce-mcp-server
fi

# Save PM2 process list so it restarts on reboot
pm2 save

# Setup PM2 to start on system boot if not already configured
if ! pm2 startup | grep -q "already configured"; then
    echo -e "${YELLOW}Setting up PM2 to start on system boot...${NC}"
    pm2 startup
    echo -e "${YELLOW}↑ Run the command above manually with sudo if needed${NC}"
fi

echo -e "${GREEN}✓ Server deployed successfully${NC}"
echo

# Show server status
echo -e "${BLUE}=== Server Status ===${NC}"
pm2 info agentforce-mcp-server
echo

# Server instructions
echo -e "${BLUE}=== Server Information ===${NC}"
echo
echo -e "API Endpoint: ${YELLOW}http://localhost:$PORT/api${NC}"
echo -e "WebSocket: ${YELLOW}ws://localhost:$PORT/ws${NC}"
echo -e "API Key Header: ${YELLOW}x-api-key${NC}"
echo
echo -e "PM2 Commands:"
echo -e "  - Monitor: ${YELLOW}pm2 monit${NC}"
echo -e "  - Logs: ${YELLOW}pm2 logs agentforce-mcp-server${NC}"
echo -e "  - Restart: ${YELLOW}pm2 restart agentforce-mcp-server${NC}"
echo -e "  - Stop: ${YELLOW}pm2 stop agentforce-mcp-server${NC}"
echo
echo -e "${YELLOW}Important: For production use, set up NGINX as a reverse proxy with SSL${NC}"
echo -e "${GREEN}Deployment complete!${NC}"