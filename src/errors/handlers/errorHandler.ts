import { logger } from "../../logger/logger";
import { CustomError } from "../services/mainService";
import { HTTP_STATUS } from '../../config/httpStatus';
import { Request, Response, NextFunction } from 'express';
import { logError } from "../tools/logError";
import UnknownError from "../services/unknown";

/**
 * Error handling middleware responsible for logging errors and sending appropriate responses.
 *
 * This middleware logs detailed error information and responds to clients with the appropriate error status code and message.
 * @param {Error} err - The error object.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next function.
 */
const errorHandler = function (err: CustomError, req: Request, res: Response, next: NextFunction): void {
  try {
    // Handle Resource Not Found (404) Error
    if (err instanceof UnknownError) {
      const errorDetails = `Resource not found: ${req.method} ${req.originalUrl}`;

      // Log error details
      logError(err, errorDetails);

      // Respond with the appropriate status code, message, and error details
      res.status(err.status).json({
        message: err.name,
        error: err.errorResponse()
      });
      return;
    }

    // Handle Unexpected Errors with a generic message
    // Log unexpected errors with a generic message
    logError(err, `Internal Server Error: Unexpected Error:${req.method} ${req.originalUrl}`);

    // Create a generic unexpected error response
    const unexpectedError = new CustomError(HTTP_STATUS.INTERNAL_SERVER_ERROR, `Unexpected Error.`);

    // Respond with the appropriate status code and error details for unexpected errors
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: "Internal error server",
      error: unexpectedError.errorResponse()
    });
  } catch (error) {
    // Handle any errors that might occur during the response generation
    logger.error("Error in errorHandler:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      error: {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        name: "Internal Server Error",
        message: "An unexpected error occurred while processing the request.",
      },
    });
  }
}

// Export the middlewares functions
export { errorHandler };