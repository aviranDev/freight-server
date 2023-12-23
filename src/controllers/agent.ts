import { Request, Response, NextFunction } from 'express';
import { logger } from "../logger/logger";
import { HTTP_STATUS } from '../config/httpStatus';
import AgentService from '../services/agents';
import { IAirline } from '../interfaces/modelsInterfaces';
import UnknownError from '../errors/services/unknown';

class AgentsController {
  // Declare an instance of AirlineService as a property
  private service = new AgentService();

  allAgents = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse pagination parameters from the request query or use defaults.
      const page: number = parseInt(request.query.page as string) || 1;
      const limit: number = parseInt(request.query.limit as string) || 10;

      // Call the airline service to fetch all airlines.
      const agents = await this.service.allAgents(page, limit);

      // Respond with a success message.
      response.status(HTTP_STATUS.OK).json(agents);
    } catch (error) {
      // Pass any errors to the error-handling middleware.
      next(error);
    } finally {
      // Log a message indicating that the operation is complete.
      logger.debug('Display agents complete.');
    }
  }

  selectByPort = (port: string):
    ((request: Request, response: Response, next: NextFunction) => Promise<void>) => {
    // Define and return an Express middleware function.
    return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
      try {
        // Parse pagination parameters from the request query or use defaults.
        const page: number = parseInt(request.query.page as string) || 1;
        const limit: number = parseInt(request.query.limit as string) || 10;

        // Call the airline service to fetch agents for the specified port.
        const portAgents = await this.service.selectByPort(port, page, limit);

        // Respond with a success message.
        response.status(HTTP_STATUS.OK).json(portAgents);
      } catch (error) {
        // Pass any errors to the error-handling middleware.
        next(error);
      } finally {
        // Log a message indicating that the operation is complete.
        logger.debug('Port agents is complete.');
      }
    }
  }

};

export default new AgentsController();