import rateLimit from "express-rate-limit";
import User from "../Models/User";

const maxAttempts = 5; // Define the maximum attempts separately
// const LOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const LOCK_DURATION_MS = 2 * 60 * 1000; // 2 minutes in milliseconds

/**
 * @description Limiter
 * @access Public
 * Create a block route for multiple login attempts.
 * timer: 15 minutes.
 * statusCode: Forbidden (403).*/
export const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 1 minute
  max: maxAttempts,
  skipSuccessfulRequests: true, // Skip successful login attempts

  statusCode: 403,
  message: {
    message: "Login Failed",
    error: {
      status: 403,
      name: "Authentication Error",
      message: "Too many API requests from this IP, please try again after 1 minute. test"
    }
  },
});

export default limiter;