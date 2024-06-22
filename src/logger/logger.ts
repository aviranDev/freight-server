import winston from 'winston';

// Regular expression to strip ANSI color codes
const stripAnsi = (str: string) => str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

// Custom format to apply the stripAnsi function to log messages
const stripAnsiFormat = winston.format((info) => {
  info.message = stripAnsi(info.message); // Strip ANSI color codes from the message
  return info;
})();

/**
 * Create separate formats for file and console transports
 */

// Format for file transports: includes timestamp, strips ANSI codes, and outputs JSON
const fileFormat = winston.format.combine(
  winston.format.timestamp(),  // Add a timestamp to each log entry
  stripAnsiFormat,  // Apply the custom format to strip ANSI codes
  winston.format.json()  // Output logs in JSON format
);

// Format for console transports: includes colorization and simple formatting
const consoleFormat = winston.format.combine(
  winston.format.colorize(),  // Apply colorization for console output
  winston.format.simple()  // Output logs in a simple, human-readable format
);

// Create the logger with specified level and format for file transports
const logger = winston.createLogger({
  level: 'debug',  // Set the log level to 'debug' (captures 'debug' and higher levels)
  format: fileFormat,  // Use the file format defined above
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error', // Only logs of 'error' level will be written to this file
    }),
    // Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({
      filename: 'logs/combined.log', // All logs of 'info' and lower levels will be written here
    }),
  ],
});

// Conditionally add console transport for development
if (process.argv.includes('--development')) {
  logger.add(new winston.transports.Console({
    format: consoleFormat, // Use the console format defined above
  }));
}

// Export the logger instance for use in other parts of the application
export { logger }; 