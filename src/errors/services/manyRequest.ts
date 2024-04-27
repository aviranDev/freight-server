import { CustomError } from "../services/mainService";
import { HTTP_STATUS } from '../../config/httpStatus';

/**
 * Custom error class for handling too many requests errors (HTTP status code 429).
 * Extends the base CustomError class and sets the status code to 429 Too Many Requests.
 */
class ManyRequests extends CustomError {
  /**
   * Creates an instance of Too Many Requests error.
   * @param {string} message - The error message associated with the too many requests error.
   */
  constructor(message: string) {
    // Call the constructor of the base class (CustomError) with the status code and message.
    super(HTTP_STATUS.TOO_MANY_REQUESTS, message);

    // Set the name of the error to match the HTTP status name (e.g., 'Too Many Requests').
    this.name = this.getStatusName(HTTP_STATUS.TOO_MANY_REQUESTS);
  }
}

export default ManyRequests;