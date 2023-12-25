import { Request, Response, NextFunction } from 'express';
import { logger } from "../logger/logger";
import { HTTP_STATUS } from '../config/httpStatus';
import AgentService from '../services/agents';
import { IAgent } from '../interfaces/modelsInterfaces';

class AgentsController {
  // Declare an instance of AirlineService as a property
  private service = new AgentService();

  /**
   * Express middleware function for retrieving all agents.
   *
   * @param {Request} request - Express request object.
   * @param {Response} response - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * @returns {Promise<void>} - Resolves with all agent details on successful retrieval.
   *
   * @description This middleware function fetches all agents.
   *   It parses pagination parameters from the request query or uses default values.
   *   Subsequently, it calls the `allAgents` method of the service to retrieve all agents.
   *   If the operation is successful, it responds with a success message containing the agents.
   *   In case of any errors during the process, they are passed to the error-handling middleware.
   *   After completing the operation, it logs a message indicating the successful completion.
   */
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

  /**
   * Returns an Express middleware function for retrieving agents associated with a specific port.
   *
   * @param {string} port - The port for which agents are to be fetched.
   * @returns {(request: Request, response: Response, next: NextFunction) => Promise<void>} - Express middleware function.
   *
   * @description This middleware function fetches agents associated with the specified port.
   *   It parses pagination parameters from the request query or uses default values.
   *   Subsequently, it calls the `selectByPort` method of the service to retrieve agents.
   *   If the operation is successful, it responds with a success message containing the agents.
   *   In case of any errors during the process, they are passed to the error-handling middleware.
   *   After completing the operation, it logs a message indicating the successful completion.
   */
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

  /**
   * Route handler for retrieving details of a specific airline by its ID.
   *
   * @param {Request} request - Express request object.
   * @param {Response} response - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   *
   * @description This middleware retrieves details of a specific airline by its unique ID.
   *   It extracts the airline ID from the request parameters.
   *   Subsequently, it calls the `getAgentById` method of the `AgentService` to retrieve the agent details.
   *   If the retrieval is successful, it responds with a success message containing the agent details.
   *   In case of any errors during the process, they are passed to the error-handling middleware.
   *   After completing the operation, it logs a message indicating the successful completion of the retrieval.
   *
   * @returns {Promise<void>} - Resolves with the agent details on successful retrieval.
   */
  getAgentById = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract the airline ID from the request parameters.
      const { id } = request.params;

      // Call the agent service to retrieve the agent by its ID.
      const agent = await this.service.getAgentById(id);

      // Respond with a success message.
      response.status(HTTP_STATUS.OK).send({ agent: agent });
    } catch (error) {
      // Pass any errors to the error-handling middleware.
      next(error);
    } finally {
      // Log a message indicating that the operation is complete.
      logger.debug('Display agents is complete.');
    }
  }

  /**
   * Controller method to create a new agent.
   *
   * @param {Request} request - Express request object.
   * @param {Response} response - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * @returns {Promise<void>} - Resolves with a success message if the agent is created successfully.
   * @throws {Error} - If any error occurs during the creation process.
   */
  createAgent = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Step 1: Call the agent service to add a new agent.
      await this.service.createAgent(request.body);

      // Step 2: Respond with a success message.
      response.status(HTTP_STATUS.CREATED).send(
        { message: `The agent: ${request.body.agent} has been added.` }
      );
    } catch (error) {
      // Pass any errors to the error-handling middleware.
      next(error);
    } finally {
      // Log a message indicating that the operation is complete.
      logger.debug('Create agent is complete.');
    }
  }

  /**
   * Controller method to update an existing agent.
   *
   * @param {Request} request - Express request object.
   * @param {Response} response - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * @returns {Promise<void>} - Resolves with updated agent details and a success message if the update is successful.
   * @throws {Error} - If any error occurs during the update process.
   */
  updateAgent = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Step 1: Extract the airline ID from the request parameters.
      const { id } = request.params;

      // Step 2: Call the agent service to update the agent.
      const updatedAirline = await this.service.updateAgent(id, request.body);

      // Step 3: Respond with a success message.
      response.status(HTTP_STATUS.CREATED).send(
        { updatedAirline, message: `Agent: ${request.body.agent} has been Updated.` }
      );
    } catch (error) {
      // Pass any errors to the error-handling middleware.
      next(error);
    } finally {
      // Log a message indicating that the operation is complete.
      logger.debug('Update agent is complete.');
    }
  }

  /**
   * Middleware for validating agent data using Mongoose schema based on specified keys.
   *
   * @param {Array<keyof IAgent>} keys - The keys to validate in the agent data.
   * @returns {(request: Request, response: Response, next: NextFunction) => Promise<void>} - Express middleware function.
   */
  agentMongooseValidation(keys: (keyof IAgent)[]):
    (request: Request, response: Response, next: NextFunction) => Promise<void> {
    return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
      try {
        // Step 1: Validate agent data using the provided keys.
        await this.service.agentValidationContainer(request.body, keys);

        // Step 2: If validation is successful, proceed to the next middleware.
        next();
      } catch (error) {
        // Step 3: If validation fails, pass the error to the error-handling middleware.
        next(error);
      }
    }
  }

  /**
   * Asynchronously removes an agent by ID.
   *
   * @param {Request} request - Express request object.
   * @param {Response} response - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * @returns {Promise<void>} - Resolves after successfully removing the agent.
   * @throws {Error} - Propagates any errors that occur during the removal process.
   */
  removeAgent = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract ID from the request parameters
      const { id } = request.params;

      // Call the service method to remove the airline by ID
      await this.service.removeAgentById(id);

      // Respond with a success message.
      response.status(HTTP_STATUS.CREATED).send({ message: 'Agent has been deleted.' });
    } catch (error) {
      // Pass any errors to the error-handling middleware.
      next(error);
    } finally {
      // Log a message indicating that the operation is complete.
      logger.debug('Remove agent complete.');
    }
  }
};

export default new AgentsController();