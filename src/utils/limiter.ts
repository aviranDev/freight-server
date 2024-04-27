import { Request, Response, NextFunction } from 'express';
import User from '../Models/User';
import FailedLoginAttempt from '../Models/FailedLogin';
import ManyRequests from '../errors/services/manyRequest';

// Custom rate limiter middleware
export const rateLimiter = (maxRequests: number, windowMs: number) => {
  let timeoutId: NodeJS.Timeout | null = null; // Store the timeout ID
  const errorMessage = 'Account is locked. Too many requests, please try again later.';

  return async (req: Request, res: Response, next: NextFunction) => {
    const { ip, body: { username } } = req;

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
        if (newCountDB.count > maxRequests) {
          // Set the lock time for this IP address
          newCountDB.lockTime = Date.now() + windowMs;
          await newCountDB.save();

          // Clear previous timeout if it exists
          if (timeoutId) clearTimeout(timeoutId);

          // Set new timeout to remove the document after the window duration
          timeoutId = setTimeout(async () => {
            await FailedLoginAttempt.deleteOne({ ip });
          }, windowMs);

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