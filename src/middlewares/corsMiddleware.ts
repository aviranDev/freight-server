import cors, { CorsOptions } from "cors";
import { serverConfig } from '../config/serverConfiguration';
const { CORS_ORIGIN } = serverConfig.config;

// Define CORS options using the 'CorsOptions' type
const corsOptions: CorsOptions = {
  // Specify the allowed origins for CORS (e.g., ["http://example.com"])
  origin: CORS_ORIGIN,

  // Specify the allowed HTTP methods for CORS
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",

  // Include credentials (e.g., cookies, HTTP authentication) in CORS requests
  credentials: true,
};

// Create and export the CORS middleware by invoking 'cors' with the defined options
const corsMiddleware = cors();

// Export the CORS middleware for use in other parts of the application
export default corsMiddleware;