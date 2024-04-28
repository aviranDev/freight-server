import { Request, Response, NextFunction } from 'express';
import { logError } from "./logError";
import { CustomError } from "./mainService";
import { HTTP_STATUS } from '../config/httpStatus';

/**
 * Custom error class for handling conflict errors.
 * Extends the base CustomError class and sets the status code to 409 conflict.
 */
class ValidationError extends CustomError {
  /**
* Creates an instance of ValidationError.
* @param {string} message - The error message associated with the user validation errors.
*/
  constructor(message: string) {
    // Call the constructor of the base class (CustomError) with the status code and message.
    super(HTTP_STATUS.BAD_REQUEST, message);

    // Set the name of the error to match the HTTP status name (e.g., 'validation').
    this.name = this.getStatusName(HTTP_STATUS.BAD_REQUEST);
  }
}

/**
 * Middleware for handling unknown routes by generating a 404 "Not Found" error response.
 *
 * This middleware is responsible for handling requests to routes that do not match any defined routes.
 *
 * @param {Request} request - The Express request object.
 * @param {Response} response - The Express response object.
 * @param {NextFunction} next - The Express next function.
 */
const validationMiddleware = (
  error: ValidationError,
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  try {
    // Check if the error is an instance of AuthorizationError
    // Log the authentication error with additional request details
    if (error instanceof ValidationError) {
      const errorMessage = "Validation Failed";

      // Log the validation error with additional request details
      const errorDetails = `${errorMessage}: ${request.method} ${request.originalUrl}`;
      logError(error, errorDetails);

      // Respond to the client with a 401 Unauthorized status and error details
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

export { ValidationError, validationMiddleware };