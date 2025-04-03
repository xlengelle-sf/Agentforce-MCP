declare module '@modelcontextprotocol/sdk' {
  export enum ContentType {
    Text = 'text',
    Image = 'image',
    JSON = 'json',
    HTML = 'html',
    Markdown = 'markdown'
  }

  export enum TransportProtocol {
    STDIO = 'stdio',
    HTTP_SSE = 'http-sse'
  }

  export interface SchemaObject {
    [key: string]: any;
  }

  export interface RequestSchema<T = any> {
    type: string;
    parse(data: any): T;
  }

  export const ListResourcesRequestSchema: RequestSchema;
  export const ListToolsRequestSchema: RequestSchema;
  export const CallToolRequestSchema: RequestSchema;

  export interface ServerOptions {
    name: string;
    version: string;
    vendor: string;
    protocolVersion: string;
    description: string;
    capabilities: {
      supportsNotifications: boolean;
      supportsProgress: boolean;
      supportsMultipart: boolean;
      maxRequestSize: number;
      supportsCancellation: boolean;
    };
  }

  export interface HttpServerTransportOptions {
    port: number;
    protocol: TransportProtocol;
  }

  export class MCPServer {
    constructor(options: ServerOptions);
    setRequestHandler<T, R>(schema: RequestSchema<T>, handler: (request: T) => Promise<R>): void;
    start(transport: StdioServerTransport | HttpServerTransport): Promise<void>;
    stop(): Promise<void>;
  }

  export class StdioServerTransport {
    constructor();
  }

  export class HttpServerTransport {
    constructor(options: HttpServerTransportOptions);
  }
}