import { connectDb } from "./connectDb";
import { localDb, externalDb } from "../config/mongo";
import { logger } from "../logger/logger";

/**
 * @description Initializes the database connection based on the current environment.
 * @returns {Promise<void>} A promise that resolves when the database is successfully initialized.
 */
export const initializeDb = async (): Promise<void> => {
  try {
    let dbUri: string;

    // Determine the database URI based on the NODE_ENV environment variable
    switch (process.argv[2]) {
      case "--development":
        dbUri = localDb;
        break;
      case "--production":
        dbUri = externalDb;
        break;
      default:
        throw new Error("Invalid NODE_ENV");
    }

    // Connect to the database using the determined URI
    await connectDb(dbUri);
  } catch (error) {
    // Handle and log any errors that occur during database initialization
    logger.error(`Failed to initialize the database: ${error}`);
    throw error;
  }
}