import morgan from 'morgan';
import { logger } from './logger';

// Create a stream object for Morgan to write log messages using the custom logger
const stream = {
  write: (message: string) => {
    try {
      // Log HTTP messages using the custom logger at the 'http' level
      logger.http(message);
    } catch (error) {
      // Handle any errors that occur during logging
      logger.error('Error writing to log stream:', error);
    }
  },
};

// Define a skip function to determine when to skip logging
const skip = () => {
  const env = process.argv[2];
  // Skip logging in production or non-development environments
  return env !== '--development';
};

// Create a Morgan middleware with the 'dev' format and the custom stream and skip function
const morganMiddleware = morgan('dev', { stream, skip });

export default morganMiddleware;