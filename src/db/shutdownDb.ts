import { logger } from "../logger/logger";
import { Server } from "http";
import { closeDbConnection } from "./connectDb";

/**
 * Configures graceful shutdown handling for the server process.
 * @param {Server} server - The HTTP server instance.
 */
function configureGracefulShutdown(server: Server): void {
  // Handle SIGINT (Ctrl+C) and SIGTERM signals
  process.on("SIGINT", () => {
    handleShutdown("SIGINT", server);
  });
  process.on("SIGTERM", () => {
    handleShutdown("SIGTERM", server);
  });

  /**
   * Handles the graceful shutdown process when a signal is received.
   * @param {string} signal - The signal received (e.g., SIGINT, SIGTERM).
   * @param {Server} server - The HTTP server instance.
   */
  function handleShutdown(signal: string, server: Server): void {
    logger.info(`Received ${signal}. Closing server and shutting down...`);
    gracefulShutdown(server);
  }
}

/**
 * Performs a graceful shutdown of the server and associated resources.
 * @param {Server} server - The HTTP server instance.
 */
async function gracefulShutdown(server: Server): Promise<void> {
  try {
    logger.info("Shutting down gracefully..."); // Log the start of graceful shutdown
    await closeDbConnection(); // Close the database connection
    server.close(() => {
      logger.info("Server has been shut down."); // Log server shutdown
      process.exit(0); // Exit the process with status code 0 (success)
    });
  } catch (error) {
    logger.error("Error during graceful shutdown:", error); // Log any error during shutdown
    process.exit(1); // Exit the process with status code 1 (failure)
  }
}

export { configureGracefulShutdown };