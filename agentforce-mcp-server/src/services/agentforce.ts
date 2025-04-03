import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

// Interface for config received from the client
export interface AgentForceConfig {
  sfBaseUrl: string;
  apiUrl: string;
  agentId: string;
  clientId: string;
  clientSecret: string;
  clientEmail: string;
}

// Authentication response
export interface AuthResponse {
  accessToken: string;
  instanceUrl: string;
}

// Session response
export interface SessionResponse {
  sessionId: string;
}

// Message response
export interface MessageResponse {
  text: string;
  sequenceId: number;
}

/**
 * AgentForce service for interacting with the Salesforce AgentForce API
 */
export class AgentForceService {
  private config: AgentForceConfig;
  private accessToken: string | null = null;
  private instanceUrl: string | null = null;
  private sessionId: string | null = null;
  private currentSequenceId: number = 0;

  constructor(config: AgentForceConfig) {
    this.config = config;
    logger.debug('AgentForce service created', {
      agentId: this.config.agentId,
      clientEmail: this.config.clientEmail
    });
  }

  /**
   * Authenticate with Salesforce
   */
  async authenticate(): Promise<AuthResponse> {
    try {
      logger.info('Authenticating with Salesforce', {
        email: this.config.clientEmail,
        sfBaseUrl: this.config.sfBaseUrl
      });

      // Create form data
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', this.config.clientId);
      params.append('client_secret', this.config.clientSecret);
      params.append('client_email', this.config.clientEmail);

      // Make request
      const response = await axios.post(
        `${this.config.sfBaseUrl}/services/oauth2/token`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      // Store tokens
      this.accessToken = response.data.access_token;
      this.instanceUrl = response.data.instance_url;

      logger.info('Authentication successful', {
        instanceUrl: this.instanceUrl
      });

      return {
        accessToken: this.accessToken,
        instanceUrl: this.instanceUrl
      };
    } catch (error) {
      logger.error('Authentication failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        response: axios.isAxiosError(error) ? error.response?.data : undefined
      });
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a session with AgentForce
   */
  async createSession(): Promise<SessionResponse> {
    // Authenticate if we don't have a token
    if (!this.accessToken || !this.instanceUrl) {
      await this.authenticate();
    }

    try {
      logger.info('Creating AgentForce session', {
        agentId: this.config.agentId
      });

      // Create session payload
      const sessionPayload = {
        externalSessionKey: uuidv4(),
        instanceConfig: {
          endpoint: this.instanceUrl
        },
        streamingCapabilities: {
          chunkTypes: ['Text']
        },
        bypassUser: true
      };

      // Make request
      const response = await axios.post(
        `${this.config.apiUrl}/einstein/ai-agent/v1/agents/${this.config.agentId}/sessions`,
        sessionPayload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Store session ID
      this.sessionId = response.data.sessionId;
      this.currentSequenceId = 0;

      logger.info('Session created successfully', {
        sessionId: this.sessionId
      });

      return {
        sessionId: this.sessionId
      };
    } catch (error) {
      logger.error('Session creation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        response: axios.isAxiosError(error) ? error.response?.data : undefined
      });
      throw new Error(`Session creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send a message to AgentForce
   */
  async sendMessage(message: string): Promise<MessageResponse> {
    // Create session if we don't have one
    if (!this.sessionId) {
      await this.createSession();
    }

    // Authenticate if we don't have a token
    if (!this.accessToken) {
      await this.authenticate();
    }

    try {
      // Increment sequence ID
      this.currentSequenceId++;
      
      logger.info('Sending message to AgentForce', {
        sessionId: this.sessionId,
        sequenceId: this.currentSequenceId
      });

      // Create message payload
      const messagePayload = {
        message: {
          sequenceId: this.currentSequenceId,
          type: 'Text',
          text: message
        }
      };

      // Make request
      const response = await axios.post(
        `${this.config.apiUrl}/einstein/ai-agent/v1/sessions/${this.sessionId}/messages`,
        messagePayload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000 // 2-minute timeout
        }
      );

      // Extract response text
      let responseText = 'No response received';
      if (response.data.messages && response.data.messages.length > 0) {
        responseText = response.data.messages[0].message;
      }

      logger.info('Message sent successfully', {
        responseLength: responseText.length
      });

      return {
        text: responseText,
        sequenceId: this.currentSequenceId
      };
    } catch (error) {
      logger.error('Message sending failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        response: axios.isAxiosError(error) ? error.response?.data : undefined
      });
      throw new Error(`Message sending failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      isAuthenticated: !!this.accessToken,
      hasSession: !!this.sessionId,
      sessionId: this.sessionId,
      sequenceId: this.currentSequenceId,
      clientEmail: this.config.clientEmail,
      agentId: this.config.agentId
    };
  }

  /**
   * Reset service state
   */
  reset() {
    this.accessToken = null;
    this.instanceUrl = null;
    this.sessionId = null;
    this.currentSequenceId = 0;
    logger.info('AgentForce service reset');
  }
}

/**
 * Create a new AgentForce service
 */
export function createAgentForceService(config: AgentForceConfig): AgentForceService {
  return new AgentForceService(config);
}