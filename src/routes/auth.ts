import { Router } from "express";
import validateRequestBody from "../middlewares/validateBodyRequest";
import { validateLogin, validateResetPassword } from "../validation/auth";
import { limiter } from "../utils/limiter";
import AuthController from '../controllers/auth';
import { userAuthentication } from "../middlewares/userAuth";
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
  limiter, // Rate limiting middleware
  validateRequestBody(validateLogin), // Request body validation
  AuthController.authMongooseValidation(['username', 'password']),
  AuthController.login, // Controller function to handle login logic
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
router.get("/refresh-token", AuthController.refreshToken);

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
  AuthController.authMongooseValidation(['password', 'confirmPassword']),
  AuthController.resetPasswrod
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
router.delete("/logout", AuthController.logout);

export default router;