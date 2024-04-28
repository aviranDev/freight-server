import { Request, Response, NextFunction } from 'express';
import { logError } from "./logError";
import { CustomError } from "./mainService";
import { HTTP_STATUS } from '../config/httpStatus';

/**
 * Custom error class for handling conflict errors.
 * Extends the base CustomError class and sets the status code to 409 conflict.
 */
class ConflictError extends CustomError {
  constructor(message: string) {
    super(HTTP_STATUS.CONFLICT, message); // Setting status code and message for the error
    this.name = this.getStatusName(HTTP_STATUS.CONFLICT); // Setting the name of the error
  }
}

/**
 * Middleware for handling conflict errors.
 * 
 * @param {Error} err - The error being handled.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 */
const conflictMiddleware = (err: ConflictError, req: Request, res: Response, next: NextFunction): void => {
  try {
    // Check if the error is an instance of AuthorizationError
    if (err instanceof ConflictError) {
      const errorMessage = "Client request failed";

      // Log the conflict error with additional request details
      const errorDetails = `${errorMessage}: ${req.method} ${req.originalUrl}`;
      logError(err, errorDetails);

      // Respond to the client with a 409 conflict status and error details
      res.status(err.status).json({ message: err.message, error: err.errorResponse() });
      return;
    }

    // If the error is not an conflictErrorMiddleware, pass it to the next middleware.
    next(err);
  } catch (catchError) {
    // Express will automatically catch and pass errors to the error-handling middleware.
    next(catchError);
  }
}

export { conflictMiddleware, ConflictError };