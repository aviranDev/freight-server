import rateLimit from "express-rate-limit";

/**
 * @description Limiter
 * @access Public
 * Create a block route for multiple login attempts.
 * timer: 15 minutes.
 * statusCode: Forbidden (403).*/
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  max: 5,
  statusCode: 403,
  message: {
    message:
      "Too many API requests from this IP, please try again after 15 minutes.",
  },
});

export default limiter;