import { Request, Response, NextFunction } from 'express';
import { logger } from "../logger/logger";
import { HTTP_STATUS } from '../config/httpStatus';
import { IContact } from "../Models/Contact";
import { UnknownError } from '../errors/unknown';
import { IContactService } from '../services/contact';

class ContactController {
  // Declare an instance of ContactService as a property
  private service: IContactService;

  // Constructor to initialize the UserService instance
  constructor(service: IContactService) {
    this.service = service;
  }

  /**
   * Search for contacts based on query parameters.
   * @param request - Express request object containing query parameters.
   * @param response - Express response object to send the search result.
   * @param next - Express next function for error handling.
   * @returns A Promise resolving to void.
   */
  searchContact = async (request: Request, response: Response, next: NextFunction):
    Promise<void> => {
    try {
      // Extract query parameters from the request
      const name = request.query.name as string || undefined;
      const department = request.query.department as string || undefined;

      // Check if the 'name' parameter is missing; if so, throw an error
      if (name === undefined) {
        throw new UnknownError('Query not found.');
      }

      // Perform the contact search using the service
      const contact = await this.service.searchContact(name, department);

      // Respond with the search result in JSON format
      response.status(HTTP_STATUS.OK).json(contact);
    } catch (error) {
      // Pass any errors to the error-handling middleware
      next(error);
    } finally {
      // Log a message indicating that the operation is complete
      logger.debug('Search contacts complete.');
    }
  };

  /**
   * Route handler for fetching all contacts with optional pagination.
   * 
   * @param {Request} request - Express request object.
   * @param {Response} response - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * 
   * @description This middleware fetches all contacts from the contactService with optional pagination parameters.
   * It parses the pagination parameters from the request query or uses default values.
   * If the retrieval is successful, it responds with a "OK" status code (200) and the retrieved list of contacts.
   * If there are any errors during the process, they are passed to the error-handling middleware.
   * After the operation, it logs a debug message indicating the completion of the contact retrieval process.
   * 
   * @returns {Promise<void>} - Resolves with the retrieved list of contacts on successful retrieval.
   */
  allContacts = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse pagination parameters from the request query or use defaults.
      const page: number = parseInt(request.query.page as string) || 1;
      const limit: number = parseInt(request.query.limit as string) || 10;

      // Call the contactService to fetch all contacts.
      const contacts = await this.service.allContacts(page, limit);

      // Respond with the retrieved list of contacts.
      response.status(HTTP_STATUS.OK).json(contacts);
    } catch (error) {
      // Pass any errors to the error-handling middleware.
      next(error);
    } finally {
      // Log a message indicating that the operation is complete.
      logger.debug('Display contacts complete.');
    }
  };

  /**
   * Route handler for fetching a contact by its ID.
   * 
   * @param {Request} request - Express request object.
   * @param {Response} response - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * 
   * @description This middleware attempts to retrieve a contact by its ID from the request parameters.
   * It calls the contactService to fetch the contact details.
   * If the retrieval is successful, it responds with a "OK" status code (200) and the retrieved contact details.
   * If there are any errors during the process, they are passed to the error-handling middleware.
   * After the operation, it logs a debug message indicating the completion of the contact retrieval by ID process.
   * 
   * @returns {Promise<void>} - Resolves with the retrieved contact details on successful retrieval.
   */
  findContactById = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract the contact ID from the request parameters.
      const { id } = request.params;

      // Call the contactService to retrieve the contact by its ID.
      const contact = await this.service.readContactById(id);

      // Respond with the retrieved contact details.
      response.status(HTTP_STATUS.OK).json({ contact: contact });
    } catch (error) {
      // Pass any errors to the error-handling middleware.
      next(error);
    } finally {
      // Log a message indicating that the operation is complete.
      logger.debug('Display contact by id has been complete.');
    }
  };

  /**
   * Middleware function generator for selecting contacts by department.
   * 
   * @param {string} department - The department for which contacts will be retrieved.
   * @returns {Function} - An Express middleware function.
   * 
   * @description This middleware function is designed to fetch contacts for the specified department.
   * It takes a department parameter and returns an Express middleware function.
   * The middleware function parses pagination parameters from the request query or uses defaults,
   * then calls the contactService to fetch contacts for the specified department with pagination.
   * If the retrieval is successful, it responds with a "OK" status code (200) and the retrieved list of contacts.
   * If there are any errors during the process, they are passed to the error-handling middleware.
   * After the operation, it logs a debug message indicating the completion of the department selection process.
   * 
   * @returns {Promise<void>} - Resolves with a success message and the retrieved list of contacts on successful selection.
   */
  selectDepartment = (department: string):
    ((request: Request, response: Response, next: NextFunction) => Promise<void>) => {
    // Define and return an Express middleware function.
    return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
      try {
        // Parse pagination parameters from the request query or use defaults.
        const page: number = parseInt(request.query.page as string) || 1;
        const limit: number = parseInt(request.query.limit as string) || 10;

        // Call the contactService to fetch contacts for the specified department.
        const contacts = await this.service.selectDepartment(department, page, limit);

        // Respond with the retrieved list of department-specific contacts.
        response.status(HTTP_STATUS.OK).json(contacts);
      } catch (error) {
        // Pass any errors to the error-handling middleware.
        next(error);
      } finally {
        // Log a message indicating that the operation is complete.
        logger.debug('Select department is complete.');
      }
    }
  };

  /**
   * Route handler for creating a new contact.
   * 
   * @param {Request} request - Express request object.
   * @param {Response} response - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * 
   * @description This middleware extracts the request body and calls the contactService
   * to create a new contact using the data from the request body.
   * If the creation is successful, it responds with a "Created" status code (201),
   * indicating that the request was successful, and a new resource was created.
   * If there are any errors during the process, they are passed to the error-handling middleware.
   * After the operation, it logs a debug message indicating the completion of the contact creation process.
   * 
   * @returns {Promise<void>} - Resolves with a success message and a "Created" status code on successful creation.
   */
  createContact = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract the request body.
      const { body } = request;

      // Call the contactService to create a new contact.
      await this.service.createContact(body);

      // Respond with a success message.
      response.status(HTTP_STATUS.CREATED).send({ message: 'Contact has been created.' });
    } catch (error) {
      // Pass any errors to the error-handling middleware.
      next(error);
    } finally {
      // Log a message indicating that the operation is complete.
      logger.debug('Create contact is complete.');
    }
  };

  /**
   * Route handler for updating a contact by its ID.
   * 
   * @param {Request} request - Express request object.
   * @param {Response} response - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * 
   * @description This middleware extracts the contact ID from the request parameters and calls the contactService
   * to update the contact associated with that ID using the data from the request body.
   * If the update is successful, it responds with the updated contact and a "Created" status code (201),
   * indicating that the request was successful, and a new resource was created.
   * If there are any errors during the process, they are passed to the error-handling middleware.
   * After the operation, it logs a debug message indicating the completion of the contact update process.
   * 
   * @returns {Promise<void>} - Resolves with the updated contact and a "Created" status code on successful update.
   */
  updateContact = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract the contact ID from the request parameters.
      const { id } = request.params;

      // Call the contactService to update the contact.
      const updatedContact = await this.service.updateContact(id, request.body);

      // Respond with the updated contact.
      response.status(HTTP_STATUS.CREATED).send(updatedContact);
    } catch (error) {
      // Pass any errors to the error-handling middleware.
      next(error);
    } finally {
      // Log a message indicating that the operation is complete.
      logger.debug('Update contact is complete.');
    }
  };

  /**
   * Route handler for removing a contact by its ID.
   * 
   * @param {Request} request - Express request object.
   * @param {Response} response - Express response object.
   * @param {NextFunction} next - Express next middleware function.
   * 
   * @description This middleware extracts the contact ID from the request parameters and calls the contactService
   * to remove the contact associated with that ID. If the removal is successful, it responds with a "No Content" status code (204),
   * indicating that the request was processed successfully, but there is no content to send in the response body.
   * If there are any errors during the process, they are passed to the error-handling middleware.
   * After the operation, it logs a debug message indicating the completion of the contact removal process.
   * 
   * @returns {Promise<void>} - Resolves with a success message and a "No Content" status code on successful removal.
   */
  removeContact = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract the contact ID from the request parameters.
      const { id } = request.params;

      // Call the contactService to remove the contact.
      await this.service.removeContact(id);

      // Respond with a success message.
      response.status(HTTP_STATUS.CREATED).send({ message: 'Contact has been deleted.' });
    } catch (error) {
      // Pass any errors to the error-handling middleware.
      next(error);
    } finally {
      // Log a message indicating that the operation is complete.
      logger.debug('Removed contact is complete.');
    }
  };

  /**
   * Middleware function generator for validating contact data using Mongoose schema keys.
   * 
   * @param {Array<keyof IContact>} keys - An array of keys representing the Mongoose schema fields for contact data.
   * @returns {(request: Request, response: Response, next: NextFunction) => Promise<void>} - An Express middleware function.
   * 
   * @description 
   * This middleware function is designed to validate contact data based on the provided Mongoose schema keys.
   * It uses the contactValidationContainer method of the service for validation.
   * If the validation is successful, it calls the next middleware in the chain. Otherwise, it passes the error to the error-handling middleware.
   * This middleware is intended to be used before routes that require validated contact data.
   * 
   * @returns {Promise<void>} - Resolves with a success message on successful validation.
   */
  contactMongooseValidation(keys: (keyof IContact)[]):
    (request: Request, response: Response, next: NextFunction) => Promise<void> {
    return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
      try {
        // Call the service to perform validation based on provided keys
        await this.service.contactValidationContainer(request.body, keys);

        // Continue to the next middleware if validation passes
        next();
      } catch (error) {
        // Pass any errors to the error-handling middleware
        next(error);
      }
    }
  };
};

export default ContactController;