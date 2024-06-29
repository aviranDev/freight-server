import { startServer } from "./server";
import { configureGracefulShutdown } from "./db/shutdownDb";
import { logger } from "./logger/logger";
import { serverConfig } from "./config/serverConfiguration";
const { PORT } = serverConfig.config;

/**
 * Main application entry point.
 * This function is responsible for starting the application by setting up the server,
 * handling graceful shutdown, and logging errors if any.
 */
export async function main(): Promise<void> {
  try {
    // Get the configured port for the server from the 'config' object
    const port = PORT;

    // Start the server and get the server instance
    const server = await startServer(port);

    // Configure graceful shutdown to handle SIGINT and SIGTERM signals
    configureGracefulShutdown(server);
  } catch (error) {
    // Handle any errors that occur during the application startup
    logger.error("Error starting the server:", error);

    // Exit the process with a non-zero status code to indicate an error
    process.exit(1);
  }
}

// Start the application by calling the main function
main().catch(error => {
  logger.error("Unhandled error in main function:", { error });
  process.exit(1);
});