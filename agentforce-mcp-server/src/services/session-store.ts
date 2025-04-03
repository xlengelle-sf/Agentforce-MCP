import { AgentForceService, AgentForceConfig } from './agentforce.js';
import logger from '../utils/logger.js';

// Interface for a stored session
interface StoredSession {
  service: AgentForceService;
  config: AgentForceConfig;
  lastAccess: number;
}

/**
 * Session store for managing AgentForce client sessions
 */
export class SessionStore {
  private sessions: Map<string, StoredSession> = new Map();
  private expirationTimeMs: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(expirationTimeMs: number = 60 * 60 * 1000) { // 1 hour by default
    this.expirationTimeMs = expirationTimeMs;
    this.startCleanupTask();
  }

  /**
   * Get or create a session for a client
   */
  getOrCreateSession(clientId: string, config: AgentForceConfig): AgentForceService {
    const now = Date.now();

    // Check if session exists
    if (this.sessions.has(clientId)) {
      const session = this.sessions.get(clientId)!;
      
      // Update last access time
      session.lastAccess = now;
      
      // If config has changed, create a new service
      if (JSON.stringify(session.config) !== JSON.stringify(config)) {
        logger.info(`Configuration changed for client ${clientId}, creating new service`);
        const service = new AgentForceService(config);
        this.sessions.set(clientId, { service, config, lastAccess: now });
        return service;
      }
      
      return session.service;
    }

    // Create new session
    logger.info(`Creating new AgentForce service for client ${clientId}`);
    const service = new AgentForceService(config);
    this.sessions.set(clientId, { service, config, lastAccess: now });
    return service;
  }

  /**
   * Get a session if it exists
   */
  getSession(clientId: string): AgentForceService | null {
    const session = this.sessions.get(clientId);
    
    if (session) {
      // Update last access time
      session.lastAccess = Date.now();
      return session.service;
    }
    
    return null;
  }

  /**
   * Delete a session
   */
  deleteSession(clientId: string): boolean {
    return this.sessions.delete(clientId);
  }

  /**
   * Clear all sessions
   */
  clearAll(): void {
    // Reset all sessions before clearing
    for (const [clientId, session] of this.sessions.entries()) {
      try {
        session.service.reset();
      } catch (error) {
        logger.warn(`Error resetting service for client ${clientId}`, { error });
      }
    }
    
    // Clear the map
    this.sessions.clear();
    logger.info('All sessions cleared');
  }

  /**
   * Start session cleanup task
   */
  private startCleanupTask() {
    // Clean up expired sessions every 15 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 15 * 60 * 1000);
  }

  /**
   * Stop the cleanup task
   */
  stopCleanupTask() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      logger.debug('Session cleanup task stopped');
    }
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions() {
    const now = Date.now();
    let cleanupCount = 0;
    
    for (const [clientId, session] of this.sessions.entries()) {
      if (now - session.lastAccess > this.expirationTimeMs) {
        // Reset the session before removing it
        try {
          session.service.reset();
        } catch (error) {
          logger.warn(`Error resetting service for client ${clientId} during cleanup`, { error });
        }
        this.sessions.delete(clientId);
        cleanupCount++;
      }
    }
    
    if (cleanupCount > 0) {
      logger.info(`Cleaned up ${cleanupCount} expired client sessions`);
    }
  }

  /**
   * Get session count
   */
  getSessionCount(): number {
    return this.sessions.size;
  }
}

// Export singleton instance
export const sessionStore = new SessionStore();