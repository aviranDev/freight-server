import { CustomError } from "../services/mainService";
import { HTTP_STATUS } from '../../config/httpStatus';

/**
 * Custom error class for handling unknown routes errors.
 * Extends the base CustomError class and sets the status code to 404 Unknown.
 */
class UnknownError extends CustomError {
  /**
* Creates an instance of Unknown error.
* @param {string} message - The error message associated with the Unknown error routes.
*/
  constructor(message: string) {
    // Call the constructor of the base class (CustomError) with the status code and message.
    super(HTTP_STATUS.NOT_FOUND, message);

    // Set the name of the error to match the HTTP status name (e.g., 'Unknown').
    this.name = this.getStatusName(HTTP_STATUS.NOT_FOUND);
  }
}

export default UnknownError;