import Joi from "joi";
import { IContact } from "../interfaces/modelsInterfaces";
import { emailRejex, phoneRejex, extensionRejex } from '../utils/rejex';

/**
 * Validates the provided contact data using Joi schema.
 *
 * @param {IContact} body - The contact data to be validated.
 * @returns {Joi.ValidationResult<IContact>} - The result of the validation.
 */
export const validateContact = (body: IContact): Joi.ValidationResult<IContact> => {
  // Step 1: Define a Joi schema for validating the contact data.
  const schema = Joi.object({

    // Step 2: Validate the 'department' field.
    department: Joi.string().min(2).max(20).required().messages({
      'string.min': 'Department must be at least 2 characters long',
      'string.max': 'Department cannot exceed 20 characters',
      'any.required': 'Department is required',
      'string.empty': 'Department should not be empty',
    }),

    // Step 3: Validate the 'contactName' field.
    contactName: Joi.string().min(2).max(20).required().messages({
      'string.min': 'Contact name must be at least 2 characters long',
      'string.max': 'Contact name cannot exceed 20 characters',
      'any.required': 'Contact is required',
      'string.empty': 'Contact should not be empty',
    }),

    // Step 4: Validate the 'phone' field.
    phone: Joi.string().length(10).regex(phoneRejex).required().messages({
      'string.length': 'Phone must be exactly 10 characters long',
      'any.required': 'Phone is required',
      'string.empty': 'Phone should not be empty',
    }),

    // Step 5: Validate the 'extension' field.
    extension: Joi.string().length(4).regex(extensionRejex).required().messages({
      'string.length': 'Extension name must be exactly 4 characters long',
      'any.required': 'Extension is required',
      'string.empty': 'Extension should not be empty',
    }),

    // Step 6: Validate the 'email' field.
    email: Joi.string().min(5).max(255).regex(emailRejex).required().messages({
      'string.min': 'Email must be at least 5 characters long',
      'string.max': 'Email cannot exceed 255 characters',
      'any.required': 'Email is required',
      'string.empty': 'Email should not be empty',
    }),
  });

  // Step 7: Return the result of the validation.
  return schema.validate(body);
};

// Step 8: Export the validateContact function.
export default { validateContact };