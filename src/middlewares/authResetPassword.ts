import { Request, Response, NextFunction } from 'express';
import { AuthorizationError } from "../errors/authorizationError";

/**
 * Middleware to check if a user needs to reset their password.
 * Throws an AuthorizationError if the user needs to reset their password.
 * If the user does not need to reset their password, it proceeds to the next middleware.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 *
 * @throws {AuthorizationError} Throws an AuthorizationError if the user needs to reset their password.
 * @throws {InternalError} Throws an InternalError if any other error occurs during validation.
 */
const authResetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check if the user needs to reset their password
    if (req.user.resetPassword === false) {
      throw new AuthorizationError("Please reset your password.");
    }

    // If the user does not need to reset their password, proceed to the next middleware
    next();
  } catch (error) {
    // Pass the error to the next middleware for handling
    next(error);
  }
};

export default authResetPassword;