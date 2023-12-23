import express, { Application } from "express";
import { configureMiddleware } from "./api/globalRoutes";
import { initializeDb } from "./db/initializeDb";
import { logger } from "./logger/logger";
import * as http from "http";

/**
 * @description Start the server and return the HTTP server instance.
 * @param {string | number} port - The port to listen on.
 * @returns {Promise<http.Server>} The HTTP server instance.
 */
async function startServer(port: string | number): Promise<http.Server> {
  // Create an Express application
  const app: Application = express();

  // Connect to MongoDB
  try {
    await initializeDb();
  } catch (error) {
    // Handle MongoDB connection error
    logger.error(`Failed to connect to MongoDB: ${error}`);
    throw error; // Propagate the error up to the caller
  }

  // Apply middleware to the Express application
  configureMiddleware(app);

  const runningHttpServer = await new Promise<http.Server>((resolve, reject) => {
    // Start the HTTP server and listen on the configured port
    const server = app.listen(port, () => {
      logger.info(`Server is running on port: ${port}`);
      resolve(server); // Resolve the Server instance
    });

    // Handle HTTP server errors, if any
    server.on("error", (err) => {
      logger.error(`Server error: ${err}`);
      reject(err); // Reject the promise on server error
    });
  });

  return runningHttpServer;
}

export { startServer };