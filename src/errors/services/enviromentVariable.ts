/**
 * Custom error class for environment variable errors.
 */
export class EnvironmentVariableError extends Error {
  /**
 * Constructor for the EnvironmentVariableError class.
 * @param {string} message - The name of the missing or invalid environment variable.
 */
  constructor(message: string) {
    super(`Missing or invalid environment variable: ${message}`);
    this.name = "EnvironmentVariableError";
  }
}