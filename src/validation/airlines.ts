import Joi from "joi";
import { IAirline } from "../interfaces/modelsInterfaces";
import { prefixRejex, codeRejex } from '../utils/rejex';

/**
 * Validates the provided airline data using Joi schema.
 *
 * @param {IAirline} body - The airline data to be validated.
 * @returns {Joi.ValidationResult<IAirline>} - The result of the validation.
 */
const validateAirline = (body: IAirline): Joi.ValidationResult<IAirline> => {
  // Step 1: Define a Joi schema for validating the airline data.
  const schema = Joi.object({
    // Step 2: Validate the 'airline' field.
    name: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required',
      'string.empty': 'Name should not be empty',
    }),

    // Step 3: Validate the 'prefix' field.
    prefix: Joi.string().regex(prefixRejex).required().messages({
      'any.required': 'Prefix is required',
      'string.empty': 'Prefix should not be empty',
      'string.pattern.base': 'Prefix is allowed for numeric strings only.'
    }),

    // Step 4: Validate the 'code' field.
    code: Joi.string().regex(codeRejex).required().messages({
      'any.required': 'Prefix is required',
      'string.empty': 'Prefix should not be empty',
      'string.pattern.base': 'Prefix is allowed for strings only.'
    }),

    // Step 5: Validate the 'location' field.
    agent: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Agent must be at least 2 characters long',
      'string.max': 'Agent cannot exceed 50 characters',
      'any.required': 'Agent is required',
      'string.empty': 'Agent should not be empty',
    }),
  });

  // Step 7: Return the result of the validation.
  return schema.validate(body);
}

// Step 8: Export the validateAirline function.
export { validateAirline };