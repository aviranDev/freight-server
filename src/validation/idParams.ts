import { Request, Response, NextFunction } from "express";
import mongoose from 'mongoose';
import { ValidationError } from "../errors/validation";

/**
 * Middleware to validate document ID parameters.
 *
 * @param {Request} request - Express request object.
 * @param {Response} response - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 *
 * @description
 * This middleware checks if the provided document ID in the request parameters is a valid MongoDB ObjectId.
 * If the ID is not valid, it throws a ValidationError.
 * If the ID is valid, it proceeds to the next middleware.
 */
const validateIdParams = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  try {
    // Step 1: Check if the provided document ID is a valid MongoDB ObjectId.
    if (!mongoose.Types.ObjectId.isValid(request.params.id)) {
      // Step 2: If the ID is not valid, throw a ValidationError.
      throw new ValidationError(`Item with id: ${request.params.id} doesn't exist`)
    }

    // Step 3: If the ID is valid, proceed to the next middleware.
    next();
  } catch (error) {
    // Step 4: Pass any errors to the next middleware.
    next(error);
  }
};

export default validateIdParams; 