import { Request, Response, NextFunction } from 'express';
import { logError } from "./logError";
import { CustomError } from "./mainService";
import { HTTP_STATUS } from '../config/httpStatus';

/**
 * Custom error class for handling authorization errors.
 * Extends the base CustomError class and sets the status code to 403 Forbidden.
 */
class AuthorizationError extends CustomError {
  constructor(message: string) {
    super(HTTP_STATUS.FORBIDDEN, message); // Setting status code and message for the error
    this.name = this.getStatusName(HTTP_STATUS.FORBIDDEN); // Setting the name of the error
  }
}

/**
 * Middleware for handling authentication errors.
 * 
 * @param {Error} err - The error being handled.
 * @param {Request} req - Express request object.
 * @param {Response} response - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 */
const authorizationMiddleware = (err: AuthorizationError, req: Request, response: Response, next: NextFunction): void => {
  try {
    // Check if the error is an instance of AuthorizationError
    if (err instanceof AuthorizationError) {
      const errorMessage = "Authorization Failed";

      // Log the authorization error with additional request details
      const errorDetails = `${errorMessage}: ${req.method} ${req.originalUrl}`;
      logError(err, errorDetails);

      // Respond to the client with a 403 Unauthorized status and error details
      response.status(err.status).json({ message: err.message, error: err.errorResponse() });
      return;
    }

    // If the error is not an authorizationError, pass it to the next middleware.
    next(err);
  } catch (catchError) {
    // Express will automatically catch and pass errors to the error-handling middleware.
    next(catchError);
  };
}

export { authorizationMiddleware, AuthorizationError };