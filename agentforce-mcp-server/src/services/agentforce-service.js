import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

/**
 * Service to handle communication with the AgentForce API
 */
export class AgentForceService {
  /**
   * Create an instance of the AgentForce service
   * 
   * @param {Object} clientConfig - Configuration for this specific client
   */
  constructor(clientConfig) {
    this.config = clientConfig;
    this.accessToken = null;
    this.instanceUrl = null;
    this.sessionId = null;
    this.currentSequenceId = 0;
    
    logger.debug('AgentForce service initialized', {
      sfBaseUrl: this.config.sfBaseUrl,
      agentId: this.config.agentId,
      clientEmail: this.config.clientEmail
    });
  }
  
  /**
   * Get the current status of the service
   * 
   * @returns {Object} - Status information
   */
  getStatus() {
    return {
      isAuthenticated: !!this.accessToken,
      hasSession: !!this.sessionId,
      sessionId: this.sessionId,
      sequenceId: this.currentSequenceId,
      agentId: this.config.agentId,
      clientEmail: this.config.clientEmail
    };
  }
  
  /**
   * Authenticate with Salesforce to get access token
   * 
   * @returns {Promise<Object>} - Authentication result with access token and instance URL
   */
  async authenticate() {
    try {
      logger.info('Authenticating with Salesforce', { 
        email: this.config.clientEmail,
        sfBaseUrl: this.config.sfBaseUrl
      });
      
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', this.config.clientId);
      params.append('client_secret', this.config.clientSecret);
      params.append('client_email', this.config.clientEmail);
      
      const response = await axios.post(
        `${this.config.sfBaseUrl}/services/oauth2/token`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      
      this.accessToken = response.data.access_token;
      this.instanceUrl = response.data.instance_url;
      
      logger.info('Authentication successful', {
        instanceUrl: this.instanceUrl,
        tokenPreview: this.accessToken?.substring(0, 10) + '...'
      });
      
      return {
        accessToken: this.accessToken,
        instanceUrl: this.instanceUrl
      };
    } catch (error) {
      logger.error('Authentication failed', { 
        error: error.message,
        response: error.response?.data
      });
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }
  
  /**
   * Create a new session with the AgentForce agent
   * 
   * @returns {Promise<string>} - Session ID
   */
  async createSession() {
    if (!this.accessToken) {
      logger.warn('No authentication token, authenticating first');
      await this.authenticate();
    }
    
    try {
      logger.info('Creating new AgentForce session', { 
        agentId: this.config.agentId,
        instanceUrl: this.instanceUrl
      });
      
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
      
      this.sessionId = response.data.sessionId;
      this.currentSequenceId = 0;
      
      logger.info('Session created successfully', { sessionId: this.sessionId });
      return this.sessionId;
    } catch (error) {
      logger.error('Session creation failed', { 
        error: error.message,
        response: error.response?.data
      });
      throw new Error(`Session creation failed: ${error.message}`);
    }
  }
  
  /**
   * Send a message to the AgentForce agent
   * 
   * @param {string} message - The message to send to the agent
   * @returns {Promise<string>} - The agent's response
   */
  async sendMessage(message) {
    if (!this.sessionId) {
      logger.warn('No session ID, creating new session');
      await this.createSession();
    }
    
    if (!this.accessToken) {
      logger.warn('No authentication token, authenticating first');
      await this.authenticate();
    }
    
    try {
      this.currentSequenceId++;
      logger.info('Sending message to AgentForce', {
        sessionId: this.sessionId,
        sequenceId: this.currentSequenceId,
        messagePreview: message.substring(0, 50) + (message.length > 50 ? '...' : '')
      });
      
      const messagePayload = {
        message: {
          sequenceId: this.currentSequenceId,
          type: 'Text',
          text: message
        }
      };
      
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
      
      if (response.data.messages && response.data.messages.length > 0) {
        const agentResponse = response.data.messages[0].message;
        logger.info('Received response from AgentForce', {
          responsePreview: agentResponse.substring(0, 50) + (agentResponse.length > 50 ? '...' : '')
        });
        return {
          text: agentResponse,
          sequenceId: this.currentSequenceId
        };
      } else {
        throw new Error('No message in response');
      }
    } catch (error) {
      logger.error('Message sending failed', { 
        error: error.message,
        response: error.response?.data
      });
      throw new Error(`Message sending failed: ${error.message}`);
    }
  }
  
  /**
   * Reset the service (clear token and session)
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
 * Factory function to create a new AgentForce service
 * 
 * @param {Object} clientConfig - Configuration for this specific client
 * @returns {AgentForceService} - New AgentForce service instance
 */
export const createAgentForceService = (clientConfig) => {
  return new AgentForceService(clientConfig);
};