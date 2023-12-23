import { CronJob } from 'cron';
import Session from "../Models/Session";
import { logger } from "../logger/logger";

/**
 * Starts a cron job to remove expired refresh tokens at regular intervals.
 * The cron job runs every 10 minutes to clean up stale data in the database.
 */
export const startCronJob = () => {
  new CronJob(
    "0 * * * *", // Cron schedule: Runs every hour
    async () => {
      // Calculate the expiration date to identify records older than 7 days
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() - 7);

      try {
        // Remove active sessions older than the calculated expirationDate
        await Session.deleteMany({ lastLogin: { $lte: expirationDate } });

        // Log a debug message indicating successful execution of the cron job
        logger.debug("Cron job to remove expired refresh tokens ran at: " + new Date().toLocaleString());
      } catch (error) {
        // Log an error message if an error occurs during the cron job execution
        logger.error("Error in Cron job:", error);
      }
    },
    null, // Callback function parameter (null as it's not needed)
    true, // Start the cron job immediately upon instantiation
    Intl.DateTimeFormat().resolvedOptions().timeZone // Time zone for the cron job
  );
}

export default startCronJob;