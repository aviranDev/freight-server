import { CustomError } from "../services/mainService";
import { HTTP_STATUS } from '../../config/httpStatus';

/**
 * Custom error class for handling authorization errors.
 * Extends the base CustomError class and sets the status code to 403 Forbidden.
 */
class AuthorizationError extends CustomError {
  /**
* Creates an instance of AuthorizationError.
* @param {string} message - The error message associated with the authorization failure.
*/
  constructor(message: string) {
    // Call the constructor of the base class (CustomError) with the status code and message.
    super(HTTP_STATUS.FORBIDDEN, message);

    // Set the name of the error to match the HTTP status name (e.g., 'Forbidden').
    this.name = this.getStatusName(HTTP_STATUS.FORBIDDEN);
  }
}

export default AuthorizationError;