#!/usr/bin/env node

import {
  CallToolRequestSchema,
  ContentType,
  HttpServerTransport,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  MCPServer,
  StdioServerTransport,
  TransportProtocol
} from '@modelcontextprotocol/sdk';
import { z } from 'zod';
import {
  AuthenticateSchema,
  CreateSessionSchema,
  GetStatusSchema,
  ResetSchema,
  SendMessageSchema,
} from './schemas/tools.js';
import { sessionStore } from './services/session-store.js';
import config from './utils/config.js';
import logger from './utils/logger.js';

async function main() {
  try {
    logger.info('Starting AgentForce MCP Server', {
      name: config.server.name,
      version: config.server.version,
      environment: config.server.env,
    });

    // Create MCP server with metadata compliant with MCP standards
    const server = new MCPServer({
      name: config.server.name,
      version: config.server.version,
      vendor: 'AgentForce',
      protocolVersion: '0.1.0',
      description: 'MCP Server for Salesforce AgentForce API',
      capabilities: {
        supportsNotifications: true,
        supportsProgress: true,
        supportsMultipart: false,
        maxRequestSize: 1024 * 1024, // 1MB
        supportsCancellation: false
      }
    });

    // Register handlers for standard MCP endpoints
    registerHandlers(server);

    // Connect to appropriate transport
    if (process.argv.includes('--http')) {
      // HTTP transport with Server-Sent Events
      const port = config.server.port;
      const transport = new HttpServerTransport({ 
        port,
        protocol: TransportProtocol.HTTP_SSE 
      });
      
      await server.start(transport);
      logger.info(`HTTP SSE server running on port ${port}`);
    } else {
      // Default to stdio transport
      const transport = new StdioServerTransport();
      
      await server.start(transport);
      logger.info('Stdio server running');
    }

    // Handle graceful shutdown
    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
    
    async function handleShutdown() {
      logger.info('Shutting down server...');
      try {
        await server.stop();
        sessionStore.clearAll();
        logger.info('Server shutdown complete');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        process.exit(1);
      }
    }
  } catch (error) {
    logger.error('Server startup error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }
}

/**
 * Register all handlers with the MCP server
 */
function registerHandlers(server: MCPServer) {
  // List resources handler (MCP standard)
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    logger.debug('Listing resources');
    return {
      resources: [
        {
          id: 'salesforce-agentforce',
          displayName: 'Salesforce AgentForce',
          description: 'Connect to Salesforce AgentForce AI',
          resourceType: 'api',
          actions: ['authenticate', 'create_session', 'send_message', 'get_status', 'reset']
        }
      ]
    };
  });

  // List tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.debug('Listing available tools');
    return {
      tools: [
        {
          name: 'agentforce_authenticate',
          description: 'Authenticate with the AgentForce API',
          inputSchema: AuthenticateSchema,
        },
        {
          name: 'agentforce_create_session',
          description: 'Create a new session with the AgentForce agent',
          inputSchema: CreateSessionSchema,
        },
        {
          name: 'agentforce_send_message',
          description: 'Send a message to the AgentForce agent and get a response',
          inputSchema: SendMessageSchema,
        },
        {
          name: 'agentforce_get_status',
          description: 'Get the current status of the AgentForce client connection',
          inputSchema: GetStatusSchema,
        },
        {
          name: 'agentforce_reset',
          description: 'Reset the AgentForce client connection',
          inputSchema: ResetSchema,
        },
      ],
    };
  });

  // Call tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, args } = request.tool;
    logger.info(`Tool called: ${name}`);

    try {
      // Handle each tool
      switch (name) {
        case 'agentforce_authenticate':
          return await handleAuthenticate(args);
        
        case 'agentforce_create_session':
          return await handleCreateSession(args);
        
        case 'agentforce_send_message':
          return await handleSendMessage(args);
        
        case 'agentforce_get_status':
          return await handleGetStatus(args);
        
        case 'agentforce_reset':
          return await handleReset(args);
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      logger.error(`Tool error: ${name}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Return error as text content with standard MCP error format
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
}

/**
 * Handle the authenticate tool
 */
async function handleAuthenticate(args: unknown) {
  const { clientId, config } = AuthenticateSchema.parse(args);
  
  // Get or create session
  const service = sessionStore.getOrCreateSession(clientId, config);
  
  // Authenticate
  const result = await service.authenticate();
  
  return {
    result: {
      content: [{
        type: ContentType.Text,
        text: `Successfully authenticated with Salesforce using email: ${config.clientEmail}`
      }],
      metadata: {
        instanceUrl: result.instanceUrl,
        tokenPreview: `${result.accessToken.substring(0, 10)}...`
      }
    }
  };
}

/**
 * Handle the create session tool
 */
async function handleCreateSession(args: unknown) {
  const { clientId, config } = CreateSessionSchema.parse(args);
  
  // Get or create session
  const service = sessionStore.getOrCreateSession(clientId, config);
  
  // Create session
  const result = await service.createSession();
  
  return {
    result: {
      content: [{
        type: ContentType.Text,
        text: `Successfully created AgentForce session with ID: ${result.sessionId}`
      }],
      metadata: {
        sessionId: result.sessionId
      }
    }
  };
}

/**
 * Handle the send message tool with progress reporting
 */
async function handleSendMessage(args: unknown) {
  const { clientId, config, message } = SendMessageSchema.parse(args);
  
  // Get or create session
  const service = sessionStore.getOrCreateSession(clientId, config);
  
  // Send message
  const result = await service.sendMessage(message);
  
  return {
    result: {
      content: [{
        type: ContentType.Text,
        text: result.text
      }],
      metadata: {
        sequenceId: result.sequenceId,
        userMessage: message
      }
    }
  };
}

/**
 * Handle the get status tool
 */
async function handleGetStatus(args: unknown) {
  const { clientId } = GetStatusSchema.parse(args);
  
  // Get session
  const service = sessionStore.getSession(clientId);
  
  if (!service) {
    return {
      result: {
        content: [{
          type: ContentType.Text,
          text: `No active session found for client ID: ${clientId}`
        }],
        metadata: {
          isAuthenticated: false,
          hasSession: false,
          clientId
        }
      }
    };
  }
  
  // Get status
  const status = service.getStatus();
  
  return {
    result: {
      content: [{
        type: ContentType.Text,
        text: `AgentForce client status: ${status.isAuthenticated ? 'Authenticated' : 'Not authenticated'}, ${status.hasSession ? `Session active (ID: ${status.sessionId})` : 'No active session'}`
      }],
      metadata: status
    }
  };
}

/**
 * Handle the reset tool
 */
async function handleReset(args: unknown) {
  const { clientId } = ResetSchema.parse(args);
  
  // Get session
  const service = sessionStore.getSession(clientId);
  
  if (!service) {
    return {
      result: {
        content: [{
          type: ContentType.Text,
          text: `No active session found for client ID: ${clientId}`
        }],
        metadata: {
          clientId,
          reset: false
        }
      }
    };
  }
  
  // Reset service
  service.reset();
  
  return {
    result: {
      content: [{
        type: ContentType.Text,
        text: `AgentForce client has been reset. You'll need to authenticate and create a new session.`
      }],
      metadata: {
        clientId,
        reset: true
      }
    }
  };
}

// Start the server
main();