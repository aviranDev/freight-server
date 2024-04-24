import { IAuth, IUser } from "../interfaces/modelsInterfaces";
import { Model } from "mongoose";
import InternalError from "../errors/services/internalError";
import AuthenticationError from "../errors/services/authetication";
import { comparePasswords } from "../utils/password";
import { serverConfig } from "../config/serverConfiguration";
import { salter, hashing } from "../utils/password";
import { ValidationError } from "../errors/middlewares/validation";
import ISessionService from "../interfaces/ISessionService";
const { SALT } = serverConfig.config;

const MAX_LOGIN_ATTEMPTS = 5;
// const LOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const LOCK_DURATION_MS = 1 * 60 * 1000; // 1 minute in milliseconds


/**
 * AuthService handles user authentication, login, and password reset operations.
 * This service manages user authentication and password-related tasks, including
 * login, password reset, access token management, and more.
 */
export class AuthService {
  private model: Model<IUser> // Mongoose model for the User collection
  private tokenService: ISessionService; // Service for managing user sessions and tokens

  /**
   * Constructor for the AuthService class.
   * Initializes the Mongoose model for the User collection and the SessionService.
   */
  constructor(userModel: Model<IUser>, tokenService: ISessionService) {
    // Initialize the data model and TokenService
    this.model = userModel;
    this.tokenService = tokenService;
  };

  /**
   * Asynchronously updates the password and resetPassword flag for a user in the database.
   *
   * @param {string} userId - The unique identifier of the user whose password is being updated.
   * @param {string} password - The new password to set for the user.
   * @returns {Promise<IUser>} A Promise that resolves with the updated user object upon successful password update.
   * @throws {InternalError} Throws an error if there's a failure during the update process or if the user profile retrieval fails.
   *
   * @description
   * This method attempts to update the user's password and set the resetPassword flag in the database.
   * It uses the provided userId to identify the user and the new password to replace the existing one.
   * If the update is successful, it returns the updated user object.
   * If the user profile cannot be retrieved (null result), an InternalError is thrown.
   * Any other error during the process is also rethrown.
   */
  private async updatePassword(userId: string, password: string): Promise<IUser> {
    try {
      // Attempt to update the user's password and resetPassword flag
      const updatedPassword = await this.model.findByIdAndUpdate(
        userId, // The user's ID to identify the user
        {
          password: password, // Set the new password
          resetPassword: true, // Set the resetPassword flag to indicate a password reset
        },
        { new: true } // Return the updated user object after the update
      );

      // Check if the updatedPassword is null, indicating an error
      if (updatedPassword === null) {
        throw new InternalError(`Failed to retrieve member profile.`);
      }

      // Return the updated user object
      return updatedPassword;
    } catch (error) {
      // If any error occurs during the process, rethrow it
      throw error;
    }
  }

  /**
   * Authenticates a user by checking the provided username and password.
   *
   * @param {string} username - The username of the user attempting to authenticate.
   * @param {string} password - The password associated with the provided username.
   * @returns {Promise<{ accessToken: string, refreshToken: string }>} A Promise that resolves with an object
   *          containing the generated access and refresh tokens upon successful authentication.
   * @throws {AuthenticationError} Throws an authentication error if the username or password is invalid.
   *
   * @description
   * This method attempts to find a user by the provided username. If the user is not found or the password
   * does not match, it throws an AuthenticationError. If the authentication is successful, it adds the user
   * to the session, generates access and refresh tokens, stores the refresh token in the database,
   * and returns an object containing the access and refresh tokens.
   * If any error occurs during the process, it is rethrown.
   */
  public async authenticateUser(username: string, password: string)
    : Promise<{ accessToken: string, refreshToken: string }> {
    try {
      // Find the user by username
      const user = await this.model.findOne({ username: username });

      // Check if the user doesn't exist or the password doesn't match
      if (!user) {
        throw new AuthenticationError('Invalid username or password.');
      };

      // Check if the account is locked
      if (user.accountLocked && user.lastFailedLoginDate) {
        const oper = (Date.now() - user.lastFailedLoginDate.getTime())
        const lockDuration = LOCK_DURATION_MS - oper;
        /*         console.log("LOCK_DURATION_MS: " + LOCK_DURATION_MS);
                console.log("CURRENT DATE: " + Date.now());
                console.log("lastFailedLoginDate: " + user.lastFailedLoginDate.getTime());
                console.log("lockDuration: " + lockDuration); */


        if (lockDuration > 0) {
          const hours = lockDuration / (60 * 60 * 1000); // Convert milliseconds to hours
          throw new AuthenticationError(`Account is locked. Try again after ${hours.toFixed(2)} hours`);
        }

        // Reset failed login attempts upon successful login
        user.failedLoginAttempts = 0;
        user.accountLocked = false;
        user.lastFailedLoginDate = null;
      }

      // Check if the user doesn't exist or the password doesn't match
      if (!comparePasswords(password, user.password)) {
        // Update failed login attempts count and last failed login date
        user.failedLoginAttempts += 1;
        user.lastFailedLoginDate = new Date();
        await user.save();

        // Check if the maximum attempts exceeded
        if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
          // Lock the account
          user.accountLocked = true;
          await user.save();

          throw new AuthenticationError('Account is locked. Try again after 24 hours --->');
        }

        throw new AuthenticationError('Invalid username or password.');
      };

      await user.save();

      // Generate a new access token
      const accessToken = this.tokenService.generateAccessToken(user);

      // Generate a new refresh token
      const refreshToken = this.tokenService.generateRefreshToken(user);

      // Store the refresh token in the database
      await this.tokenService.storeRefreshTokenInDb(refreshToken, user._id);

      // Returns the generated access and refresh tokens as strings upon successful authentication.
      return { accessToken, refreshToken };
    } catch (error) {
      // If any error occurs during the process, rethrow it
      throw error;
    }
  }

  /**
   * Refreshes the access token using a provided refresh token.
   *
   * @param {string} refreshToken - The refresh token to be verified for generating a new access token.
   * @throws {AuthenticationError} Throws an authentication error if the refresh token is not provided or if the user associated
   * with the refresh token is not found in the database.
   * @throws {InternalError} Throws an internal error if there's an issue with retrieving user information or generating the access token.
   * @returns {Promise<{ success: boolean, accessToken?: string }>} A Promise that resolves with an object containing a success flag
   * and, if successful, the newly generated access token.
   *
   * @description
   * This method checks if the refresh token is provided. If not, it throws an AuthenticationError.
   * It then verifies the refresh token using the token service and retrieves user information.
   * If the user associated with the refresh token is not found in the database, it throws an AuthenticationError.
   * The method generates a new access token using the token service.
   * If any error occurs during the process, it is rethrown.
   * The Promise resolves with an object containing a success flag and, if successful, the newly generated access token.
   */
  public async refreshAccessToken(refreshToken: string)
    : Promise<{ success: boolean, accessToken?: string }> {
    try {
      // Check if the refresh token is provided
      if (!refreshToken) {
        throw new AuthenticationError('Cookie muse be provided.');
      }

      // Verify the refresh token and retrieve user information
      const userInformation = await this.tokenService.verifyRefreshToken(refreshToken);

      // Find the user by user ID
      const member = await this.model.findById(userInformation._id);

      // Check if the user doesn't exist
      if (!member) {
        throw new InternalError(`User not found in the database.`);
      }

      // Generate a new access token
      const accessToken = this.tokenService.generateAccessToken(member);

      // Returns an object indicating the success of the operation and, 
      // if successful, includes the newly generated access token.
      return { success: true, accessToken };
    } catch (error) {
      // If any error occurs during the process, rethrow it
      throw error;
    }
  }

  /**
   * Resets a user's password, updating it in the database.
   *
   * @param {string} userId - The ID of the user whose password is to be reset.
   * @param {string} cookie - The refresh token cookie associated with the user's session.
   * @param {string} password - The new password.
   * @param {string} confirmPassword - The confirmation of the new password.
   * @throws {AuthenticationError} Throws an authentication error if the cookie is not provided, if the user is not found,
   * or if the new password and its confirmation do not match.
   * @throws {Error} Throws any other error that occurs during the password reset process.
   * @returns {Promise<void>} A Promise that resolves when the user's password is successfully reset.
   *
   * @description
   * This method checks if a refresh token cookie is provided. If not, it throws an AuthenticationError.
   * It then finds the user by user ID and checks if the user is found. If not, it throws an AuthenticationError.
   * Next, it checks if the new password and its confirmation match. If not, it throws an AuthenticationError.
   * It generates a salt and hashes the new password, updating the user's password in the database.
   * Additionally, it removes the user's refresh token.
   * If any error occurs during the process, it is rethrown.
   * The Promise resolves when the user's password is successfully reset.
   */
  public async resetUserPassword(userId: string, cookie: string, password: string, confirmPassword: string): Promise<void> {
    try {
      // Check if the cookie is provided
      if (!cookie) {
        throw new AuthenticationError('Cookie must be provided.');
      }

      // Find the user by user ID
      const member = await this.model.findById(userId);

      // Check if the user is found
      if (!member) {
        throw new AuthenticationError('Member not found.');
      }

      // Check if the new password and its confirmation match
      if (password !== confirmPassword) {
        throw new AuthenticationError('Passwords do not match.');
      }

      // Generate a salt and hash the new password
      const salt = salter(SALT);
      const userPassword = await hashing(password, salt);

      // Update the user's password in the database
      await this.updatePassword(userId, userPassword);

      // Remove the user's refresh token
      await this.tokenService.removeRefreshToken(cookie);

    } catch (error) {
      // If any error occurs during the process, rethrow it
      throw error;
    }
  }

  /**
   * Logs out a user by removing their refresh token from the database.
   *
   * @param {string} cookie - The refresh token cookie associated with the user's session.
   * @throws {AuthenticationError} Throws an authentication error if the cookie is not provided.
   * @throws {Error} Throws any other error that occurs during the logout process.
   * @returns {Promise<void>} A Promise that resolves when the user is successfully logged out.
   *
   * @description
   * This method checks if a refresh token cookie is provided. If not, it throws an AuthenticationError.
   * It then uses the tokenService to remove the refresh token from the database, obtaining the user ID in the process.
   * If any error occurs during the process, it is rethrown.
   * The Promise resolves when the user is successfully logged out.
   */
  public async logoutUser(cookie: string): Promise<void> {
    try {
      // Check if the cookie is provided
      if (!cookie) {
        throw new AuthenticationError('Cookie must be provided.');
      }

      // Remove the refresh token from the database using the tokenService
      await this.tokenService.removeRefreshToken(cookie);

    } catch (error) {
      // If any error occurs during the process, rethrow it
      throw error;
    }
  }

  /**
   * Validates authentication data against the Mongoose schema using the provided keys.
   *
   * @param {IAuth} body - The data to be validated against the Mongoose schema.
   * @param {Array<keyof IAuth>} keys - An array of keys representing the Mongoose schema fields for authentication data.
   * @throws {ValidationError} Throws a validation error if the data does not conform to the schema.
   * @throws {Error} Throws any other error that occurs during the validation process.
   * @returns {null} Returns null if the validation is successful.
   *
   * @description
   * This method creates an instance of the Mongoose model with the provided authentication data.
   * It then validates the instance against the specified schema keys using Mongoose's validateSync method.
   * If there are validation errors, it throws a ValidationError with the error details.
   * If there are other errors during the validation process, they are propagated.
   * In case of successful validation, it returns null.
   */
  async authValidationContainer(body: IAuth, keys: (keyof IAuth)[]): Promise<null> {
    try {
      // Create an instance of the Mongoose model with the provided authentication data.
      const instance = new this.model(body);

      // Validate the instance against the specified schema keys.
      const error = instance.validateSync(keys);

      // If there are validation errors, throw a ValidationError with error details.
      if (error !== undefined) {
        throw new ValidationError(`${error}`);
      }

      // Return null if the validation is successful.
      return null;
    } catch (error) {
      // Propagate any other errors that occur during the validation process.
      throw error;
    }
  }
}

export default AuthService;