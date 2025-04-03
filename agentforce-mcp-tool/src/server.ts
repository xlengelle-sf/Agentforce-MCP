#!/usr/bin/env node

import { 
  CallToolRequestSchema, 
  ContentType,
  ListResourcesRequestSchema,
  ListToolsRequestSchema, 
  MCPServer, 
  StdioServerTransport 
} from "@modelcontextprotocol/sdk";
import { handleToolCall } from "./tools/handlers.js";
import { toolDefinitions } from "./tools/definitions.js";
import logger from "./config/logger.js";
import { config } from "./config/config.js";
import { agentForceClient } from "./browser/agentforce-client.js";

// Create MCP server with metadata compliant with MCP standards
const server = new MCPServer({
  name: "agentforce-mcp-tool",
  version: "0.1.0",
  vendor: "AgentForce",
  protocolVersion: "0.1.0",
  description: "Model Context Protocol (MCP) tool for connecting to Salesforce AgentForce API",
  capabilities: {
    supportsNotifications: false,
    supportsProgress: true,
    supportsMultipart: false,
    maxRequestSize: 1024 * 1024, // 1MB
    supportsCancellation: false
  }
});

// List resources handler (MCP standard)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  logger.debug("Listing resources");
  return {
    resources: [
      {
        id: "salesforce-agentforce",
        displayName: "Salesforce AgentForce",
        description: "Connect to Salesforce AgentForce AI",
        resourceType: "api",
        actions: ["authenticate", "create_session", "send_message", "get_status", "reset"]
      }
    ]
  };
});

// Set up request handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  logger.debug("Listing available tools");
  return { tools: toolDefinitions };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, args } = request.tool;
  logger.info(`Calling tool: ${name}`, { args });
  
  try {
    const result = await handleToolCall(name, args);
    return { result };
  } catch (error) {
    logger.error(`Error in tool ${name}:`, { error });
    
    // Return standardized MCP error
    return {
      result: {
        content: [{
          type: ContentType.Text,
          text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        error: {
          code: 'tool_execution_error',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    };
  }
});

// Handle server shutdown properly
async function cleanupAndExit() {
  logger.info("Shutting down AgentForce MCP Tool Server");
  try {
    // Attempt to gracefully close the server
    await server.stop();
    logger.info("Server shutdown complete");
    process.exit(0);
  } catch (error) {
    logger.error("Error during shutdown:", { error });
    process.exit(1);
  }
}

// Register shutdown handlers
process.on("SIGINT", cleanupAndExit);
process.on("SIGTERM", cleanupAndExit);

// Start the server
async function startServer() {
  try {
    logger.info("Starting AgentForce MCP Tool Server", { config: {
      agentId: config.agentId,
      clientEmail: config.clientEmail,
      apiBaseUrl: config.apiBaseUrl
    }});
    
    const transport = new StdioServerTransport();
    await server.start(transport);
    logger.info("Server started successfully");
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
}

startServer();