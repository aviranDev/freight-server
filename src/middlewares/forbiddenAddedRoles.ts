import { Request, Response, NextFunction } from 'express';
import { AuthorizationError } from "../errors/authorizationError";

/**
 * Middleware to check if a given role is in the list of forbidden roles.
 * @param forbiddenRoles - An array of roles that are forbidden.
 * @returns Express middleware function.
 */
export const forbiddenAddedRoles = (forbiddenRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract the 'role' from the request body
      const { role } = req.body;

      // Check if the role is in the list of forbidden roles
      if (forbiddenRoles?.includes(role)) {
        // If the role is forbidden, throw an AuthorizationError
        throw new AuthorizationError(`The role: ${role} is forbidden.`);
      };

      // If the role is not in the forbidden roles, continue to the next middleware
      next();
    } catch (error) {
      // Pass the error to the next middleware for handling
      next(error);
    }
  };
};

// Export the middleware function for use in other parts of the application
export default forbiddenAddedRoles;