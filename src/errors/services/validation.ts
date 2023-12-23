import { CustomError } from "../services/mainService";
import { HTTP_STATUS } from '../../config/httpStatus';

/**
 * Custom error class for handling conflict errors.
 * Extends the base CustomError class and sets the status code to 409 conflict.
 */
class ValidationError extends CustomError {
  /**
* Creates an instance of ValidationError.
* @param {string} message - The error message associated with the user validation errors.
*/
  constructor(message: string) {
    // Call the constructor of the base class (CustomError) with the status code and message.
    super(HTTP_STATUS.BAD_REQUEST, message);

    // Set the name of the error to match the HTTP status name (e.g., 'validation').
    this.name = this.getStatusName(HTTP_STATUS.BAD_REQUEST);
  }
}

// Export the ValidationError class as the default export for external use.
export default ValidationError;