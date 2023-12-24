import Joi from "joi";
import { IAgent } from "../interfaces/modelsInterfaces";
import { roomRejex } from '../utils/rejex';
import { config } from "../config/server";
const {
  PORT_NAME_1,
  PORT_NAME_2,
  FLOOR1,
  FLOOR2,
  FLOOR3
} = config;

/**
 * Validates the provided agent data using Joi schema.
 *
 * @param {IAgent} body - The agent data to be validated.
 * @returns {Joi.ValidationResult<IAgent>} - The result of the validation.
 */
const validateAgent = (body: IAgent): Joi.ValidationResult<IAgent> => {
  // Step 1: Define a Joi schema for validating the agent data.
  const schema = Joi.object({
    // Step 2: Validate the 'agent' field.
    agent: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Agent must be at least 2 characters long',
      'string.max': 'Agent cannot exceed 50 characters',
      'any.required': 'Agent is required',
      'string.empty': 'Agent should not be empty',
    }),
    // Step 3: Validate the 'port' field.
    port: Joi.string().valid(PORT_NAME_1, PORT_NAME_2).messages({
      'any.only': `Port must be either ${PORT_NAME_1}, or ${PORT_NAME_2}`,
      'any.required': 'Port is required',
      'string.empty': 'Port should not be empty',
    }),
    // Step 4: Validate the 'room' field.
    room: Joi.string().regex(roomRejex).required().messages({
      'any.required': 'Room is required',
      'string.empty': 'Room should not be empty',
      'string.pattern.base': 'Room is allowed for 3 numeric strings only.'
    }),
    // Step 5: Validate the 'floor' field.
    floor: Joi.string().valid(FLOOR1, FLOOR2, FLOOR3).required().messages({
      'any.only': `Floor must be either ${FLOOR1}, ${FLOOR2} or ${FLOOR3}`,
      'any.required': 'Floor is required',
      'string.empty': 'Floor should not be empty',
    }),
  });

  // Step 6: Return the result of the validation.
  return schema.validate(body);
}

// Step 7: Export the validateAgent function.
export { validateAgent };