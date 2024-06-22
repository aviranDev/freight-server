import Config from "./Config"; // Import the generic Config class
import handleServerConfiguration from './configHandler'; // Import the function for handling server configuration
import dotenv from "dotenv"; // Import the dotenv package to load environment variables
dotenv.config(); // Load environment variables from a .env file (if present)

// Define interface for server configuration options
interface ServerConfigOptions {
  PORT: number;
  SALT: number;
  ROLES: Record<string, string>;
  PORT_NAMES: Record<string, string>;
  FLOORS: {
    FLOOR1: number;
    FLOOR2: number;
    FLOOR3: number;
  };
  CORS_ORIGIN: string;
  TOKENS: {
    ACCESS_TOKEN_EXPIRE: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_EXPIRE: string;
    REFRESH_TOKEN_SECRET: string;
  };
}

// Define server configuration options based on environment variables with defaults
const configOptions: ServerConfigOptions = {
  PORT: Number(process.env.PORT || 8181),
  SALT: Number(process.env.SALT) || 5,
  ROLES: {
    ROLE1: process.env.ROLE1 || "",
    ROLE2: process.env.ROLE2 || "",
    ROLE3: process.env.ROLE3 || "",
  },
  PORT_NAMES: {
    PORT_NAME_1: process.env.PORT_NAME_1 || "",
    PORT_NAME_2: process.env.PORT_NAME_2 || "",
  },
  FLOORS: {
    FLOOR1: Number(process.env.FLOOR1) || 0,
    FLOOR2: Number(process.env.FLOOR2) || 0,
    FLOOR3: Number(process.env.FLOOR3) || 0,
  },
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173/", // Default CORS origin
  TOKENS: {
    ACCESS_TOKEN_EXPIRE: process.env.ACCESS_TOKEN_EXPIRE || "",
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "",
    REFRESH_TOKEN_EXPIRE: process.env.REFRESH_TOKEN_EXPIRE || "",
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "",
  },
};

// Class for managing server configuration based on provided options
export class ServerConfig extends Config<ServerConfigOptions> {
  public readonly config: ServerConfigOptions;

  constructor(config: ServerConfigOptions) {
    super(config);
    this.config = config;
  }
}

// Export the server configuration after handling configuration
export const serverConfig = handleServerConfiguration(configOptions, ServerConfig);