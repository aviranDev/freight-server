import { Router } from "express";
import validateRequestBody from "../middlewares/validateBodyRequest";
import { validateLogin, validateResetPassword } from "../validation/auth";
import { userAuthentication } from "../middlewares/userAuth";
import UserModel from "../Models/User";
import AuthService from "../services/auth";
import AuthController from '../controllers/auth';
import SessionService from "../services/session";
import Session from "../Models/Session";
import { Request, Response, NextFunction } from 'express';
import User from '../Models/User';

// Custom rate limiter middleware
const rateLimiter = (maxRequests: number, windowMs: number) => {
  // Create an object to store request counts and lock initiation time for each IP address
  const requestCounts: { [ip: string]: { count: number, lockTime?: number } } = {};

  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const username = req.body.username;

    try {
      // Find the user by username
      const user = await User.findOne({ username });

      // If a user is found, check if the lock duration has elapsed
      if (user) {
        const currentTime = Date.now();

        // Check if the IP address has a lock time and if the lock duration has elapsed
        if (requestCounts[ip]?.lockTime && currentTime < (requestCounts[ip] as { lockTime: number }).lockTime) {
          return res.status(429).json({ error: 'Too many requests, please try again later.' });
        }
      } else {
        // If no user is found, perform rate limiting
        requestCounts[ip] = requestCounts[ip] ?? { count: 0 };

        // Increment the request count for this IP address
        requestCounts[ip].count++;

        // Check if the request count exceeds the maximum allowed requests
        if (requestCounts[ip].count > maxRequests) {
          // Set the lock time for this IP address
          requestCounts[ip].lockTime = Date.now() + windowMs;

          // Reset the request count after the window duration
          setTimeout(() => {
            requestCounts[ip].count = 0;
            requestCounts[ip].lockTime = undefined;
          }, windowMs);

          return res.status(429).json({ error: 'Too many requests, please try again later.' });
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    // Proceed with the request
    next();
  };
};

// Example usage:
const maxRequests = 5; // Maximum allowed requests
const windowMs = 60 * 1000; // 1 minute in milliseconds

// Create the rate limiter middleware
const limiter = rateLimiter(maxRequests, windowMs);

const sessionService = new SessionService(Session);

// Create an instance of the User Service
const authService = new AuthService(UserModel, sessionService);

// Create an instance of the User Controller with the UserService instance
const authController = new AuthController(authService);

const router = Router();

/**
 * User Login
 * @method POST
 * @route /login
 * @description Logs in a user by validating credentials.
 * @access Public
 * @middleware
 * - limiter: Rate limiting to prevent abuse.
 * - validateRequestBody(validateLogin): Validates the request body against login schema.
 * - mongooseValidationSchema: Mongoose model validation for username and password.
 * @response JSON - Returns an access token upon successful login. 
 */
router.post("/login",
  limiter,
  validateRequestBody(validateLogin),
  authController.authMongooseValidation(['username', 'password']),
  authController.login,
);

/**
 * Refresh Access Token
 * @method GET
 * @route /refresh-token
 * @description Refreshes the access token using a refresh token.
 * @access Public
 * @middleware
 * - AuthController.refreshTokenHandler: Handles access token refresh logic.
 * @response JSON - Returns a new access token upon successful refresh.
 */
router.get("/refresh-token", authController.refreshToken);

/**
 * Reset Password
 * @method POST
 * @route /reset-password
 * @description Resets the user's password after authentication.
 * @access Private (Requires JWT authentication)
 * @middleware
 * - authJWT: Middleware for JWT authentication to ensure the user is authenticated.
 * - validateRequestBody(validateResetPassword): Middleware to validate the request body against the reset password schema.
 * - mongooseValidation(Member, ["password", "confirmPassword"]): Middleware for Mongoose model validation of "password" and "confirmPassword".
 * - AuthController.resetPassword: Controller function to handle the password reset logic.
 */
router.post('/reset-password',
  userAuthentication,
  validateRequestBody(validateResetPassword),
  authController.authMongooseValidation(['password', 'confirmPassword']),
  authController.resetPasswrod
);

/**
 * Logout
 * @method DELETE
 * @route /logout
 * @description Logs the user out by invalidating their session or access token.
 * @access Private (Requires authentication)
 * @middleware
 * AuthController.logout: Controller function to handle the logout process, 
 * which may include invalidating the session or access token.
 */
router.delete("/logout", authController.logout);

export default router;