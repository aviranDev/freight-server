import { Request, Response, NextFunction } from 'express';
import { CustomError } from "./mainService";
import { HTTP_STATUS } from '../config/httpStatus';

/**
 * Custom error class for handling unknown routes errors.
 * Extends the base CustomError class and sets the status code to 404 Unknown.
 */
class UnknownError extends CustomError {
  constructor(message: string) {
    super(HTTP_STATUS.NOT_FOUND, message);
    this.name = this.getStatusName(HTTP_STATUS.NOT_FOUND);
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
const unknownRoutes = (request: Request, response: Response, next: NextFunction): void => {
  // Create a custom UnknownError to represent a 404 "Not Found" error.
  const notFoundError = new UnknownError("Data Not found");

  // Pass the error to the next middleware for further processing.
  next(notFoundError);
}

export { unknownRoutes, UnknownError };