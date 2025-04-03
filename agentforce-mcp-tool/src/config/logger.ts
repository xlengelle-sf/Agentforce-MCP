import winston from 'winston';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Create logs directory if it doesn't exist
const logDir = path.join(os.homedir(), '.agentforce-mcp-tool', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'agentforce-mcp-tool' },
  transports: [
    // Write to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...rest }) => {
          return `${timestamp} ${level}: ${message} ${
            Object.keys(rest).length ? JSON.stringify(rest) : ''
          }`;
        })
      ),
    }),
    // Write to log file
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
    }),
  ],
});

export default logger;