import { Request, Response, NextFunction } from "express";
import { IUser } from "../interfaces/modelsInterfaces";
import { logger } from "../logger/logger";
import UserService from "../services/user";
import { HTTP_STATUS } from '../config/httpStatus';

class UserController {
  // Declare an instance of UserService as a property
  private service = new UserService();

  /**
   * Adds a new member to the system while managing sessions.
   * 
   * @async
   * @param {Request} req - Express request object containing the member information in the request body.
   * @param {Response} res - Express response object for sending the response.
   * @param {NextFunction} next - Express next middleware function for handling errors.
   * @returns {Promise<void>} A Promise that resolves when the operation is complete.
   *
   * @throws {Error} Throws an error if there's an issue with member addition or session management.
   *
   * @description Handles the addition of a new member to the system.
   * - Check if the user is already logged in from another device based on their session ID.
   * - If not logged in from another device, extract member information from the request body.
   * - Add the new member using the service.
   * - Create a new session or update the existing session with the new session ID.
   * - Respond with a success message and the newly created member.
   * - Logs that the registration operation has completed.
   */
  addMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract member information from the request body.
      const member: IUser = req.body;

      // Add the new member using the service.
      const newMember = await this.service.addMember(member);

      // Respond with a success message and the newly created member.
      res.status(HTTP_STATUS.CREATED).json({ newMember, message: "User Added Successfully." });
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
   * @param {Request} req - Express request object containing query parameters for pagination.
   * @param {Response} res - Express response object for sending the response.
   * @param {NextFunction} next - Express next middleware function for handling errors.
   * @returns {Promise<void>} A Promise that resolves when the operation is complete.
   *
   * @throws {Error} Throws an error if there's an issue retrieving the employee data.
   *
   * @description Handles the display of a paginated list of employee members.
   * - Parses pagination parameters from the request query or uses defaults.
   * - Retrieves employee data from the service.
   * - Responds with the list of employees and pagination details.
   * - Logs that the display members operation has completed.
   */
  displayAllEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse pagination parameters from the request query or use defaults.
      const page: number = parseInt(req.query.page as string) || 1;
      const limit: number = parseInt(req.query.limit as string) || 10;

      // Retrieve employee data from the service.
      const reponse = await this.service.displayAllEmployees(page, limit);

      // Respond with the list of employees and pagination details.
      res.status(HTTP_STATUS.OK).json({
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
   * Removes a member by their ID.
   * @async
   * @param {Request} req - Express request object containing the member ID as a parameter.
   * @param {Response} res - Express response object for sending the response.
   * @param {NextFunction} next - Express next middleware function for handling errors.
   * @returns {Promise<void>} A Promise that resolves when the operation is complete.
   *
   * @throws {ClientError} Throws a 404 ClientError if the member with the specified ID is not found.
   *
   * @description Handles the removal of a member by their ID.
   * - Extracts the member ID from the request parameters.
   * - Calls the service to remove the member.
   * - Responds with a success message.
   * - Logs that the member document deletion operation has completed.
   */
  removeMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract the member ID from the request parameters.
      const { id } = req.params;

      // Remove the member using the service.
      await this.service.removeMember(id);

      // Respond with a success message.
      res.status(HTTP_STATUS.OK).json({ message: `Document with ID ${id} has been deleted successfully.` });
    } catch (error) {
      next(error);
    } finally {
      // Log that the member document deletion operation has completed.
      logger.debug("Member document deletion operation completed.");
    }
  };

  /**
  * Edits the role of a member by their ID.
  * @async
  * @param {Request} req - Express request object containing the member ID as a parameter and the updated role in the request body.
  * @param {Response} res - Express response object for sending the response.
  * @param {NextFunction} next - Express next middleware function for handling errors.
  * @returns {Promise<void>} A Promise that resolves when the operation is complete.
  *
  * @throws {ClientError} Throws a 404 ClientError if the member with the specified ID is not found.
  *
  * @description Handles editing the role of a member by their ID.
  * - Extracts the member ID from the request parameters.
  * - Calls the service to update the member's role.
  * - Responds with a success message.
  * - Logs that the member role change operation has completed.
  */
  changeMemberRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract the member ID from the request parameters.
      let { id } = req.params;

      // Call the service to update the member's role.
      const upgradeMemberRole = await this.service.editMemberRole(id, req.body.role);

      // Respond with a success message.
      res.status(HTTP_STATUS.CREATED).send({ message: `Member role has been updated to: ${upgradeMemberRole?.role}` });
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
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object for sending the profile data.
 * @param {NextFunction} next - Express next middleware function for handling errors.
 * @returns {Promise<void>} A Promise that resolves when the operation is complete.
 *
 * @throws {Error} Throws an error if there's an issue retrieving the member's profile.
 *
 * @description Handles the retrieval of a member's profile.
 * - Calls the service to retrieve the profile data of the authenticated member.
 * - Responds with the member's profile data in JSON format.
 * - Passes any errors to the next middleware for error handling.
 * - Logs that the member profile retrieval operation has completed.
 */
  memberProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Try to retrieve the profile of the authenticated member.
      const member = await this.service.userProfile(req.user._id);

      // Respond with the member's profile data in JSON format.
      res.status(HTTP_STATUS.OK).send(member);
    } catch (error) {
      next(error);
    } finally {
      // Log that the member profile retrieval operation has completed.
      logger.debug("Member display profile operation completed.");
    }
  };

  /**
   * Middleware function generator for validating user data using Mongoose schema keys.
   * 
   * @param {Array<keyof IUser>} keys - An array of keys representing the Mongoose schema fields for user data.
   * @returns {(request: Request, response: Response, next: NextFunction) => Promise<void>} - An Express middleware function.
   * 
   * @description 
   * This middleware function is designed to validate user data based on the provided Mongoose schema keys.
   * It uses the userValidationContainer method of the service for validation.
   * If the validation is successful, it calls the next middleware in the chain. Otherwise, it passes the error to the error-handling middleware.
   * This middleware is intended to be used before routes that require validated user data.
   * 
   * @returns {Promise<void>} - Resolves with a success message on successful validation.
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

export default new UserController();