import express, { Application, Router, Response, Request } from "express";
import cookieParser from "cookie-parser";
import morganMiddleware from "../logger/morgan";
import corsMiddleware from "../middlewares/corsMiddleware";
import { configureErrorHandlers } from '../errors/handlers/configHandlers';
import { configureSecurityHeaders } from '../helpers/securityHeaders';
import authRoutes from "../routes/auth";
import usersRoutes from "../routes/users";
import contactRouter from "../routes/contacts";
import airlineRouter from "../routes/airlines";
import agentRouter from '../routes/agents';
import { startCronJob } from "../utils/cronJob";
import Session from "../Models/Session";
import { logger } from "../logger/logger";
const api = Router(); // Create a sub-router for API routes

// Use consistent naming conventions for route paths and variables
api.use("/auth", authRoutes); // Use /auth for authentication routes
api.use("/users", usersRoutes); // Use /members for member-related routes
api.use("/contacts", contactRouter); // Use /contacts for contact-related routes
api.use("/airlines", airlineRouter); // Use /airlines for airline-related routes
api.use("/agents", agentRouter); // Use /agents for agents-related routes

const yourCronTaskHandler = async (req: Request, res: Response) => {
  try {
    // Calculate the expiration date to identify records older than 7 days
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() - 10);

    // Remove active sessions older than the calculated expirationDate
    await Session.deleteMany({ lastLogin: { $lte: expirationDate } });

    // Log a debug message indicating successful execution of the cron task
    logger.debug('Cron task to remove expired refresh tokens ran at: ' + new Date().toLocaleString());

    // Respond with a success message
    res.status(200).json({ message: 'Cron task executed successfully!' });
  } catch (error) {
    // Log an error message if an error occurs during the cron task execution
    logger.error('Error in Cron task:', error);

    // Respond with an error status and message
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

api.get("/cron-job", yourCronTaskHandler); // Use /agents for agents-related routes


function configureMiddleware(app: Application) {
  app.use(express.json()); // Parse JSON request bodies
  app.use(cookieParser()); // Parse cookies
  app.use(morganMiddleware); // Use Morgan for request logging
  app.use(corsMiddleware);  // Use the imported CORS middleware
  app.use("/api", api); // Use /api as the root path for the API

  // Start the Cron job by calling the function from the module
  startCronJob();

  // Configure error handling middleware
  configureErrorHandlers(app);

  // Configure security headers
  configureSecurityHeaders(app); // Document specific security measures if applicable
}

export { configureMiddleware };