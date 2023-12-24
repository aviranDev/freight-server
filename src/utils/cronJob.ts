import { CronJob } from 'cron';
import { logger } from "../logger/logger";
import axios from 'axios';
import { config } from '../config/server';

/**
 * Starts a cron job to perform a specific task at scheduled intervals.
 * The cron job runs every hour, making an HTTP request to an Express route.
 * After execution, it logs a debug message with the timestamp.
 * Note: This is intended for local development using a server running on http://localhost:port.
 */
export const startCronJob = async () => {
  new CronJob(
    // Cron schedule: Runs every hour
    // "0 * * * *", 
    "*/5 * * * *",
    async () => {
      try {
        // Make an HTTP request to your Express route (local server for development)
        await axios.get(`http://localhost:${config.PORT}/api/crons/cron-job`);

        // Log a debug message indicating successful execution of the cron job
        logger.debug('Cron job ran at: ' + new Date().toLocaleString());
      } catch (error) {
        // Log an error message if an error occurs during the cron job execution
        logger.error('Error in Cron job:', error);
      }
    },
    null, // Callback function parameter (null as it's not needed)
    true, // Start the cron job immediately upon instantiation
    Intl.DateTimeFormat().resolvedOptions().timeZone // Time zone for the cron job
  );
};

export default startCronJob;