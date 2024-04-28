import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../config/httpStatus';
import { CustomError } from "./mainService";
import { logError } from "./logError";

/**
 * Custom error class for handling authentication errors.
 * Extends the base CustomError class and sets the status code to 401 Unauthorized.
 */
class AuthenticationError extends CustomError {
  constructor(message: string) {
    super(HTTP_STATUS.UNAUTHORIZED, message); // Setting status code and message for the error
    this.name = this.getStatusName(HTTP_STATUS.UNAUTHORIZED); // Setting the name of the error
  }
}

/**
 * Middleware for handling authentication errors.
 * Logs authentication errors and sends an appropriate response to the client.
 * Passes other errors to the next middleware.
 *
 * @param {CustomError} err - The error being handled.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 */
const authenticationMiddleware = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {
  try {
    // Check if the error is an instance of AuthenticationError
    if (err instanceof AuthenticationError) {
      const errorMessage = "Authentication failed"; // Message to be logged and sent in response

      // Log the authentication error with additional request details
      const errorDetails = `${errorMessage}: ${req.method} ${req.originalUrl}`;
      logError(err, errorDetails);

      // Respond to the client with a 401 Unauthorized status and error details
      res.status(err.status).json({ message: err.message, error: err.errorResponse() });
      return; // Ensure a return statement is included here
    }

    // Pass the error to the next middleware if it's not an authentication error
    next(err);
  } catch (catchError) {
    // Express will automatically catch and pass errors to the error-handling middleware.
    next(catchError);
  }
}

export { authenticationMiddleware, AuthenticationError };