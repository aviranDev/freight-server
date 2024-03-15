import { IUser } from "../interfaces/modelsInterfaces";
import { Model, Types } from "mongoose";
import InternalError from "../errors/services/internalError";
import { sign } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import Session from "../Models/Session";
import { tokens } from "../config/server";
import { ISession } from "../interfaces/modelsInterfaces";
import { TokenPayload } from "../interfaces/modelsInterfaces";

/**
 * SessionService manages the creation, validation, and removal of user sessions.
 * This service handles access and refresh tokens, including their secrets and expiration times.
 */
class SessionService {
  // Define private properties for access and refresh tokens
  private accessTokenSecret = tokens.ACCESS_TOKEN_SECRET; // Secret key for access tokens
  private refreshTokenSecret = tokens.REFRESH_TOKEN_SECRET; // Secret key for refresh tokens

  // Define expiration times for access and refresh tokens
  private accessTokenExpire = tokens.ACCESS_TOKEN_EXPIRE; // Expiration time for access tokens (in seconds)
  private refreshTokenExpire = tokens.REFRESH_TOKEN_EXPIRE; // Expiration time for refresh tokens (in seconds)

  // Define the Mongoose model for managing refresh tokens
  private model: Model<ISession>; // Mongoose model for managing refresh tokens

  /**
   * Constructor for the SessionService class.
   * Initializes the class with the provided Mongoose model for managing refresh tokens.
   */
  constructor() {
    // Assign the provided Mongoose model to the class property
    this.model = Session; // The Mongoose model for managing refresh tokens is assigned
  }

  /**
   * Generates a payload with essential user information for a token.
   *
   * @param {IUser} user - The user for whom the payload is generated.
   * @returns {TokenPayload} Returns the generated token payload.
   * @throws {InternalError} Throws an error if the user object is not provided.
   *
   * @description
   * This private method ensures that a user object is provided.
   * It then extracts essential user information, including the user's unique identifier,
   * username, resetPassword flag, and role, to create a token payload.
   * The method returns the generated token payload.
   * If the user object is not provided, it throws an InternalError.
   */
  private generateUserPayload(user: IUser): TokenPayload {
    // If the user object is not provided, throw an InternalError
    if (!user) {
      throw new InternalError('User object is required.');
    }

    // Extract essential user information for the token payload
    const payload: TokenPayload = {
      _id: user._id, // The user's unique identifier
      username: user.username, // The user's username
      resetPassword: user.resetPassword, // Flag indicating if the user's password needs to be reset
      role: user.role, // The user's role or permissions
    };

    // Return the generated user payload
    return payload;
  }

  /**
   * Generates a refresh token for a given user.
   *
   * @param {IUser} user - The user for whom the refresh token is generated.
   * @returns {string} Returns the generated refresh token.
   *
   * @description
   * This method creates a payload with essential user information for the refresh token.
   * It then signs the payload using the refresh token secret and sets its expiration time.
   * The method returns the generated refresh token.
   */
  public generateAccessToken(user: IUser): string {
    // Create a payload with essential user information for the access token
    const payload = this.generateUserPayload(user);

    // Sign the payload using the access token secret and set its expiration time
    const accessToken = sign(payload, this.accessTokenSecret, { expiresIn: this.accessTokenExpire });

    // Return the generated access token
    return accessToken;
  }

  /**
   * Generates a refresh token for a given user.
   *
   * @param {IUser} user - The user for whom the refresh token is generated.
   * @returns {string} Returns the generated refresh token.
   *
   * @description
   * This method creates a payload with essential user information for the refresh token.
   * It then signs the payload using the refresh token secret and sets its expiration time.
   * The method returns the generated refresh token.
   */
  public generateRefreshToken(user: IUser): string {
    // Create a payload with essential user information for the refresh token
    const payload = this.generateUserPayload(user);

    // Sign the payload using the refresh token secret and set its expiration time
    const refreshToken = sign(payload, this.refreshTokenSecret, { expiresIn: this.refreshTokenExpire });

    // Return the generated refresh token
    return refreshToken;
  }

  /**
   * Verifies and decodes a refresh token stored in the database.
   *
   * @param {string} refreshToken - The refresh token to be verified and decoded.
   * @returns {Promise<IUser>} Returns the decoded user information from the refresh token.
   * @throws {InternalError} Throws an error if the token is not found in the database or if there's an issue during verification or decoding.
   *
   * @description
   * This method retrieves the stored refresh token from the database.
   * If the token doesn't exist in the database, it throws an InternalError.
   * It then verifies the refresh token and decodes the user information using the provided secret.
   * If the verification and decoding are successful, it returns the decoded user information.
   * If any issues occur during the process, a more specific error is thrown for proper error handling.
   */
  public async verifyRefreshToken(refreshToken: string): Promise<IUser> {
    try {
      // Retrieve the stored token from the database
      const storedToken = await this.model.findOne({ refreshToken });

      // Check if the token doesn't exist in the database
      if (!storedToken) {
        throw new InternalError(`Token not found in the database.`);
      }

      // Verify the refresh token and return the decoded user information
      const decoded = jwt.verify(refreshToken, this.refreshTokenSecret) as IUser;

      // Return the decoded user information, which includes the user's ID
      return decoded;
    } catch (error) {
      // If any error occurs during the process, throw a more specific error
      throw error;
    }
  }

  /**
   * Verifies and extracts the user payload from an access token.
   *
   * @param {string} authHeader - The authorization header containing the access token.
   * @returns {user} Returns the user payload extracted from the access token.
   *
   * @description
   * This method extracts the token from the authorization header.
   * It then verifies the access token and extracts the user payload using the provided secret.
   * If the verification and decoding are successful, it returns the extracted user payload.
   */
  public verifyAccessToken(authHeader: string): IUser {
    // Extract the token from the authorization header
    const token = authHeader.split(" ")[1];

    // Verify the access token and extract the user payload
    const payload = jwt.verify(token, tokens.ACCESS_TOKEN_SECRET) as IUser;

    // Return the extracted user payload from the access token
    return payload;
  }

  /**
   * Removes a refresh token from the database based on the provided cookie.
   *
   * @param {string} cookie - The refresh token stored in a cookie to be removed.
   * @returns {Types.ObjectId} Returns the user ID associated with the removed refresh token.
   * @throws {InternalError} Throws an error if the refresh token is not found in the database or if there's an issue during removal.
   *
   * @description
   * This method attempts to find and remove the corresponding refresh token using the provided cookie.
   * If the refresh token is not found (null), it throws an InternalError to indicate the issue.
   * If the refresh token is found, it returns the user ID associated with the removed refresh token.
   * If any issues occur during the removal process, an error is thrown for proper error handling.
   */
  public async removeRefreshToken(cookie: string): Promise<Types.ObjectId> {
    try {
      // Attempt to find and remove the corresponding refresh token using the provided cookie
      const refreshToken = await this.model.findOneAndRemove({ refreshToken: cookie });

      // Check if the refreshToken is null, indicating that it was not found in the database
      if (refreshToken === null) {
        // If not found, throw an InternalError to indicate the issue
        throw new InternalError('Refresh token not found in the database.');
      }

      // Return the user ID associated with the removed refresh token
      return refreshToken.userId;
    } catch (error) {
      // If an error occurs during the database operation, it will be propagated, allowing for proper error handling.
      throw error;
    }
  }

  /**
   * Stores a refresh token in the database associated with a user.
   *
   * @param {string} refreshToken - The refresh token to be stored.
   * @param {string} userId - The user ID for whom the refresh token is stored.
   * @throws {InternalError} Throws an error if there's an issue during the database operation.
   *
   * @description
   * This method sets the lastLogin timestamp to the current date.
   * It finds and updates the refresh token in the database for the specified user ID.
   * If the user ID does not exist, a new document is created.
   * The method uses the filter { userId } to identify the record, the update { refreshToken, lastLogin }
   * to set the new values, and options { new: true, upsert: true, runValidators: true } to return the modified document,
   * create a new document if it doesn't exist (upsert), and run validators on update.
   * If the database operation is successful, it returns void; otherwise, it throws an InternalError.
   */
  public async storeRefreshTokenInDb(refreshToken: string, userId: string): Promise<void> {
    try {
      // Get the current lastLogin timestamp
      const lastLogin = new Date();

      // Find and update the refresh token in the database
      const userToken = await this.model.findOneAndUpdate(
        { userId },
        { refreshToken, lastLogin },
        { new: true, upsert: true, runValidators: true }
      );

      // If the token is null, it means the operation failed; throw an InternalError
      if (userToken === null) {
        throw new InternalError(`Store Token In Db Failed: ${userToken}.`);
      }

      // The operation was successful; no need to return anything
    } catch (error) {
      // If an error occurs during the database operation, throw an InternalError with a custom error message
      throw error;
    }
  }

  /**
   * Removes expired sessions based on the provided expiration date.
   *
   * @param {Date} expirationDate - The expiration date to identify sessions older than or equal to it.
   * @returns {Promise<void>} - Resolves when the removal of expired sessions is complete.
   */
  public async removeExpiredSessions(expirationDate: Date): Promise<void> {
    // Delete sessions with lastLogin timestamp less than or equal to the expiration date.
    await this.model.deleteMany({ lastLogin: { $lte: expirationDate } });
  }
}

export default SessionService;