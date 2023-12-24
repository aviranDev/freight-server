import { Request, Response, NextFunction } from 'express';
import { logger } from "../logger/logger";
import { HTTP_STATUS } from '../config/httpStatus';
import AirlineService from '../services/airline';
import { IAirline } from '../interfaces/modelsInterfaces';
import UnknownError from '../errors/services/unknown';

class AirlineController {
  // Declare an instance of AirlineService as a property
  private service = new AirlineService();

  /**
   * Route handler to retrieve a list of all airlines with optional pagination.
   * 
   * @param {Request} request - Express request object.
   * @param {Response} response - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * 
   * @description This middleware fetches a list of all airlines with optional pagination.
   * It parses pagination parameters from the request query or uses default values.
   * It then calls the allAirlines method of the AirlineService to fetch the list of airlines.
   * If the retrieval is successful, it responds with a success message containing the list of airlines.
   * If there are any errors during the process, they are passed to the error-handling middleware.
   * After the operation, it logs a message indicating that the retrieval of all airlines is complete.
   * 
   * @returns {Promise<void>} - Resolves with a list of airlines on successful retrieval.
   */
  allAirlines = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse pagination parameters from the request query or use defaults.
      const page: number = parseInt(request.query.page as string) || 1;
      const limit: number = parseInt(request.query.limit as string) || 10;

      // Call the airline service to fetch all airlines.
      const airlines = await this.service.allAirlines(page, limit);

      // Respond with a success message.
      response.status(HTTP_STATUS.OK).json(airlines);
    } catch (error) {
      // Pass any errors to the error-handling middleware.
      next(error);
    } finally {
      // Log a message indicating that the operation is complete.
      logger.debug('Display contacts complete.');
    }
  }

  /**
   * Route handler to retrieve details of a specific airline by its ID.
   * 
   * @param {Request} request - Express request object.
   * @param {Response} response - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * 
   * @description This middleware retrieves details of a specific airline by its unique ID.
   * It extracts the airline ID from the request parameters.
   * It then calls the readAirlineById method of the AirlineService to retrieve the airline details.
   * If the retrieval is successful, it responds with a success message containing the airline details.
   * If there are any errors during the process, they are passed to the error-handling middleware.
   * After the operation, it logs a message indicating that the retrieval operation is complete.
   * 
   * @returns {Promise<void>} - Resolves with the airline details on successful retrieval.
   */
  getAirlineById = async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Extract the airline ID from the request parameters.
      const { id } = request.params;

      // Call the airline service to retrieve the airline by its ID.
      const airline = await this.service.getAirlineById(id);

      // Respond with a success message.
      response.status(HTTP_STATUS.OK).send({ airline: airline });
    } catch (error) {
      // Pass any errors to the error-handling middleware.
      next(error);
    } finally {
      // Log a message indicating that the operation is complete.
      logger.debug('Display contacts complete.');
    }
  }

  /**
   * Middleware function generator for retrieving a list of airlines for a specified port with optional pagination.
   * 
   * @param {string} port - The name of the port for which to fetch airlines.
   * @returns {Function} - An Express middleware function.
   * 
   * @description This middleware function is designed to retrieve a list of airlines for the specified port with optional pagination.
   * It takes a port name as a parameter and returns an Express middleware function.
   * The middleware function extracts pagination parameters from the request query or uses defaults.
   * It then calls the selectPort method of the AirlineService to fetch airlines for the specified port.
   * If the retrieval is successful, it responds with a success message containing the port-specific airlines.
   * If there are any errors during the process, they are passed to the error-handling middleware.
   * After the operation, it logs a message indicating that the retrieval operation for port-specific airlines is complete.
   * 
   * @returns {Promise<void>} - Resolves with a list of port-specific airlines on successful retrieval.
   */
  selectByPort = (port: string):
    ((request: Request, response: Response, next: NextFunction) => Promise<void>) => {
    // Define and return an Express middleware function.
    return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
      try {
        // Parse pagination parameters from the request query or use defaults.
        const page: number = parseInt(request.query.page as string) || 1;
        const limit: number = parseInt(request.query.limit as string) || 10;

        // Call the airline service to fetch airlines for the specified port.
        const portAirlines = await this.service.selectByPort(port, page, limit);

        // Respond with a success message.
        response.status(HTTP_STATUS.OK).json(portAirlines);
      } catch (error) {
        // Pass any errors to the error-handling middleware.
        next(error);
      } finally {
        // Log a message indicating that the operation is complete.
        logger.debug('Port airlines is complete.');
      }
    }
  }

  /**
 * Handles the search for an airline based on either name or prefix.
 * @param {Request} request - Express request object.
 * @param {Response} response - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<void>} - A Promise that resolves when the function completes.
 */
  searchAirline = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract search parameters from the query string
      const searchByName = request.query.name as string || undefined;
      const searchByPrefix = request.query.prefix as string || undefined;
      const searchByAgent = request.query.agent as string || undefined;

      // Check if either name, prefix or agent are missing; if are, throw an error
      if (searchByName === undefined && searchByPrefix === undefined && searchByAgent === undefined) {
        throw new UnknownError('Query not found.');
      }

      // Initialize the result variable
      let result = null;

      // If searching by airline name is specified, call the corresponding service method
      if (searchByName !== undefined) {
        result = await this.service.searchAirlineByName(searchByName);
      }

      // If searching by prefix is specified, call the corresponding service method
      if (searchByPrefix !== undefined) {
        result = await this.service.searchAirlineByPrefixNumber(searchByPrefix);
      }

      // If searching by agent is specified, call the corresponding service method
      if (searchByAgent !== undefined) {
        result = await this.service.searchAirlineByAgent(searchByAgent);
      }

      // Respond with the result in the JSON format
      response.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      // Pass any caught errors to the next middleware
      next(error);
    } finally {
      // Log a message indicating that the operation is complete.
      logger.debug('Search airline complete.');
    }
  };

  /**
   * Route handler to add a new airline.
   * 
   * @param {Request} request - Express request object.
   * @param {Response} response - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * 
   * @description This middleware adds a new airline based on the provided data, including an AWB number.
   * It extracts the AWB number from the request body.
   * It then calls the addAirline method of the AirlineService to add the new airline.
   * If the addition is successful, it responds with a success message.
   * If there are any errors during the process, they are passed to the error-handling middleware.
   * After the operation, it logs a message indicating that the addition operation is complete.
   * 
   * @returns {Promise<void>} - Resolves with a success message on successful addition.
   */
  createAirline = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Step 1: Call the airline service to add a new airline.
      await this.service.createAirline(request.body);

      // Step 2: Respond with a success message.
      response.status(HTTP_STATUS.CREATED).send(
        { message: `The airline: ${request.body.name} has been added.` }
      );
    } catch (error) {
      // Step 3: Pass any errors to the error-handling middleware.
      next(error);
    } finally {
      // Step 4: Log a message indicating that the operation is complete.
      logger.debug('Create airline complete.');
    }
  };

  /**
   * Route handler to update the details of an airline.
   *
   * @route PUT /update-airline/:id
   * @param {Request} request - Express request object.
   * @param {Response} response - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   *
   * @description
   * This middleware updates the details of an airline based on the provided ID.
   * It extracts the airline ID from the request parameters and calls the updateAirline method of the AirlineService.
   * If the update is successful, it responds with a success message.
   * If there are any errors during the process, they are passed to the error-handling middleware.
   * After the operation, it logs a message indicating that the update operation is complete.
   *
   * @returns {Promise<void>} - Resolves with a success message on successful update.
   */
  updateAirline = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Step 1: Extract the airline ID from the request parameters.
      const { id } = request.params;

      // Step 2: Call the airline service to update the airline.
      const updatedAirline = await this.service.updateAirline(id, request.body);

      // Step 3: Respond with a success message.
      response.status(HTTP_STATUS.CREATED).send(
        { updatedAirline, message: `The airline: ${request.body.name} has been Updated.` }
      );
    } catch (error) {
      // Step 4: Pass any errors to the error-handling middleware.
      next(error);
    } finally {
      // Step 5: Log a message indicating that the operation is complete.
      logger.debug('Update airline complete.');
    }
  };

  /**
   * Route handler to remove an airline by its name or prefix.
   *
   * @param {Request} request - Express request object.
   * @param {Response} response - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * 
   * @description
   * This middleware removes an airline based on its name or prefix.
   * It extracts the ID from the request parameters.
   * If the ID is not provided, it throws an error.
   * It calls the corresponding service method to perform the removal operation.
   * If the removal is successful, it responds with a success message.
   * If there are any errors during the process, they are passed to the error-handling middleware.
   * After the operation, it logs a message indicating that the removal operation is complete.
   *
   * @returns {Promise<void>} Resolves with a success message on successful removal.
   */
  removeAirline = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract ID from the request parameters
      const { id } = request.params;

      // Call the service method to remove the airline by ID
      await this.service.removeAirlineById(id);

      // Respond with a success message.
      response.status(HTTP_STATUS.CREATED).send({ message: 'Contact has been deleted.' });
    } catch (error) {
      // Pass any errors to the error-handling middleware.
      next(error);
    } finally {
      // Log a message indicating that the operation is complete.
      logger.debug('Remove airline complete.');
    }
  };

  /**
   * Middleware function generator for validating airline data using Mongoose schema keys.
   * 
   * @param {Array<keyof IAirline>} keys - An array of keys representing the Mongoose schema fields for airline data.
   * @returns {Function} - An Express middleware function.
   * 
   * @description This middleware function is designed to validate airline data based on the provided Mongoose schema keys.
   * It uses the airlineValidationContainer method of the AirlineService for validation.
   * If the validation is successful, it calls the next middleware in the chain. Otherwise, it passes the error to the error-handling middleware.
   * This middleware is intended to be used before routes that require validated airline data.
  */
  airlineMongooseValidation(keys: (keyof IAirline)[]):
    (request: Request, response: Response, next: NextFunction) => Promise<void> {
    return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
      try {
        // Validate airline data using the provided keys.
        await this.service.airlineValidationContainer(request.body, keys);

        // If validation is successful, proceed to the next middleware.
        next();
      } catch (error) {
        // If validation fails, pass the error to the error-handling middleware.
        next(error);
      }
    }
  };
};

export default new AirlineController();