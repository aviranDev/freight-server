import { CustomError } from "../services/mainService";
import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { logError } from "../tools/logError";
import AuthenticationError from "../services/authetication";

/**
 * Middleware for handling authentication errors.
 *
 * @param {Error} error - The error being handled.
 * @param {Request} request - Express request object.
 * @param {Response} response - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 */
const authenticationErrorMiddleware: ErrorRequestHandler = (
  error: CustomError,
  request: Request,
  response: Response,
  next: NextFunction
): void => {
  try {
    // Check if the error is an instance of AuthenticationError
    if (error instanceof AuthenticationError) {
      const errorMessage = "Login Failed";

      // Log the authentication error with additional request details
      const errorDetails = `${errorMessage}: ${request.method} ${request.originalUrl}`;
      logError(error, errorDetails);

      // Respond to the client with a 401 Unauthorized status and error details
      response.status(error.status).json({
        message: errorMessage,
        error: error.errorResponse(),
      });
      return;
    }

    // If the error is not an Authentication Error, pass it to the next middleware.
    next(error);
  } catch (catchError) {
    // Express will automatically catch and pass errors to the error-handling middleware.
    next(catchError);
  }
}

export default authenticationErrorMiddleware;