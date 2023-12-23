import morgan from 'morgan';
import { logger } from './logger';

// Create a stream for Morgan to write log messages using the logger
const stream = {
  write: (message: string) => {
    try {
      logger.http(message);
    } catch (error) {
      // Handle any errors that occur when logging
      logger.error('Error writing to log stream:', error);
    }
  },
};

// Define a skip function based on the environment
const skip = () => {
  const env = process.argv[2];
  // Skip logging in production or other non--development environments
  return env !== '--development';
};

// Create a Morgan middleware with the 'dev' format
const morganMiddleware = morgan('dev', { stream, skip });

export default morganMiddleware;