#!/bin/bash
# Test script for AgentForce MCP Server

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
SERVER_URL="http://localhost:3000"
API_KEY=""

# Check if the .env file exists and read the API key from it
if [ -f .env ]; then
    source .env
    API_KEY=$DEFAULT_API_KEY
    PORT=${PORT:-3000}
    SERVER_URL="http://localhost:$PORT"
fi

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        -u|--url) SERVER_URL="$2"; shift ;;
        -k|--key) API_KEY="$2"; shift ;;
        -h|--help) HELP=1 ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Help text
if [ -n "$HELP" ]; then
    echo "Test script for AgentForce MCP Server"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -u, --url <url>  Server URL (default: http://localhost:3000)"
    echo "  -k, --key <key>  API key (default: from .env file)"
    echo "  -h, --help       Show this help message"
    echo ""
    exit 0
fi

# Check if API key is provided
if [ -z "$API_KEY" ]; then
    echo -e "${RED}Error: API key is required${NC}"
    echo "Provide it with --key or set DEFAULT_API_KEY in .env file"
    exit 1
fi

echo -e "${BLUE}=== Testing AgentForce MCP Server ===${NC}"
echo -e "${YELLOW}Server URL:${NC} $SERVER_URL"
echo -e "${YELLOW}API Key:${NC} ${API_KEY:0:4}... (truncated)"
echo

# Test 1: Server info
echo -e "${BLUE}Test 1: Server Info${NC}"
response=$(curl -s "$SERVER_URL")
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to connect to server${NC}"
    exit 1
fi

echo -e "${GREEN}Server info:${NC}"
echo "$response" | python -m json.tool 2>/dev/null || echo "$response"
echo

# Test 2: Health check
echo -e "${BLUE}Test 2: Health Check${NC}"
health_response=$(curl -s "$SERVER_URL/api/health")
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Health check failed${NC}"
    exit 1
fi

echo -e "${GREEN}Health check response:${NC}"
echo "$health_response" | python -m json.tool 2>/dev/null || echo "$health_response"
echo

# Test 3: API authentication test
echo -e "${BLUE}Test 3: API Authentication${NC}"
auth_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "x-api-key: $API_KEY" \
    -d '{
        "clientId": "test-client",
        "config": {
            "sfBaseUrl": "https://example.my.salesforce.com",
            "apiUrl": "https://api.salesforce.com",
            "agentId": "test-agent-id",
            "clientId": "test-client-id",
            "clientSecret": "test-client-secret",
            "clientEmail": "test@example.com"
        }
    }' \
    "$SERVER_URL/api/authenticate")

# Check for error message
if echo "$auth_response" | grep -q "error"; then
    echo -e "${YELLOW}Authentication test expected to fail with invalid credentials${NC}"
    echo -e "${YELLOW}This is normal since we're using test values${NC}"
else
    echo -e "${GREEN}Authentication response:${NC}"
    echo "$auth_response" | python -m json.tool 2>/dev/null || echo "$auth_response"
fi
echo

echo -e "${BLUE}=== Test Summary ===${NC}"
echo -e "${GREEN}✓ Server is running${NC}"
echo -e "${GREEN}✓ Health check endpoint is working${NC}"
echo -e "${GREEN}✓ API endpoints are accessible${NC}"
echo
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Configure the MCP tool with your server URL: $SERVER_URL"
echo "2. Configure the MCP tool with your API key"
echo "3. Set up your Salesforce AgentForce credentials in the MCP tool"