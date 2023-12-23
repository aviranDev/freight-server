import dotenv from "dotenv"; // Import the dotenv package to load environment variables
import { logger } from "../logger/logger"; // Import the logger module for logging errors
import { EnvironmentVariableError } from "../errors/services/enviromentVariable"; // Import a custom error class for handling missing environment variables
dotenv.config(); // Load environment variables from a .env file (if present)

// Define an interface for general environment variables
interface GeneralENV {
  PORT: number; // The local server port
  SALT: string; // Salt used for hashing passwords
  ROLE1: string; // Configuration for Role 1
  ROLE2: string; // Configuration for Role 2
  ROLE3: string; // Configuration for Role 3
  PORT_NAME_1: string; // Configuration for Role 3
  PORT_NAME_2: string; // Configuration for Role 3
  FLOOR1: string;
  FLOOR2: string;
  FLOOR3: string;
};

// Define an interface for token-related configuration
interface ITokenConfig {
  ACCESS_TOKEN_EXPIRE: string; // Secret key for access token expiration
  ACCESS_TOKEN_SECRET: string; // Secret key for access token generation
  REFRESH_TOKEN_EXPIRE: string; // Secret key for refresh token expiration
  REFRESH_TOKEN_SECRET: string; // Secret key for refresh token generation
}

// Define a class for managing server configuration
export class ServerConfig {
  public readonly config: GeneralENV; // Server configuration options
  public readonly origins: string; // Allowed CORS origins
  public readonly tokens: ITokenConfig; // Token-related configuration options

  // Constructor to initialize server configuration from environment variables
  constructor() {
    this.config = this.getServerConfig(); // Load server configuration
    this.origins = this.loadAllowedOrigins(); // Load allowed CORS origins
    this.tokens = this.loadTokenConfig(); // Load token-related configuration
  }

  // Private method to get the server configuration
  private getServerConfig(): GeneralENV {
    const defaultPort = 8181; // Default server port if not provided in environment variables

    // Define the server configuration options by reading from environment variables or using defaults.
    const options = {
      PORT: Number(process.env.PORT || defaultPort), // Get the server port as a number or use the default
      SALT: process.env.SALT || "", // Get the salt for password hashing or use an empty string
      ROLE1: process.env.ROLE1 || "", // Get configuration for Role 1 or use an empty string
      ROLE2: process.env.ROLE2 || "", // Get configuration for Role 2 or use an empty string
      ROLE3: process.env.ROLE3 || "", // Get configuration for Role 3 or use an empty string
      PORT_NAME_1: process.env.PORT_NAME_1 || "", // Get configuration for port_name or use an empty string
      PORT_NAME_2: process.env.PORT_NAME_2 || "", // Get configuration for port_name or use an empty string
      FLOOR1: process.env.FLOOR1 || "", // Get configuration for floor or use an empty string
      FLOOR2: process.env.FLOOR2 || "", // Get configuration for floor or use an empty string
      FLOOR3: process.env.FLOOR3 || "", // Get configuration for floor or use an empty string
    }

    this.throwIfMissingKeys(options); // Check for missing keys and throw an error if any are missing
    return options;
  }

  // Private method to load allowed CORS origins
  private loadAllowedOrigins(): any {
    // Define CORS origin options by reading from environment variables or using empty strings.
    const options = {
      CORS_ORIGIN_1: process.env.CORS_ORIGIN_1 as string || "http://localhost/"
    }

    this.throwIfMissingKeys(options); // Check for missing keys and throw an error if any are missing
    return options;
  }

  // Private method to load token-related configuration
  private loadTokenConfig(): ITokenConfig {
    // Define token configuration options by reading from environment variables or using empty strings.
    const options = {
      ACCESS_TOKEN_EXPIRE: process.env.ACCESS_TOKEN_EXPIRE || "",
      ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "",
      REFRESH_TOKEN_EXPIRE: process.env.REFRESH_TOKEN_EXPIRE || "",
      REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "",
    }

    this.throwIfMissingKeys(options); // Check for missing keys and throw an error if any are missing
    return options;
  }

  // Private method to validate and throw errors for missing keys
  private throwIfMissingKeys(options: Record<string, string | number>): void {
    // Filter and identify missing keys
    const missingKeys = Object.entries(options)
      .filter(([_, value]) => !value)
      .map(([key]) => key)
      .join(", ");

    if (missingKeys) {
      throw new EnvironmentVariableError(`${missingKeys}`); // Throw an error if any keys are missing
    }
  }
}

// Function to handle server configuration and potential errors
const handleServerConfiguration = (): ServerConfig => {
  try {
    const config = new ServerConfig();
    return config;
  } catch (error) {
    logger.error(error); // Log the error using the logger module
    process.exit(1); // Terminate the process with an exit code of 1 (indicating an error)
  }
}

// Initialize server configuration by creating an instance of ServerConfig
export const { config, origins, tokens } = handleServerConfiguration(); // Export the configuration options