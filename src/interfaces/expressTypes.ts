import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../errors/services/mainService';

/**
 * Represents a route handler function for Express.
 *
 * This type defines a function that handles an HTTP request and returns a response.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next function.
 * @returns {Promise<void> | void} A promise or value indicating the result of request handling.
 *
 * @example
 * // Define a route handler function
 * const handleRoute: RouteHandler = async (req, res, next) => {
 *   // Handle the request and send a response
 *   res.send('Hello, Express!');
 * };
 */
export interface RouteHandler {
  (req: Request, res: Response, next: NextFunction): Promise<void> | void;
};

/**
 * Represents an error route handler function for Express.
 *
 * This type defines a function that handles errors and returns an error response.
 *
 * @param {CustomError} err - The custom error object.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next function.
 * @returns {Promise<void> | void} A promise or value indicating the result of error handling.
 *
 * @example
 * // Define an error route handler function
 * const handleError: ErrorRouteHandler = async (err, req, res, next) => {
 *   // Handle the error and send an error response
 *   res.status(err.status || 500).json({ error: err.message });
 * };
 */
export interface errRouteHandler {
  (err: CustomError, req: Request, res: Response, next: NextFunction): Promise<void> | void;
};