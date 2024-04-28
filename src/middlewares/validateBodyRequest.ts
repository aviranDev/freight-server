import { Request, Response, NextFunction } from 'express';
import { ValidationError } from "../errors/validation";
import { ValidationResult } from 'joi'; // Import Joi

// Define a type for the callback function used for request body validation with Joi
type JoiValidationCallback = (body: any) => ValidationResult; // Use Joi's ValidationResult

/**
 * Middleware to validate the request body using a provided callback.
 * @param callback Function that validates the request body and returns an object with an 'error' property.
 */
const validateRequestBody = (callback: JoiValidationCallback) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = callback(req.body);

      // Check for validation errors and throw a ValidationError if found
      if (error) {
        throw new ValidationError(`${error.details[0].message}`);
      }

      // If there are no validation errors, continue to the next middleware
      next();
    } catch (error) {
      // Handle other errors, like unexpected errors
      next(error);
    }
  };
};

export default validateRequestBody;