import { Request, Response, NextFunction } from 'express';
import AuthorizationError from "../errors/services/authorization";
import { tokens } from '../config/server';
import jwt, { JwtPayload } from 'jsonwebtoken';

/**
 * Middleware to authenticate users based on their roles.
 * Throws an AuthorizationError if the user is not authorized.
 *
 * @param {string[]} roles - The roles allowed to access the route or resource.
 * @returns {Promise<void>} A Promise that resolves when authentication is successful.
 */
export const administratorAuthentication = (roles: string[]):
  ((request: Request, response: Response, next: NextFunction) => Promise<void>) => {
  // If no roles are provided, default to ['superAdmin', 'admin']
  const authorizedRoles = roles.length > 0 ? roles : ['superAdmin', 'admin']

  return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract the JWT token from the user's cookies
      const token = request.cookies.jwt;

      // Verify and decode the JWT token, specifying the expected payload shape
      const decoded = jwt.verify(token, tokens.REFRESH_TOKEN_SECRET) as JwtPayload;

      // Check if the user's role is included in the list of allowed roles
      const isAuthorized = authorizedRoles.includes(decoded?.role);

      if (!isAuthorized) {
        // If the user's role is not in the allowed roles, throw an AuthorizationError
        throw new AuthorizationError(`User in role: ${decoded?.role} is not authorized.`)
      }

      // If the user is authorized, continue to the next middleware or route
      next();
    } catch (error) {
      // Pass any error to the error-handling middleware
      next(error);
    }
  };
};

export default administratorAuthentication;