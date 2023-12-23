import mongoose from "mongoose";
import { logger } from "../logger/logger";

// Set global Mongoose options (optional)
mongoose.set("strictQuery", false);

/**
 * @description Connects to the MongoDB database using the provided URI.
 * @param {string} uri - The MongoDB connection URI.
 * @returns {Promise<void>} A promise that resolves when the connection is established.
 */
export async function connectDb(uri: string): Promise<void> {
  try {
    // Attempt to connect to the MongoDB database
    await mongoose.connect(uri);

    // Log a success message upon successful connection
    logger.info("Connected To MongoDB Locally.");
  } catch (error) {
    // Handle any errors that occur during the connection process
    throw error;
  }
}

/**
 * @description Closes the connection to the MongoDB database.
 * @returns {Promise<void>} A promise that resolves when the connection is closed.
 */
export async function closeDbConnection(): Promise<void> {
  try {
    // Attempt to close the MongoDB database connection
    await mongoose.connection.close();

    // Log a success message upon successful closure
    logger.info("MongoDB connection closed.");
  } catch (error) {
    // Handle any errors that occur during the closure process
    logger.error(`Error closing MongoDB connection: ${error}`);
    throw error;
  }
}