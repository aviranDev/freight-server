import { Request, Response, NextFunction } from "express";
import AuthenticationError from "../errors/services/authetication";
import mongoose from 'mongoose';
import InternalError from "../errors/services/internalError";

/**
 * Middleware to validate ID parameters in requests.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function.
 * @returns void
 */
const validateIdParams = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = request.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AuthenticationError(`Item with id: ${id} doesn't exist`);
    }

    // ID is valid, continue to the next middleware.
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return next(error);
    }

    // Handle unexpected errors as InternalError.
    next(new InternalError(`An error occurred during ID validation: ${error}`));
  }
};

export default validateIdParams;
