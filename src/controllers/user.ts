import { Request, Response, NextFunction } from "express";
import { IUser } from "../interfaces/modelsInterfaces";
import { logger } from "../logger/logger";
import { HTTP_STATUS } from '../config/httpStatus';
import { IUserService } from "../interfaces/UserInterface";

class UserController {
  // Declare an instance of UserService as a property
  private service: IUserService;

  // Constructor to initialize the UserService instance
  constructor(service: IUserService) {
    this.service = service;
  }

  /**
   * Adds a new member to the system.
   * @async
   * @param {Request} request - Express request object containing member information.
   * @param {Response} response - Express response object for sending the operation result.
   * @param {NextFunction} next - Express next middleware function.
   * @returns {Promise<void>} Promise that resolves when the operation is complete.
   * @throws {Error} Throws an error if there's an issue with member addition.
   * @description Handles the addition of a new member to the system.
   * @remarks
   * This method extracts member information from the request body and adds the new member using the service.
   * Upon successful addition, it sends a success message along with the newly created member via the response.
   * If any error occurs during the process, it forwards the error to the next middleware for proper handling.
   * Finally, it logs the completion of the registration operation for monitoring purposes.
   */
  addMember = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract member information from the request body.
      const member: IUser = request.body;

      // Add the new member using the service.
      const newMember = await this.service.addMember(member);

      // Respond with a success message and the newly created member.
      response.status(HTTP_STATUS.CREATED).json({ newMember, message: "User Added Successfully." });
    } catch (error) {
      // Handle errors by passing them to the next middleware.
      next(error);
    } finally {
      // Log that the registration operation has completed.
      logger.debug("Registration operation Completed.");
    }
  };

  /**
   * Displays a paginated list of employee members.
   * @async
   * @param {Request} request - Express request object with pagination query parameters.
   * @param {Response} response - Express response object for sending the employee list and pagination details.
   * @param {NextFunction} next - Express next middleware function.
   * @returns {Promise<void>} Promise that resolves when the operation is complete.
   * @throws {Error} Throws an error if there's an issue retrieving employee data.
   * @description Handles the display of a paginated list of employee members.
   * @remarks
   * This method parses pagination parameters from the request query or uses default values if not provided.
   * It then retrieves employee data from the service based on the pagination parameters.
   * The retrieved employee list and pagination details are sent as a JSON response.
   * If any error occurs during the process, it forwards the error to the next middleware for proper handling.
   * Upon completion, it logs the status of the display members operation for monitoring purposes.
   */
  displayAllEmployees = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse pagination parameters from the request query or use defaults.
      const page: number = parseInt(request.query.page as string) || 1;
      const limit: number = parseInt(request.query.limit as string) || 10;

      // Retrieve employee data from the service.
      const reponse = await this.service.displayAllEmployees(page, limit);

      // Respond with the list of employees and pagination details.
      response.status(HTTP_STATUS.OK).json({
        employees: reponse.employeeMembers,
        pagination: {
          currentPage: reponse.currentPage,
          totalPages: reponse.totalPages,
          totalItems: reponse.totalItems,
        },
      });
    } catch (error) {
      // Handle errors by passing them to the next middleware.
      next(error);
    } finally {
      // Log that the display members operation has completed.
      logger.debug("Display Members operation Completed.");
    }
  };

  /**
   * Removes a member identified by their ID.
   * @async
   * @param {Request} request - Express request object containing the member's ID in parameters.
   * @param {Response} response - Express response object for sending the operation result.
   * @param {NextFunction} next - Express next middleware function.
   * @returns {Promise<void>} Promise that resolves when the operation is complete.
   * @throws {ClientError} Throws a 404 ClientError if the member with the specified ID is not found.
   * @description Handles the removal of a member based on their ID.
   * @remarks
   * This method extracts the member's ID from the request parameters and uses the service to remove the member from the system.
   * Upon successful removal, it sends a success message via the response.
   * If the specified member ID is not found, it throws a 404 ClientError.
   * In case of any error during the process, it forwards the error to the next middleware for proper handling.
   * Finally, it logs the completion of the member removal operation for monitoring purposes.
   */
  removeMember = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract the member ID from the request parameters.
      const { id } = request.params;

      // Remove the member using the service.
      await this.service.removeMember(id);

      // Respond with a success message.
      response.status(HTTP_STATUS.OK).json({ message: `Document with ID ${id} has been deleted successfully.` });
    } catch (error) {
      next(error);
    } finally {
      // Log that the member document deletion operation has completed.
      logger.debug("Member document deletion operation completed.");
    }
  };

  /**
   * Edits the role of a member identified by their ID.
   * @async
   * @param {Request} request - Express request object containing the member's ID in parameters and updated role in body.
   * @param {Response} response - Express response object for sending the operation result.
   * @param {NextFunction} next - Express next middleware function.
   * @returns {Promise<void>} Promise that resolves when the operation is complete.
   * @throws {ClientError} Throws a 404 ClientError if the member with the specified ID is not found.
   * @description Handles the modification of a member's role based on their ID.
   * @remarks
   * This method extracts the member's ID from the request parameters and calls the service to update the member's role with the provided role data.
   * Upon successful role update, it sends a success message via the response.
   * In case of any error during the process, it forwards the error to the next middleware for proper handling.
   * Finally, it logs the completion of the member role change operation for monitoring purposes.
   */
  changeMemberRole = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract the member ID from the request parameters.
      let { id } = request.params;

      // Call the service to update the member's role.
      const upgradeMemberRole = await this.service.editMemberRole(id, request.body.role);

      // Respond with a success message.
      response.status(HTTP_STATUS.CREATED).send({ message: `Member role has been updated to: ${upgradeMemberRole?.role}` });
    } catch (error) {
      next(error);
    } finally {
      // Log that the member document deletion operation has completed.
      logger.debug("Member chagned role operation completed.");
    }
  };

  /**
   * Retrieves the profile of a member.
   * @async
   * @param {Request} request - Express request object containing member identification.
   * @param {Response} response - Express response object for sending the member's profile data.
   * @param {NextFunction} next - Express next middleware function.
   * @returns {Promise<void>} Promise that resolves when the operation is complete.
   * @throws {Error} Throws an error if there's an issue retrieving the member's profile.
   * @description Handles the retrieval of a member's profile.
   * @remarks
   * This method attempts to fetch the profile data of the authenticated member from the service.
   * If successful, it sends the member's profile data in JSON format via the response.
   * If an error occurs during the process, it forwards the error to the next middleware for proper handling.
   * Upon completion, it logs the status of the member profile retrieval operation for monitoring purposes.
   */
  memberProfile = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      // Try to retrieve the profile of the authenticated member.
      const member = await this.service.userProfile(request.user._id);

      // Respond with the member's profile data in JSON format.
      response.status(HTTP_STATUS.OK).send(member);
    } catch (error) {
      next(error);
    } finally {
      // Log that the member profile retrieval operation has completed.
      logger.debug("Member display profile operation completed.");
    }
  };

  /**
   * Generates a middleware function for validating user data using Mongoose schema keys.
   * @param {Array<keyof IUser>} keys - An array of keys representing Mongoose schema fields for user data.
   * @returns {(request: Request, response: Response, next: NextFunction) => Promise<void>} - Express middleware function.
   * @description Middleware function that generates a validator for user data based on specified Mongoose schema keys.
   * @remarks
   * This middleware utilizes the `userValidationContainer` method from the service to validate incoming user data.
   * If validation succeeds, it proceeds to the next middleware in the chain.
   * If validation fails, it forwards the error to the error-handling middleware.
   * Designed for use before routes requiring validated user data to ensure data integrity and consistency.
   */
  userMongooseValidation(keys: (keyof IUser)[]):
    (request: Request, response: Response, next: NextFunction) => Promise<void> {
    return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
      try {
        // Validate user data using the provided keys.
        await this.service.userValidationContainer(request.body, keys);

        // If validation is successful, proceed to the next middleware.
        next();
      } catch (error) {
        // If validation fails, pass the error to the error-handling middleware.
        next(error);
      }
    }
  };
};

export default UserController;