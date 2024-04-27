import { Request, Response, NextFunction } from 'express';
import { logger } from "../../logger/logger";
import ManyRequests from '../services/manyRequest';

/**
 * Middleware for handling too many requests errors (HTTP status code 429).
 * 
 * @param {Error} error - The error being handled.
 * @param {Request} request - Express request object.
 * @param {Response} response - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 */
const manyRequestsMiddleware = (error: ManyRequests, request: Request, response: Response, next: NextFunction): void => {
  try {
    // Check if the error is an instance of ManyRequests.
    if (error instanceof ManyRequests) {

      // Log the too many requests error with additional request details
      logger.error(`${error.name} - ${error.message}`);

      // Respond to the client with a 429 too many requests status and error details
      response.status(error.status).json({
        message: error.message,
        error: error.errorResponse(),
      });
      return;
    }

    // If the error is not an instance of ManyRequests, pass it to the next middleware.
    next(error);
  } catch (catchError) {
    // Express will automatically catch and pass errors to the error-handling middleware.
    next(catchError);
  }
}

export { manyRequestsMiddleware }