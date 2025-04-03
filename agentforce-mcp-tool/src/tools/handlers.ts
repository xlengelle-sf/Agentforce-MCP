import { agentForceClient } from '../browser/agentforce-client.js';
import logger from '../config/logger.js';
import { config, updateConfig } from '../config/config.js';

// Constants
const SALESFORCE_CONFIG_KEYS = ['agentId', 'clientEmail', 'clientId', 'clientSecret', 'apiBaseUrl', 'apiUrl'];
const SERVER_CONFIG_KEYS = ['serverUrl', 'apiKey'];
const TOOL_CONFIG_KEYS = ['logLevel', 'clientToolId'];

export async function handleToolCall(toolName: string, args: any) {
  try {
    logger.debug(`Handling tool call: ${toolName}`, { args });

    switch (toolName) {
      case 'agentforce_authenticate':
        return await handleAuthenticate(args);
      
      case 'agentforce_create_session':
        return await handleCreateSession();
      
      case 'agentforce_send_message':
        return await handleSendMessage(args);
      
      case 'agentforce_get_status':
        return await handleGetStatus();
      
      case 'agentforce_reset':
        return await handleReset();
      
      case 'agentforce_update_config':
        return await handleUpdateConfig(args);
      
      case 'agentforce_get_last_response':
        return handleGetLastResponse();
        
      case 'agentforce_configure_server':
        return await handleConfigureServer(args);
      
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    logger.error(`Error handling tool call: ${toolName}`, { error });
    return {
      text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: true
    };
  }
}

async function handleAuthenticate(args: any) {
  const clientEmail = args.clientEmail;
  
  if (clientEmail) {
    updateConfig({ clientEmail });
  }

  try {
    const authResult = await agentForceClient.authenticate();
    return {
      text: `Successfully authenticated with Salesforce using email: ${config.clientEmail}`,
      instanceUrl: authResult.instanceUrl,
      tokenPreview: authResult.accessToken.substring(0, 10) + '...'
    };
  } catch (error) {
    throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleCreateSession() {
  try {
    const sessionId = await agentForceClient.createSession();
    return {
      text: `Successfully created AgentForce session with ID: ${sessionId}`,
      sessionId
    };
  } catch (error) {
    throw new Error(`Session creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleSendMessage(args: any) {
  const { message } = args;
  
  if (!message) {
    throw new Error('Message is required');
  }

  try {
    // Use progress reporting for long-running message operations
    const progressReporter = {
      progress: async (value: number, message: string) => {
        // This will be called with progress updates
        logger.debug(`Message send progress: ${value}%, ${message}`);
        // In a real implementation with SDK support, would report progress to client
      }
    };

    // Report initial progress
    await progressReporter.progress(10, "Connecting to AgentForce...");
    
    // Send the message with progress reporting
    await progressReporter.progress(50, "Sending message to agent...");
    const response = await agentForceClient.sendMessage(message);
    
    // Report completion
    await progressReporter.progress(100, "Message received");
    
    return {
      text: response,
      userMessage: message
    };
  } catch (error) {
    throw new Error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function handleGetStatus() {
  try {
    const status = await agentForceClient.getStatus();
    return {
      text: `AgentForce client status: ${status.isAuthenticated ? 'Authenticated' : 'Not authenticated'}, ${status.hasSession ? `Session active (ID: ${status.sessionId})` : 'No active session'}`,
      ...status,
      serverUrl: config.serverUrl
    };
  } catch (error) {
    // If we can't connect to the server, return basic status
    const exchange = agentForceClient.getLastExchange();
    return {
      text: `Unable to connect to AgentForce server at ${config.serverUrl}. Client has cached messages: ${exchange.hasExchange ? 'Yes' : 'No'}`,
      isAuthenticated: false,
      hasSession: false,
      serverUrl: config.serverUrl,
      hasLastMessage: exchange.hasExchange,
      error: true
    };
  }
}

async function handleReset() {
  try {
    await agentForceClient.reset();
    return {
      text: `AgentForce client has been reset. You'll need to authenticate and create a new session.`
    };
  } catch (error) {
    // If we can't connect to the server, just reset the local client
    logger.warn('Failed to reset on server, resetting local state only', { error });
    return {
      text: `Failed to reset on server, but local client state has been reset. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      warning: true
    };
  }
}

function handleGetLastResponse() {
  const exchange = agentForceClient.getLastExchange();
  
  if (!exchange.hasExchange) {
    return {
      text: 'No previous exchange found. Send a message first with agentforce_send_message.',
      hasExchange: false
    };
  }
  
  return {
    text: exchange.agentResponse,
    userMessage: exchange.userMessage,
    agentResponse: exchange.agentResponse,
    hasExchange: true
  };
}

/**
 * Configure the AgentForce server connection
 */
async function handleConfigureServer(args: any) {
  const { serverUrl, apiKey } = args;
  
  if (!serverUrl) {
    throw new Error('Server URL is required');
  }
  
  const updates: Record<string, string> = {
    serverUrl
  };
  
  // API key is optional, use the default if not provided
  if (apiKey) {
    updates.apiKey = apiKey;
  }
  
  try {
    // Update the configuration
    const newConfig = updateConfig(updates);
    
    // Reset client to use the new server
    try {
      await agentForceClient.reset();
    } catch (resetError) {
      logger.warn('Failed to reset client after server config update', { error: resetError });
    }
    
    // Try to connect to the new server to verify it works
    try {
      const status = await agentForceClient.getStatus();
      return {
        text: `AgentForce server configured successfully. Server is ${status.isAuthenticated ? 'authenticated' : 'not authenticated'}.`,
        serverUrl: newConfig.serverUrl,
        apiKey: newConfig.apiKey ? `${newConfig.apiKey.substring(0, 4)}...` : undefined,
        serverConnected: true
      };
    } catch (connectionError) {
      return {
        text: `AgentForce server configuration saved, but unable to connect to the server. Error: ${connectionError instanceof Error ? connectionError.message : 'Unknown error'}`,
        serverUrl: newConfig.serverUrl,
        apiKey: newConfig.apiKey ? `${newConfig.apiKey.substring(0, 4)}...` : undefined,
        serverConnected: false,
        warning: true
      };
    }
  } catch (error) {
    throw new Error(`Failed to configure server: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update the configuration
 */
async function handleUpdateConfig(args: any) {
  try {
    const validKeys = [...SALESFORCE_CONFIG_KEYS, ...SERVER_CONFIG_KEYS, ...TOOL_CONFIG_KEYS];
    const updates: Record<string, string> = {};
    
    // Filter valid config keys
    for (const key of validKeys) {
      if (args[key] !== undefined) {
        updates[key] = args[key];
      }
    }
    
    if (Object.keys(updates).length === 0) {
      return {
        text: 'No configuration updates provided',
        currentConfig: config
      };
    }
    
    // Check if we're updating server config
    const hasServerConfigChanges = SERVER_CONFIG_KEYS.some(key => updates[key] !== undefined);
    const hasSalesforceConfigChanges = SALESFORCE_CONFIG_KEYS.some(key => updates[key] !== undefined);
    
    const newConfig = updateConfig(updates);
    
    // Reset client after config change if we changed server or Salesforce configs
    if (hasServerConfigChanges || hasSalesforceConfigChanges) {
      try {
        await agentForceClient.reset();
      } catch (resetError) {
        logger.warn('Failed to reset client after config update, continuing anyway', { error: resetError });
      }
    }
    
    return {
      text: `AgentForce configuration updated successfully`,
      updatedKeys: Object.keys(updates),
      updatedServerConfig: hasServerConfigChanges,
      updatedSalesforceConfig: hasSalesforceConfigChanges,
      newConfig
    };
  } catch (error) {
    throw new Error(`Failed to update configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}