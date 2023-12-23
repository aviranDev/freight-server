import { Request, Response, NextFunction } from 'express';
import { logger } from "../../logger/logger";
import InternalError from '../services/internalError';

/**
 * Middleware for handling internal errors.
 * 
 * @param {Error} error - The error being handled.
 * @param {Request} request - Express request object.
 * @param {Response} response - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 */
const internalErrorMiddleware = (
  error: InternalError,
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  try {
    // Check if the error is an instance of InternalError.
    if (error instanceof InternalError) {
      const errorMessage = "Internal error server";

      // Log the internal error with additional request details
      logger.error(`${errorMessage}: ${error.name} - ${error.message}`);

      // Respond to the client with a 500 internal error status and error details
      response.status(error.status).json({
        message: errorMessage,
        error: error.errorResponse(),
      });
      return;
    }

    // If the error is not an AuthenticationError, pass it to the next middleware.
    next(error);
  } catch (catchError) {
    // Express will automatically catch and pass errors to the error-handling middleware.
    next(catchError);
  }
}

export { internalErrorMiddleware }