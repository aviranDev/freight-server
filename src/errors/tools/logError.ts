import { logger } from "../../logger/logger";
import { CustomError } from "../services/mainService";

/**
 * Logs an error with additional contextual information.
 *
 * @param {CustomError} error - The error object to be logged.
 * @param {string} message - Additional contextual information or a custom message.
 * @returns {void}
 */
export const logError = (error: CustomError, message: string): void => {
  // Construct an error log message with details from the error object
  logger.error(`${message}: ${error.name} - ${error.message}`);
}