// MCP compliant tool definitions
export const toolDefinitions = [
  {
    name: "agentforce_configure_server",
    description: "Configure the AgentForce MCP server connection",
    inputSchema: {
      type: "object",
      properties: {
        serverUrl: {
          type: "string",
          description: "The URL of the AgentForce MCP server"
        },
        apiKey: {
          type: "string",
          description: "The API key for authenticating with the server"
        }
      },
      required: ["serverUrl"]
    },
    examples: [
      {
        name: "Configure local server",
        inputs: {
          serverUrl: "http://localhost:3000"
        }
      },
      {
        name: "Configure remote server with API key",
        inputs: {
          serverUrl: "https://agentforce-mcp.example.com",
          apiKey: "your-api-key"
        }
      }
    ]
  },
  {
    name: "agentforce_get_last_response",
    description: "Get the last message exchange with the AgentForce agent",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "agentforce_authenticate",
    description: "Authenticate with the AgentForce API using configured credentials",
    inputSchema: {
      type: "object",
      properties: {
        clientEmail: {
          type: "string",
          description: "Optional: Override the client email for authentication"
        }
      },
      required: []
    },
    examples: [
      {
        name: "Authenticate with default credentials",
        inputs: {}
      },
      {
        name: "Authenticate with specific email",
        inputs: {
          clientEmail: "user@example.com"
        }
      }
    ]
  },
  {
    name: "agentforce_create_session",
    description: "Create a new session with the AgentForce agent",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "agentforce_send_message",
    description: "Send a message to the AgentForce agent and get a response",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "The message to send to the agent"
        }
      },
      required: ["message"]
    },
    examples: [
      {
        name: "Ask a question",
        inputs: {
          message: "What can you help me with today?"
        }
      }
    ]
  },
  {
    name: "agentforce_get_status",
    description: "Get the current status of the AgentForce client connection",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "agentforce_reset",
    description: "Reset the AgentForce client connection (clear token and session)",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "agentforce_update_config",
    description: "Update the AgentForce client configuration",
    inputSchema: {
      type: "object",
      properties: {
        // Salesforce configuration
        agentId: {
          type: "string",
          description: "The ID of the AgentForce agent"
        },
        clientEmail: {
          type: "string",
          format: "email",
          description: "The email to use for authentication"
        },
        clientId: {
          type: "string",
          description: "The client ID for authentication"
        },
        clientSecret: {
          type: "string",
          description: "The client secret for authentication"
        },
        apiBaseUrl: {
          type: "string",
          format: "uri",
          description: "The base URL for the Salesforce API"
        },
        apiUrl: {
          type: "string",
          format: "uri",
          description: "The URL for the Salesforce API (usually https://api.salesforce.com)"
        },
        
        // Server configuration
        serverUrl: {
          type: "string",
          format: "uri",
          description: "The URL of the AgentForce MCP server"
        },
        apiKey: {
          type: "string",
          description: "The API key for authenticating with the server"
        },
        
        // Tool configuration
        logLevel: {
          type: "string",
          enum: ["debug", "info", "warn", "error"],
          description: "The logging level (debug, info, warn, error)"
        }
      },
      required: []
    },
    examples: [
      {
        name: "Update Salesforce credentials",
        inputs: {
          agentId: "your-agent-id",
          clientId: "your-client-id",
          clientSecret: "your-client-secret",
          clientEmail: "your-email@example.com"
        }
      },
      {
        name: "Update server connection",
        inputs: {
          serverUrl: "https://new-server-url.com",
          apiKey: "new-api-key"
        }
      }
    ]
  }
];