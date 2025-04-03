import { z } from 'zod';

// Schema for the client configuration
export const ClientConfigSchema = z.object({
  sfBaseUrl: z.string().url("Must be a valid Salesforce URL"),
  apiUrl: z.string().url("Must be a valid API URL"),
  agentId: z.string().min(1, "Agent ID is required"),
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client Secret is required"),
  clientEmail: z.string().email("Must be a valid email")
});

// Schema for authentication
export const AuthenticateSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  config: ClientConfigSchema
});

// Schema for session creation
export const CreateSessionSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  config: ClientConfigSchema
});

// Schema for sending a message
export const SendMessageSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  config: ClientConfigSchema,
  message: z.string().min(1, "Message is required")
});

// Schema for getting status
export const GetStatusSchema = z.object({
  clientId: z.string().min(1, "Client ID is required")
});

// Schema for resetting
export const ResetSchema = z.object({
  clientId: z.string().min(1, "Client ID is required")
});

// Export all schemas as a record
export const schemas = {
  authenticate: AuthenticateSchema,
  createSession: CreateSessionSchema,
  sendMessage: SendMessageSchema,
  getStatus: GetStatusSchema,
  reset: ResetSchema
};