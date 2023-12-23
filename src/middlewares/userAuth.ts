import { Request, Response, NextFunction } from "express";
import TokenService from "../services/token";
import AuthenticationError from "../errors/services/authetication";
import AuthorizationError from "../errors/services/authorization";

// Create an instance of the TokenService to handle token operations
const token = new TokenService();

/**
 * Middleware for JWT (JSON Web Token) authentication.
 * This middleware checks the 'authorization' header for a valid JWT token.
 * @param request - The Express request object.
 * @param response - The Express response object.
 * @param next - The Express next function to proceed to the next middleware/route.
 */
export const userAuthentication = (request: Request, response: Response, next: NextFunction): void => {
  try {
    // Check for the 'authorization' header in the request
    const authHeader = request.headers["authorization"];

    // If the header is missing or doesn't start with 'Bearer ', throw an AuthenticationError
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError("Access denied. No token provided.");
    }

    // Verify the access token and set the user data in the request object
    const payload = token.verifyAccessToken(authHeader);
    request.user = payload;

    // Continue to the next middleware or route
    next();
  } catch (error) {
    // Handle errors
    if (error instanceof AuthenticationError) {
      return next(error);
    }

    // If it's any other error, return a AuthorizationError with a message
    next(new AuthorizationError("Invalid Token: " + error));
  }
};

export default userAuthentication; 