import { userAuthentication } from "../../middlewares/userAuth";
import authResetPassword from "../../middlewares/authResetPassword";

// Middleware for common operations that need to be executed across multiple routes.
export const authMiddlewares = [
  userAuthentication, // Verifies the user's authentication using JWT.
  authResetPassword, // Ensures the user is not in the password reset flow.
];