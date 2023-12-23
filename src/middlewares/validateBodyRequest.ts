import { Request, Response, NextFunction } from 'express';
import InternalError from "../errors/services/internalError";
import { ValidationError } from "../errors/middlewares/validation";
import { ValidationResult } from 'joi'; // Import Joi

// Define a type for the callback function used for request body validation with Joi
type JoiValidationCallback = (body: any) => ValidationResult; // Use Joi's ValidationResult

/**
 * Middleware to validate the request body using a provided callback.
 * @param callback Function that validates the request body and returns an object with an 'error' property.
 */
const validateRequestBody = (callback: JoiValidationCallback) => {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { error } = callback(request.body);

      // Check for validation errors and throw a ValidationError if found
      if (error) {
        throw new ValidationError(`${error.details[0].message}`);
      }

      // If there are no validation errors, continue to the next middleware
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        // Handle custom ValidationError
        return next(error);
      }

      // Handle other errors, like unexpected errors
      next(new InternalError(`Something went wrong: ${error}`));
    }
  };
};

export default validateRequestBody;