import Joi from "joi";
import { IUser } from "../Models/User";

/**
 * Validates the provided login credentials using Joi schema.
 *
 * @param {IUser} body - The login credentials to be validated.
 * @returns {Joi.ValidationResult<IUser>} - The result of the validation.
 */
export const validateLogin = (body: IUser): Joi.ValidationResult<IUser> => {
  // Step 1: Define a Joi schema for validating login credentials.
  const schema = Joi.object({
    // Step 2: Validate the 'username' field.
    username: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Username must be at least 2 characters long.',
      'string.max': 'Username cannot exceed 50 characters.',
      'any.required': 'Username is required.',
      'string.empty': 'Username should not be empty.',
    }),

    // Step 3: Validate the 'password' field.
    password: Joi.string().min(6).max(255).required().messages({
      'string.min': 'Password must be at least 6 characters long.',
      'string.max': 'Password cannot exceed 255 characters.',
      'any.required': 'Password is required.',
      'string.empty': 'Password should not be empty.',
    }),
  });

  // Step 4: Return the result of the validation.
  return schema.validate(body);
}

/**
 * Validates the provided reset password data using Joi schema.
 *
 * @param {IUser} body - The reset password data to be validated.
 * @returns {Joi.ValidationResult<IUser>} - The result of the validation.
 */
export const validateResetPassword = (body: IUser): Joi.ValidationResult<IUser> => {
  // Step 1: Define a Joi schema for validating reset password data.
  const schema = Joi.object({
    // Step 2: Validate the 'password' field.
    password: Joi.string().min(6).max(255).required().messages({
      'string.min': 'Password must be at least 6 characters long.',
      'string.max': 'Password cannot exceed 255 characters.',
      'any.required': 'Password is required.',
      'string.empty': 'Password should not be empty.',
    }),

    // Step 3: Validate the 'confirmPassword' field.
    confirmPassword: Joi.string().min(6).max(255).required().messages({
      'string.min': 'confirm Password must be at least 6 characters long.',
      'string.max': 'confirm Password cannot exceed 255 characters.',
      'any.required': 'Password is required.',
      'string.empty': 'confirmPassword should not be empty.',
    }),
  });

  // Step 4: Return the result of the validation.
  return schema.validate(body);
}

export default { validateLogin, validateResetPassword };