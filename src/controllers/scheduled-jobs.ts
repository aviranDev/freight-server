import { Request, Response, NextFunction } from 'express';
import { logger } from "../logger/logger";
import { HTTP_STATUS } from '../config/httpStatus';
import ISessionService from '../interfaces/ISessionService';

export class ScheduledJobController {
  // Declare an instance of AirlineService as a property
  private service: ISessionService;

  // Constructor to initialize the UserService instance
  constructor(service: ISessionService) {
    this.service = service;
  }

  /**
   * Controller method for the cron task.
   * 
   * @param {Request} request - Express request object.
   * @param {Response} response - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * @returns {Promise<void>} - Resolves with a success message on successful execution.
   */
  cronTask = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Define the number of days to keep sessions
      const DAYS_TO_KEEP_SESSIONS = 7;

      // Calculate the expiration date to identify records older than 7 days
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() - DAYS_TO_KEEP_SESSIONS);

      // Remove active sessions older than the calculated expirationDate
      await this.service.removeExpiredSessions(expirationDate)

      // Log a debug message indicating successful execution of the cron task
      logger.debug('Cron task to remove expired refresh tokens ran at: ' + new Date().toLocaleString());

      // Respond with a success message
      response.status(HTTP_STATUS.OK).json({ message: 'Cron task executed successfully!' });
    } catch (error) {
      // Log an error message if an error occurs during the cron task execution
      logger.error('Error in Cron task at ' + new Date().toLocaleString() + ':', error);

      // Respond with an error status and message
      response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
  };
};

export default ScheduledJobController;