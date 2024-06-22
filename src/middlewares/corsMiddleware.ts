import cors, { CorsOptions } from "cors";
import { serverConfig } from '../config/serverConfiguration';
const { CORS_ORIGIN } = serverConfig.config;

// Define CORS options using the 'CorsOptions' type
const corsOptions: CorsOptions = {
  // Specify the allowed origins for CORS (e.g., ["http://example.com"])
  origin: CORS_ORIGIN,


  // Include credentials (e.g., cookies, HTTP authentication) in CORS requests
  credentials: true,
};

// Create and export the CORS middleware by invoking 'cors' with the defined options
const corsMiddleware = cors(corsOptions);

// Export the CORS middleware for use in other parts of the application
export default corsMiddleware;