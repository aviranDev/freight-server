import { CustomError } from "./mainService";
import { HTTP_STATUS } from '../../config/httpStatus';

/**
 * Custom error class for handling authentication errors.
 * Extends the base CustomError class and sets the status code to 401 Unauthorized.
 */
class AuthenticationError extends CustomError {
  /**
 * Creates an instance of AuthenticationError.
 * @param {string} message - The error message associated with the authentication failure.
 */
  constructor(message: string) {
    // Call the constructor of the base class (CustomError) with the status code and message.
    super(HTTP_STATUS.UNAUTHORIZED, message);

    // Set the name of the error to match the HTTP status name (e.g., 'Unauthorized').
    this.name = this.getStatusName(HTTP_STATUS.UNAUTHORIZED);
  }
}

// Export the AuthenticationError class as the default export for external use.
export default AuthenticationError;