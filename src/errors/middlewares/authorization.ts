import { Request, Response, NextFunction } from 'express';
import { logError } from "../tools/logError";
import AuthorizationError from '../services/authorization';

/**
 * Middleware for handling authentication errors.
 * 
 * @param {Error} error - The error being handled.
 * @param {Request} request - Express request object.
 * @param {Response} response - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 */
const authorizationErrorMiddleware = (
  error: AuthorizationError,
  request: Request,
  response: Response,
  next: NextFunction
): void => {
  try {
    // Check if the error is an instance of AuthorizationError
    if (error instanceof AuthorizationError) {
      const errorMessage = "Authorization Failed";

      // Log the authorization error with additional request details
      const errorDetails = `${errorMessage}: ${request.method} ${request.originalUrl}`;
      logError(error, errorDetails);

      // Respond to the client with a 403 Unauthorized status and error details
      response.status(error.status).json({
        message: errorMessage,
        error: error.errorResponse(),
      });
      return;
    }

    // If the error is not an authorizationError, pass it to the next middleware.
    next(error);
  } catch (catchError) {
    // Express will automatically catch and pass errors to the error-handling middleware.
    next(catchError);
  };
}

export { authorizationErrorMiddleware };