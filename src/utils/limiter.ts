import { Request, Response, NextFunction } from 'express';
import User from '../Models/User';
import FailedLoginAttempt from '../Models/FailedLogin';
import { ManyRequests } from '../errors/manyRequests';

/**
 * Rate Limiter Middleware
 * This middleware function helps prevent brute-force attacks by limiting the number of login attempts
 * from a single IP address within a specified time window. If the number of failed login attempts
 * exceeds the maximum allowed requests, the IP address is temporarily blocked.
 * 
 * @param maxRequests - Maximum allowed login attempts from a single IP address within the windowMs timeframe.
 * @param windowMs - Time window in milliseconds during which the maxRequests are counted.
 * @returns Express middleware function to be used in route handling.
 *
 * The middleware checks if a user exists and whether their IP address has exceeded the allowed number of login attempts.
 * If the user does not exist, the failed login attempts are tracked. 
 * If the limit is exceeded, further login attempts are blocked until the time window elapses. 
 * Failed login attempts are recorded in the FailedLoginAttempt model, and a 
 * timeout is set to clear the record after the time window to allow for new login attempts.
 */
export const rateLimiter = (maxRequests: number, windowMs: number) => {
  let timeoutId: NodeJS.Timeout | null = null; // Store the timeout ID
  const errorMessage = 'Account is locked. try again later.';

  const clearPreviousTimeout = () => {
    if (timeoutId) clearTimeout(timeoutId);
  };

  const setLockTimeout = async (ip: string, windowMs: number) => {
    timeoutId = setTimeout(async () => {
      await FailedLoginAttempt.deleteOne({ ip });
    }, windowMs);
  };

  return async (request: Request, response: Response, next: NextFunction) => {
    const { ip, body: { username } } = request;

    try {
      // Find the user by username
      const user = await User.findOne({ username });

      // Find the existing record for this IP address
      const countDB = await FailedLoginAttempt.findOne({ ip });

      // Get the current time
      const currentTime = Date.now();

      // Check if the user exists and if the lock time for this IP address has not elapsed
      if (user && countDB?.lockTime && currentTime < countDB.lockTime) {
        throw new ManyRequests(errorMessage);
      }

      // If the user does not exist, increment the request count for this IP address
      if (!user) {
        const newCountDB = await FailedLoginAttempt.findOneAndUpdate(
          { ip },
          { $inc: { count: 1 }, $setOnInsert: { lockTime: 0 } },
          { upsert: true, new: true }
        );

        // Check if the request count exceeds the maximum allowed requests
        if (newCountDB.count >= maxRequests) {
          // Set the lock time for this IP address
          newCountDB.lockTime = Date.now() + windowMs;
          await newCountDB.save();

          // Clear previous timeout if it exists
          clearPreviousTimeout();

          // Set new timeout to remove the document after the window duration
          setLockTimeout(ip, windowMs);

          // Throw a ManyRequests error indicating that the account is locked
          throw new ManyRequests(errorMessage);
        }
      }
      // If the user exists proceed to the next middleware
      next();
    } catch (error) {
      // Pass any errors to the error-handling middleware
      next(error);
    }
  };
};

export default rateLimiter;