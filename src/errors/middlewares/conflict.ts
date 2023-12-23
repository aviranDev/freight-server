import { Request, Response, NextFunction } from 'express';
import { logError } from "../tools/logError";
import ConflictError from "../services/conflict";

/**
 * Middleware for handling conflict errors.
 * 
 * @param {Error} error - The error being handled.
 * @param {Request} request - Express request object.
 * @param {Response} response - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 */
const conflictErrorMiddleware = (
  error: ConflictError,
  request: Request,
  response: Response,
  next: NextFunction
): void => {
  try {
    // Check if the error is an instance of AuthorizationError
    if (error instanceof ConflictError) {
      const errorMessage = "Client request failed";

      // Log the conflict error with additional request details
      const errorDetails = `${errorMessage}: ${request.method} ${request.originalUrl}`;
      logError(error, errorDetails);

      // Respond to the client with a 409 conflict status and error details
      response.status(error.status).json({
        message: errorMessage,
        error: error.errorResponse(),
      });
      return;
    }

    // If the error is not an conflictErrorMiddleware, pass it to the next middleware.
    next(error);
  } catch (catchError) {
    // Express will automatically catch and pass errors to the error-handling middleware.
    next(catchError);
  }
}

export { conflictErrorMiddleware };