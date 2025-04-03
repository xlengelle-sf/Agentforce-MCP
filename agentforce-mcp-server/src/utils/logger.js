import winston from 'winston';
import config from '../config/config.js';

// Define the custom format
const logFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let meta = '';
  if (Object.keys(metadata).length > 0) {
    meta = JSON.stringify(metadata);
  }
  return `${timestamp} [${level.toUpperCase()}]: ${message} ${meta}`;
});

const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    logFormat
  ),
  defaultMeta: { service: 'agentforce-server' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: `${config.logging.logsDir}/error.log`, 
      level: 'error' 
    }),
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: `${config.logging.logsDir}/combined.log` 
    })
  ]
});

// If we're not in production, log to the console with colors
if (config.server.env !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      logFormat
    )
  }));
}

// Create a stream object for Morgan middleware
logger.stream = {
  write: function(message) {
    logger.info(message.trim());
  }
};

export default logger;