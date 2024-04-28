import { NextFunction, Request, Response } from 'express';
import { logger } from "../logger/logger";
import { HTTP_STATUS } from '../config/httpStatus';
import { IAuth, IAuthService } from '../services/auth';

class AuthController {
  // Declare an instance of UserService as a property
  private service: IAuthService;

  // Constructor to initialize the UserService instance
  constructor(service: IAuthService) {
    this.service = service;
  }

  /**
   * Route handler for authenticating a user and providing access and refresh tokens.
   * 
   * @param {Request} req - Express request object.
   * @param {Response} res - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * 
   * @description This middleware attempts to authenticate a user by extracting the username and password from the request body.
   * It calls the authenticateUser method of the service to retrieve tokens (access token and refresh token).
   * If authentication is successful, it sets the refresh token as an HTTP-only cookie with a 7-day expiration.
   * It responds with a success message and the access token.
   * If there are any errors during the process, they are passed to the error-handling middleware.
   * After the operation, it logs a debug message indicating the completion of the authentication process.
   * 
   * @returns {Promise<void>} - Resolves with access and refresh tokens on successful authentication.
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract username and password from the request body.
      const { username, password } = req.body;

      // Attempt to authenticate the user and retrieve tokens.
      const { refreshToken, accessToken } = await this.service.authenticateUser(username, password);

      // Set the refresh token as an HTTP-only cookie.
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,// 7 days
      });

      // Respond with user token.
      res.status(HTTP_STATUS.OK).send({
        message: "User are authenticated",
        accessToken: accessToken,
      });
    } catch (error) {
      // Pass any errors to the next middleware for error handling.
      next(error);
    } finally {
      // Log a debug message indicating the completion of the authentication process.
      logger.debug("Authentication process complete");
    }
  };

  /**
   * Route handler for refreshing the user's access token using a refresh token.
   * 
   * @param {Request} request - Express request object.
   * @param {Response} response - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * 
   * @description This middleware refreshes the user's access token using the provided refresh token.
   * It extracts the refresh token from the request cookies and calls the refreshAccessToken method of the service.
   * If the refresh is successful, it responds with a new access token.
   * If there are any errors during the process, they are passed to the error-handling middleware.
   * After the operation, it logs a debug message indicating the completion of the refresh token process.
   * 
   * @returns {Promise<void>} - Resolves with a new access token on successful refresh.
   * 
   * @example
   * // POST /refresh-token
   * app.post('/refresh-token', refreshToken);
   */
  refreshToken = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract the refresh token from the request cookies.
      const cookies = request.cookies;
      const refreshToken = cookies?.jwt || undefined;

      // Request a new access token using the refresh token.
      const newAccessToken = await this.service.refreshAccessToken(refreshToken);

      // Respond with a new access token.
      response.status(HTTP_STATUS.OK).json(newAccessToken);
    } catch (error) {
      // Pass any errors to the next middleware for error handling.
      next(error);
    } finally {
      // Log a debug message indicating the completion of the Refresh token process.
      logger.debug("Refresh token process complete");
    }
  };

  /**
   * Route handler for resetting a user's password.
   * 
   * @param {Request} request - Express request object.
   * @param {Response} response - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * 
   * @description This middleware resets a user's password using the provided password and confirmation password.
   * It assumes access to the user ID from the request and the refresh token from cookies.
   * It calls the resetUserPassword method of the service to perform the password reset.
   * After the reset, it clears the refresh token cookie to log the user out and responds with a success message.
   * If there are any errors during the process, they are passed to the error-handling middleware.
   * After the operation, it logs a debug message indicating the completion of the password reset process.
   * 
   * @returns {Promise<void>} - Resolves with a success message on successful password reset.
   */
  resetPasswrod = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract user information from the request.
      const cookies = request.cookies.jwt;
      const { _id } = request.user; // Assuming that you have access to the user ID in the request
      const { password, confirmPassword } = request.body;

      // Call the service to reset the password
      await this.service.resetUserPassword(_id, cookies, password, confirmPassword);

      // Clear the refresh token cookie to log the user out
      response.clearCookie('jwt', { httpOnly: true, sameSite: 'none' });

      // Respond with a success message
      response.status(HTTP_STATUS.CREATED).json({ message: 'Reset password process is complete.' })
    } catch (error) {
      // Pass any errors to the next middleware for error handling.
      next(error);
    } finally {
      // Log a debug message indicating the completion of the Logout process.
      logger.debug("Reset Password process complete");
    }
  };

  /**
   * Route handler for logging out a user.
   * 
   * @param {Request} request - Express request object.
   * @param {Response} response - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * 
   * @description This middleware logs out a user by removing the refresh token from the database
   * and clearing the refresh token cookie. It responds with a message indicating the cookie is cleared.
   * If there are any errors during the process, they are passed to the error-handling middleware.
   * After the operation, it logs a debug message indicating the completion of the logout process.
   * 
   * @returns {Promise<void>} - Resolves with a success message on successful logout.
   */
  logout = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract the refresh token from the request cookies.
      const cookies = request.cookies

      // Remove the refresh token from the database.
      await this.service.logoutUser(cookies.jwt);

      // Clear the refresh token cookie.
      response.clearCookie('jwt', { httpOnly: true, sameSite: 'none' });

      // Respond with a message indicating the cookie is cleared.
      response.status(HTTP_STATUS.OK).json({ messgae: 'Cookie cleared.' });
    } catch (error) {
      // Pass any errors to the next middleware for error handling.
      next(error);
    } finally {
      // Log a debug message indicating the completion of the Logout process.
      logger.debug("Logout process complete");
    }
  };

  /**
 * Middleware function generator for validating authentication data using Mongoose schema keys.
 * 
 * @param {Array<keyof IAuth>} keys - An array of keys representing the Mongoose schema fields for authentication data.
 * @returns {Function} - An Express middleware function.
 * 
 * @description This middleware function is designed to validate authentication data based on the provided Mongoose schema keys.
 * It takes an array of keys and returns an Express middleware function.
 * The middleware function uses the authValidationContainer method of the AuthService for validation.
 * If the validation is successful, it calls the next middleware in the chain.
 * If there are any errors during the process, they are passed to the error-handling middleware.
 * This middleware is intended to be used before routes that require validated authentication data.
 * 
 * @returns {Promise<void>} - Resolves with a success message on successful validation.
 */
  authMongooseValidation(keys: (keyof IAuth)[]):
    (request: Request, response: Response, next: NextFunction) => Promise<void> {
    return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
      try {
        // Validate authentication data using the provided keys.
        await this.service.authValidationContainer(request.body, keys);

        // If validation is successful, proceed to the next middleware.
        next();
      } catch (error) {
        // If validation fails, pass the error to the error-handling middleware.
        next(error);
      }
    }
  };
};

export default AuthController;