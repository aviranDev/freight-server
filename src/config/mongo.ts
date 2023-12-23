import dotenv from "dotenv"; // Import the dotenv package for managing environment variables
import { EnvironmentVariableError } from "../errors/services/enviromentVariable"; // Import a custom error class for handling missing environment variables
import { logger } from "../logger/logger"; // Import the logger module for logging errors

dotenv.config(); // Load environment variables from a .env file (if present)

// Define an interface for MongoDB connection options
interface IMongo {
  localDb: string; // Connection string for the local MongoDB database
  externalDb: string; // Connection string for an external MongoDB database (e.g., Atlas)
}

// Define environment options for production and development environments
interface EnvironmentOptions {
  "--production": {
    ATLAS_USERNAME: string; // Username for Atlas MongoDB
    ATLAS_PASSWORD: string; // Password for Atlas MongoDB
    ATALS_CONNECTION: string; // Atlas MongoDB connection string
    ATALS_DB: string; // Atlas MongoDB database name
  };
  "--development": {
    LOCAL_DB: string; // Local MongoDB database name
    LOCAL_DB_PORT: string; // Local MongoDB database port
  };
}

// Define a type for the environment (either '--production' or '--development')
type EnvironmentType = '--production' | '--development';

// Create a class for managing MongoDB configuration
export class MongoDBConfigClass {
  private readonly config: IMongo; // MongoDB connection options
  private readonly env: EnvironmentType; // Current environment type ('--production' or '--development')

  constructor() {
    const envOptions: EnvironmentOptions = {
      "--production": {
        ATLAS_USERNAME: process.env.ATLAS_USERNAME || "", // Get Atlas username or use an empty string
        ATLAS_PASSWORD: process.env.ATLAS_PASSWORD || "", // Get Atlas password or use an empty string
        ATALS_CONNECTION: process.env.ATALS_CONNECTION || "", // Get Atlas connection string or use an empty string
        ATALS_DB: process.env.ATALS_DB || "", // Get Atlas connection string or use an empty string
      },
      "--development": {
        LOCAL_DB: process.env.LOCAL_DB || "", // Get the local database name or use an empty string
        LOCAL_DB_PORT: process.env.LOCAL_DB_PORT || "", // Get the local database port or use an empty string
      }
    };

    this.env = (process.argv[2] as EnvironmentType) || "--development"; // Get the current environment or default to '--development'

    this.config = {
      localDb: this.buildLocalDbConnection(envOptions["--development"]), // Build the local MongoDB connection string
      externalDb: this.buildExternalDbConnection(envOptions["--production"]), // Build the external MongoDB connection string
    };
    this.validateEnvironmentVariables(this.env, envOptions); // Check for missing environment variables
  }

  // Private method to validate environment variables
  private validateEnvironmentVariables(env: EnvironmentType, envOptions: EnvironmentOptions): void {
    const missingKeys = Object.entries(envOptions[env])
      .filter(([_, value]) => !value)
      .map(([key]) => key)
      .join(", ");

    if (missingKeys) {
      throw new EnvironmentVariableError(`On ${env}: ${missingKeys}`); // Throw an error for missing keys
    }
  }

  // Private method to build the local MongoDB connection string
  private buildLocalDbConnection(envOptions: EnvironmentOptions["--development"]): string {
    const { LOCAL_DB, LOCAL_DB_PORT } = envOptions;
    return `mongodb://${LOCAL_DB_PORT}/${LOCAL_DB}`;
  }

  // Private method to build the external MongoDB connection string (Atlas)
  private buildExternalDbConnection(envOptions: EnvironmentOptions["--production"]): string {
    const { ATLAS_USERNAME, ATLAS_PASSWORD, ATALS_CONNECTION, ATALS_DB } = envOptions;
    return `mongodb+srv://${ATLAS_USERNAME}:${ATLAS_PASSWORD}@${ATALS_CONNECTION}/${ATALS_DB}`;
  }

  // Public method to get the MongoDB configuration
  public getMongoConfig(): IMongo {
    return this.config;
  }
}

// Function to handle MongoDB configuration and potential errors
const handleDatabaseConfiguration = (): IMongo => {
  try {
    const config = new MongoDBConfigClass();
    return config.getMongoConfig();
  } catch (error) {
    logger.error(`Error handling database configuration: ${error}`);
    process.exit(1); // Terminate the process with an exit code of 1 (indicating an error)
  }
}

// Export the MongoDB connection options
export const { localDb, externalDb } = handleDatabaseConfiguration(); 