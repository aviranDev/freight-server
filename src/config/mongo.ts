import handleConfiguration from "./configHandler"; // Import the function for handling configuration
import Config from "./Config"; // Import the generic Config class
import dotenv from "dotenv"; // Import dotenv for loading environment variables from a .env file
dotenv.config(); // Load environment variables from .env file if present

// Define interface for MongoDB configuration
export interface IMongo {
  localDb: string;
  externalDb: string;
}

// Define types for atlas environment options
type AtlasEnvironment = {
  ATLAS_USERNAME: string;
  ATLAS_PASSWORD: string;
  ATALS_CONNECTION: string;
  ATALS_DB: string;
};

// Define types for compass environment options
type DevelopmentEnvironment = {
  LOCAL_DB: string;
  LOCAL_DB_PORT: string;
};

// Define a union type for different environment options
export type EnvironmentOptions = {
  "--production": AtlasEnvironment;
  "--development": DevelopmentEnvironment;
};

// Function to retrieve environment variables with an optional default value
const getEnvironmentVariable = (key: string, defaultValue = ""): string => {
  return process.env[key] || defaultValue;
};

// Initialize environment options based on environment variables
export const envOptions: EnvironmentOptions = {
  "--production": {
    ATLAS_USERNAME: getEnvironmentVariable("ATLAS_USERNAME"),
    ATLAS_PASSWORD: getEnvironmentVariable("ATLAS_PASSWORD"),
    ATALS_CONNECTION: getEnvironmentVariable("ATALS_CONNECTION"),
    ATALS_DB: getEnvironmentVariable("ATALS_DB"),
  },
  "--development": {
    LOCAL_DB: getEnvironmentVariable("LOCAL_DB"),
    LOCAL_DB_PORT: getEnvironmentVariable("LOCAL_DB_PORT"),
  },
};

// Class for managing MongoDB configuration based on environment options
export class MongoDBConfigClass extends Config<EnvironmentOptions> {
  private readonly options: EnvironmentOptions;

  constructor(options: EnvironmentOptions) {
    super(options);
    this.options = options;
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

  // Getter method for dynamically constructing the MongoDB configuration
  get buildMongoConfig(): IMongo {
    const localDb = this.buildLocalDbConnection(this.options["--development"]);
    const externalDb = this.buildExternalDbConnection(this.options["--production"]);

    return { localDb, externalDb };
  }
}

// Export the MongoDB connection options after handling configuration
export const mongoConfig = handleConfiguration(envOptions, MongoDBConfigClass); 