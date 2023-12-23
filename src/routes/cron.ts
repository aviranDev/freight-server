import { Router, Request, Response } from "express";
import Session from "../Models/Session";
import { logger } from "../logger/logger";

const yourCronTaskHandler = async (req: Request, res: Response) => {
  try {
    // Calculate the expiration date to identify records older than 7 days
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() - 10);

    // Remove active sessions older than the calculated expirationDate
    await Session.deleteMany({ lastLogin: { $lte: expirationDate } });

    // Log a debug message indicating successful execution of the cron task
    logger.debug('Cron task to remove expired refresh tokens ran at: ' + new Date().toLocaleString());

    // Respond with a success message
    res.status(200).json({ message: 'Cron task executed successfully!' });
  } catch (error) {
    // Log an error message if an error occurs during the cron task execution
    logger.error('Error in Cron task:', error);

    // Respond with an error status and message
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const router = Router();

router.get("/cron-job", yourCronTaskHandler); // Use /agents for agents-related routes


export default router