import express, { Application, Router } from "express";
import cookieParser from "cookie-parser";
import morganMiddleware from "../logger/morgan";
import corsMiddleware from "../middlewares/corsMiddleware";
import { configureErrorHandlers } from '../errors/configHandlers';
import { configureSecurityHeaders } from '../helpers/securityHeaders';
import authRoutes from "../routes/auth";
import usersRoutes from "../routes/users";
import contactRouter from "../routes/contacts";
import airlineRouter from "../routes/airlines";
import scheduledJobs from '../routes/scheduled-jobs';
import agentRouter from '../routes/agents';
import { startCronJob } from "../utils/cronJob";
import cors from 'cors'
const api = Router(); // Create a sub-router for API routes
const allowedOrigins = ['http://localhost:5173'];
const corsOptions = {
  origin: allowedOrigins,
  credentials: true, // Enable sending credentials (e.g., cookies)
};

// Use CORS middleware
// Use consistent naming conventions for route paths and variables
api.use("/auth", authRoutes); // Use /auth for authentication routes
api.use("/users", usersRoutes); // Use /members for member-related routes
api.use("/contacts", contactRouter); // Use /contacts for contact-related routes
api.use("/airlines", airlineRouter); // Use /airlines for airline-related routes
api.use("/agents", agentRouter); // Use /agents for agents-related routes
api.use("/crons", scheduledJobs); // Use /agents for agents-related routes

/**
 * Configures middleware for the Express application.
*
* @param {Application} app - The Express application.
*/
function configureMiddleware(app: Application) {
  app.use(cors(corsOptions));
  app.use(express.json()); // Parse JSON request bodies
  app.use(cookieParser()); // Parse cookies
  app.use(morganMiddleware); // Use Morgan for request logging
  // app.use(corsMiddleware);  // Use the imported CORS middleware
  app.use("/api", api); // Use /api as the root path for the API

  // Start the Cron job for scheduled tasks (development mode only)
  startCronJob();

  // Configure error handling middleware
  configureErrorHandlers(app);

  // Configure security headers
  configureSecurityHeaders(app); // Document specific security measures if applicable
}

export { configureMiddleware };