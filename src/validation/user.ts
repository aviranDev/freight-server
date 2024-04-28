import Joi from "joi";
import { serverConfig } from '../config/serverConfiguration';
import { IUser } from "../Models/User";
import { usernameRejex } from "../utils/rejex";
const { ROLE2, ROLE3 } = serverConfig.config.ROLES;

/**
 * @description validate register
 * @param body 
 * @returns error */
export const validateRegister = (body: IUser) => {
  const schema = Joi.object({
    username: Joi.string().pattern(usernameRejex).required().messages({
      'string.pattern.base': 'Username must follow the pattern: an uppercase letter, a lowercase letter, the word "freight," and four digits.',
      'any.required': 'Username is required',
      'string.empty': 'Username should not be empty',
    }),
    password: Joi.string().min(6).max(255).required().messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 255 characters',
      'any.required': 'Password is required',
      'string.empty': 'Password should not be empty',
    }),
    role: Joi.string().valid(ROLE2, ROLE3).messages({
      'any.only': `Role must be either ${ROLE2}, or ${ROLE3}`,
      'any.required': 'Role is required',
      'string.empty': 'Role should not be empty',
    }),
  })
  return schema.validate(body);
}

export default { validateRegister };