#!/bin/bash
# Installation script for AgentForce MCP Tool

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}          AgentForce MCP Tool Installation            ${NC}"
echo -e "${BLUE}======================================================${NC}"
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
    echo -e "${RED}Error: Node.js 18 or later is required${NC}"
    echo "Current version: $NODE_VERSION"
    echo "Please upgrade Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $NODE_VERSION detected${NC}"

# Determine installation type
if [ "$1" == "--local" ]; then
    # Local installation mode
    echo -e "${BLUE}Installing dependencies locally...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to install dependencies${NC}"
        exit 1
    fi

    # Build the project
    echo -e "${BLUE}Building project...${NC}"
    npm run build
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Build failed${NC}"
        exit 1
    fi

    # Install globally
    echo -e "${BLUE}Installing tool globally...${NC}"
    npm install -g .
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Global installation failed${NC}"
        echo "You may need to use sudo: sudo npm install -g ."
        exit 1
    fi
else
    # NPM installation mode
    echo -e "${BLUE}Installing AgentForce MCP Tool from npm...${NC}"
    npm install -g agentforce-mcp-tool
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Global installation failed${NC}"
        echo "You may need to use sudo: sudo npm install -g agentforce-mcp-tool"
        exit 1
    fi
fi

echo -e "${GREEN}✓ AgentForce MCP Tool installed successfully!${NC}"
echo

# Configuration helper
CONFIG_DIR=~/.agentforce-mcp-tool
DEFAULT_CONFIG_PATH="$CONFIG_DIR/config.json"

# Create config directory if it doesn't exist
mkdir -p "$CONFIG_DIR"

# Check if Claude Desktop is installed
CLAUDE_CONFIG_PATH=""
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    CLAUDE_CONFIG_PATH="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    CLAUDE_CONFIG_PATH="$HOME/.config/Claude/claude_desktop_config.json"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows with Git Bash or similar
    CLAUDE_CONFIG_PATH="$APPDATA/Claude/claude_desktop_config.json"
fi

# Prompt for AgentForce credentials
echo -e "${BLUE}Would you like to configure AgentForce credentials now? (y/n)${NC}"
read -r configure

if [[ $configure == "y" || $configure == "Y" ]]; then
    echo
    read -p "AgentForce Agent ID: " agent_id
    read -p "Client Email: " client_email
    read -p "API URL (default: https://api.salesforce.com): " api_url
    api_url=${api_url:-https://api.salesforce.com}
    read -p "Salesforce Base URL (e.g., https://yourdomain.my.salesforce.com): " sf_base_url
    read -p "Server URL (default: http://localhost:3000): " server_url
    server_url=${server_url:-http://localhost:3000}
    
    # Update config file
    if [ -n "$agent_id" ] && [ -n "$client_email" ]; then
        cat > "$DEFAULT_CONFIG_PATH" << EOF
{
  "agentId": "$agent_id",
  "clientEmail": "$client_email",
  "clientId": "3MVG9OGq41FnYVsFgnaG0AzJDWnoy37Bb18e0R.GgDJu2qB9sqppVl7ehWmJhGvPSLrrA0cBNhDJdsbZXnv52",
  "clientSecret": "210117AC36E9E4C8AFCA02FF062B8A677BACBFFB71D2BB1162D60D316382FADE",
  "apiBaseUrl": "${sf_base_url}",
  "apiUrl": "${api_url}",
  "serverUrl": "${server_url}",
  "logLevel": "info"
}
EOF
        echo -e "${GREEN}✓ Configuration saved to $DEFAULT_CONFIG_PATH${NC}"
    else
        echo -e "${YELLOW}Skipping configuration due to missing required values${NC}"
    fi
fi

# Offer to update Claude Desktop config
if [ -n "$CLAUDE_CONFIG_PATH" ]; then
    echo
    echo -e "${BLUE}Would you like to automatically add this tool to Claude Desktop? (y/n)${NC}"
    read -r update_claude_config
    
    if [[ $update_claude_config == "y" || $update_claude_config == "Y" ]]; then
        if [ -f "$CLAUDE_CONFIG_PATH" ]; then
            # Backup existing config
            cp "$CLAUDE_CONFIG_PATH" "${CLAUDE_CONFIG_PATH}.backup"
            echo -e "${GREEN}✓ Backed up existing Claude Desktop config to ${CLAUDE_CONFIG_PATH}.backup${NC}"
            
            # Try to update the JSON config
            if command -v jq &> /dev/null; then
                # Using jq if available
                jq '.mcpServers.agentforce = {"command":"npx","args":["agentforce-mcp-tool"]}' "$CLAUDE_CONFIG_PATH" > "${CLAUDE_CONFIG_PATH}.tmp"
                if [ $? -eq 0 ]; then
                    mv "${CLAUDE_CONFIG_PATH}.tmp" "$CLAUDE_CONFIG_PATH"
                    echo -e "${GREEN}✓ Claude Desktop config updated successfully!${NC}"
                else
                    echo -e "${RED}Failed to update Claude Desktop config with jq${NC}"
                    echo -e "${YELLOW}Please manually update your Claude Desktop config as shown below${NC}"
                    UPDATE_MANUALLY=true
                fi
            else
                echo -e "${YELLOW}jq not found - please manually update your Claude Desktop config${NC}"
                UPDATE_MANUALLY=true
            fi
        else
            # Create new config
            mkdir -p "$(dirname "$CLAUDE_CONFIG_PATH")"
            cat > "$CLAUDE_CONFIG_PATH" << EOF
{
  "mcpServers": {
    "agentforce": {
      "command": "npx",
      "args": ["agentforce-mcp-tool"]
    }
  }
}
EOF
            echo -e "${GREEN}✓ Created new Claude Desktop config at $CLAUDE_CONFIG_PATH${NC}"
        fi
    else
        UPDATE_MANUALLY=true
    fi
fi

echo
echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}              Installation Complete                   ${NC}"
echo -e "${BLUE}======================================================${NC}"
echo

if [ "$UPDATE_MANUALLY" = true ]; then
    echo -e "${YELLOW}To use with Claude Desktop, add the following to your config:${NC}"
    echo -e "File path: ${CLAUDE_CONFIG_PATH}"
    echo
    echo -e '{
  "mcpServers": {
    "agentforce": {
      "command": "npx",
      "args": ["agentforce-mcp-tool"]
    }
  }
}'
    echo
    echo -e "Make sure to merge this with any existing configuration."
    echo
fi

echo -e "${BLUE}Getting Started:${NC}"
echo -e "1. Start or restart Claude Desktop"
echo -e "2. Create a new chat, open Claude settings, and enable the AgentForce MCP tool"
echo -e "3. Start a conversation and use the AgentForce tools"
echo
echo -e "${BLUE}Available Tools:${NC}"
echo -e "- ${YELLOW}agentforce_authenticate${NC}: Authenticate with AgentForce"
echo -e "- ${YELLOW}agentforce_create_session${NC}: Create a new agent session"
echo -e "- ${YELLOW}agentforce_send_message${NC}: Send a message to the agent"
echo -e "- ${YELLOW}agentforce_get_status${NC}: Check connection status"
echo -e "- ${YELLOW}agentforce_update_config${NC}: Update configuration"
echo
echo -e "${BLUE}Documentation:${NC} https://github.com/yourusername/agentforce-mcp-tool"
echo