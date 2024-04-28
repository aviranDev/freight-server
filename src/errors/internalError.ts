import { Request, Response, NextFunction } from 'express';
import { logger } from "../logger/logger";
import { CustomError } from "./mainService";
import { HTTP_STATUS } from '../config/httpStatus';

/**
 * Custom error class for handling internal errors.
 * Extends the base CustomError class and sets the status code to 500 internal error.
 */
class InternalError extends CustomError {
  constructor(message: string) {
    super(HTTP_STATUS.INTERNAL_SERVER_ERROR, message);
    this.name = this.getStatusName(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * Middleware for handling internal errors.
 * 
 * @param {Error} err - The error being handled.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 */
const internalMiddleware = (err: InternalError, req: Request, res: Response, next: NextFunction): void => {
  try {
    // Check if the error is an instance of InternalError.
    if (err instanceof InternalError) {
      const errorMessage = "Internal error server";

      // Log the internal error with additional request details
      logger.error(`${errorMessage}: ${err.name} - ${err.message}`);

      // Respond to the client with a 500 internal error status and error details
      res.status(err.status).json({ message: err.message, error: err.errorResponse() });
      return;
    }

    // If the error is not an instance of InternalError, pass it to the next middleware.
    next(err);
  } catch (catchError) {
    // Express will automatically catch and pass errors to the error-handling middleware.
    next(catchError);
  }
}

export { internalMiddleware, InternalError }