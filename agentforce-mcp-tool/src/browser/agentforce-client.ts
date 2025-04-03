import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger.js';
import { config } from '../config/config.js';

// Types for AgentForce server responses
interface AuthResponse {
  accessToken: string;
  instanceUrl: string;
  clientId: string;
}

interface SessionResponse {
  sessionId: string;
  clientId: string;
  status: string;
}

interface MessageResponse {
  text: string;
  sequenceId: number;
  clientId: string;
}

interface StatusResponse {
  isAuthenticated: boolean;
  hasSession: boolean;
  sessionId: string | null;
  sequenceId: number;
  agentId: string;
  clientEmail: string;
  clientId: string;
}

// AgentForce client class
export class AgentForceClient {
  private serverUrl: string;
  private apiKey: string;
  private clientId: string;
  private lastUserMessage: string | null = null;
  private lastAgentResponse: string | null = null;

  constructor() {
    this.serverUrl = config.serverUrl;
    this.apiKey = config.apiKey;
    this.clientId = config.clientToolId;
    
    logger.debug('AgentForce client initialized', {
      serverUrl: this.serverUrl,
      clientId: this.clientId
    });
  }

  /**
   * Get the current client configuration to send to the server
   */
  private getClientConfig() {
    return {
      sfBaseUrl: config.apiBaseUrl,
      apiUrl: config.apiUrl,
      agentId: config.agentId,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      clientEmail: config.clientEmail
    };
  }

  /**
   * Get the current status of the client from the server
   */
  public async getStatus() {
    try {
      logger.debug('Getting client status');
      
      const response = await axios.get<StatusResponse>(
        `${this.serverUrl}/api/status/${this.clientId}`,
        {
          headers: {
            'x-api-key': this.apiKey
          }
        }
      );
      
      logger.debug('Status retrieved successfully');
      
      // Add local message status that the server doesn't track
      return {
        ...response.data,
        hasLastMessage: !!this.lastAgentResponse,
        lastMessageTimestamp: this.lastAgentResponse ? new Date().toISOString() : null
      };
    } catch (error) {
      // If we get a 404, it means the client session doesn't exist yet
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return {
          isAuthenticated: false,
          hasSession: false,
          sessionId: null,
          sequenceId: 0,
          clientId: this.clientId,
          hasLastMessage: !!this.lastAgentResponse,
          lastMessageTimestamp: this.lastAgentResponse ? new Date().toISOString() : null
        };
      }
      
      logger.error('Error getting status', { error });
      throw new Error(`Failed to get status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Get the last user message and agent response
   */
  public getLastExchange() {
    return {
      userMessage: this.lastUserMessage,
      agentResponse: this.lastAgentResponse,
      hasExchange: !!(this.lastUserMessage && this.lastAgentResponse)
    };
  }

  /**
   * Authenticate with the AgentForce server
   */
  public async authenticate() {
    try {
      logger.info('Authenticating with AgentForce server');
      
      const response = await axios.post<AuthResponse>(
        `${this.serverUrl}/api/authenticate`,
        {
          clientId: this.clientId,
          config: this.getClientConfig()
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey
          }
        }
      );
      
      logger.info('Authentication successful');
      return {
        accessToken: response.data.accessToken,
        instanceUrl: response.data.instanceUrl
      };
    } catch (error) {
      logger.error('Authentication failed', { error });
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a session with the AgentForce server
   */
  public async createSession() {
    try {
      logger.info('Creating session with AgentForce server');
      
      const response = await axios.post<SessionResponse>(
        `${this.serverUrl}/api/sessions`,
        {
          clientId: this.clientId,
          config: this.getClientConfig()
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey
          }
        }
      );
      
      logger.info('Session created successfully', { sessionId: response.data.sessionId });
      return response.data.sessionId;
    } catch (error) {
      logger.error('Session creation failed', { error });
      throw new Error(`Session creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send a message to the AgentForce server
   */
  public async sendMessage(message: string) {
    try {
      logger.info('Sending message to AgentForce server');
      
      // Store the user message
      this.lastUserMessage = message;
      
      const response = await axios.post<MessageResponse>(
        `${this.serverUrl}/api/messages`,
        {
          clientId: this.clientId,
          config: this.getClientConfig(),
          message
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey
          }
        }
      );
      
      // Store the agent response
      this.lastAgentResponse = response.data.text;
      
      logger.info('Message sent successfully');
      return response.data.text;
    } catch (error) {
      logger.error('Message sending failed', { error });
      throw new Error(`Message sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reset the client session
   */
  public async reset() {
    try {
      logger.info('Resetting client session');
      
      await axios.post(
        `${this.serverUrl}/api/reset`,
        {
          clientId: this.clientId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey
          }
        }
      );
      
      // Clear local message cache
      this.lastUserMessage = null;
      this.lastAgentResponse = null;
      
      logger.info('Client session reset successfully');
    } catch (error) {
      logger.error('Reset failed', { error });
      throw new Error(`Reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Singleton instance
export const agentForceClient = new AgentForceClient();