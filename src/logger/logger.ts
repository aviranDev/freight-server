import { createLogger, transports, addColors, format } from 'winston';

const isProduction = process.argv[2] === '--production';

// Define custom colors
const customColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue'
};

// Set custom colors
addColors(customColors);

// Create a custom log format to minimize the log output
// Create a custom log format to minimize the log output
const customFormat = format.printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${message}${stack ? `\n${stack}` : ''}`;
});

// Create an array of transports based on conditions
const transportArray: transports.StreamTransportInstance[] = [
  new transports.Console({
    level: isProduction ? 'error' : 'debug', // Set level to 'error' in production
    format: format.combine(
      format.colorize(),
      format.simple(),
      format.timestamp(),
      customFormat
    ),
  }),
  ...(isProduction ? [] : [
    new transports.File({
      filename: `logs/api-${new Date().toISOString().split('T')[0]}.log`,
      level: 'info',
      format: format.combine(format.timestamp(), customFormat),
    }),
    new transports.File({
      filename: `logs/error-${new Date().toISOString().split('T')[0]}.log`,
      level: 'error',
      format: format.combine(format.timestamp(), customFormat),
    }),
  ]),
];

const logger = createLogger({
  // ... other configurations ...
  transports: transportArray,
});

export { logger };