import { CustomError } from "../services/mainService";
import { HTTP_STATUS } from '../../config/httpStatus';

/**
 * Custom error class for handling internal errors.
 * Extends the base CustomError class and sets the status code to 500 internal error.
 */
class InternalError extends CustomError {
  /**
* Creates an instance of InternalError.
* @param {string} message - The error message associated with the internal error.
*/
  constructor(message: string) {
    // Call the constructor of the base class (CustomError) with the status code and message.
    super(HTTP_STATUS.INTERNAL_SERVER_ERROR, message);

    // Set the name of the error to match the HTTP status name (e.g., 'Internal error').
    this.name = this.getStatusName(HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export default InternalError;