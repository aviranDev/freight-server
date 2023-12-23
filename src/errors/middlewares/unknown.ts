import { Request, Response, NextFunction } from 'express';
import UnknownError from "../services/unknown";

/**
 * Middleware for handling unknown routes by generating a 404 "Not Found" error response.
 *
 * This middleware is responsible for handling requests to routes that do not match any defined routes.
 *
 * @param {Request} request - The Express request object.
 * @param {Response} response - The Express response object.
 * @param {NextFunction} next - The Express next function.
 */
const unknownRoutes = (
  request: Request, response: Response, next: NextFunction
): void => {
  // Create a custom UnknownError to represent a 404 "Not Found" error.
  const notFoundError = new UnknownError("Not found");

  // Pass the error to the next middleware for further processing.
  next(notFoundError);
}

export { unknownRoutes };