import { HTTP_STATUS } from '../../config/httpStatus';
import { errorServiceMap } from '../tools/statusErrors';
import { ErrorResponse } from '../tools/interface';

/**
 * CustomError class extends the built-in Error class.
 * Represents a custom error with an associated HTTP status code and name.
 */
export class CustomError extends Error {
  status: number; // HTTP status code for the error.
  name: string; // HTTP status name for the error.

  /**
   * Constructor for the CustomError class.
   * @param {number} status - The HTTP status code for the error.
   * @param {string} message - The error message.
   */
  constructor(status: number, message: string) {
    super(message); // Call the constructor of the parent class (Error) and pass the error message must be string only.
    this.name = this.getStatusName(status); // Set the error name based on the provided status code.
    this.status = status; // Set the HTTP status code for the error.
  }

  /**
   * Gets a human-readable status name based on the status code.
   * @param {number} status - The HTTP status code.
   * @returns {string} - The human-readable status name.
   */
  protected getStatusName(status: number): string {
    return errorServiceMap.get(status) || 'Custom Error';
  }

  /**
   * Convert the CustomError instance to a plain object.
   * @returns {ErrorResponse} - An object representing the CustomError instance.
   */
  public errorResponse(): ErrorResponse {
    return {
      status: this.status || HTTP_STATUS.INTERNAL_SERVER_ERROR,
      name: this.name,
      message: process.argv[2] === '--development' ? this.message : 'An error occurred.',
    };
  }
}