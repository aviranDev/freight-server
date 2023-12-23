import { CustomError } from "../services/mainService";
import { HTTP_STATUS } from '../../config/httpStatus';

/**
 * Custom error class for handling conflict errors.
 * Extends the base CustomError class and sets the status code to 409 conflict.
 */
class ConflictError extends CustomError {
  /**
* Creates an instance of ConflictError.
* @param {string} message - The error message associated with the user request failure.
*/
  constructor(message: string) {
    // Call the constructor of the base class (CustomError) with the status code and message.
    super(HTTP_STATUS.CONFLICT, message);

    // Set the name of the error to match the HTTP status name (e.g., 'conflict').
    this.name = this.getStatusName(HTTP_STATUS.CONFLICT);
  }
}

// Export the ConflictError class as the default export for external use.
export default ConflictError;