import { Model } from "mongoose";
import bcryptjs from "bcryptjs";
import { serverConfig } from '../config/serverConfiguration';
import { AuthorizationError } from "../errors/authorizationError";
import { InternalError } from "../errors/internalError";
import { ConflictError } from "../errors/conflictError";
import { ValidationError } from "../errors/validation";
import { IUser } from "../Models/User";
const { ROLE2, ROLE3 } = serverConfig.config.ROLES;
const { SALT } = serverConfig.config;

export interface IUserService {
  // Define the methods of the UserService class
  addMember(member: IUser): Promise<IUser>;
  displayAllEmployees(page: number, pageSize: number): Promise<{
    employeeMembers: IUser[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }>;
  removeMember(id: string): Promise<IUser>;
  editMemberRole(id: string, memberRole: string): Promise<IUser>;
  userProfile(id: string): Promise<IUser>;
  updatePassword(userId: string, userPassword: string): Promise<IUser>;
  userValidationContainer(body: IUser, keys: (keyof IUser)[]): Promise<null>;
}

/**
 * UserService manages user-related operations and interactions with the user data model.
 * This service includes methods for working with user roles such as admin and employee.
 */
class UserService {
  // Define private properties for the Mongoose user model and role constants
  private model: Model<IUser>;
  private admin = ROLE2;
  private employee = ROLE3;

  /**
   * Constructor for the UserService class.
   * Initializes the class with the Mongoose user model and role constants.
   */
  constructor(userModel: Model<IUser>) {
    // Assign the Mongoose user model to the class property
    this.model = userModel;
  }

  /**
   * Generates a salt for password hashing using bcryptjs.
   *
   * @param {number} salt - The salt value for generating the salt.
   * @returns {string} The generated salt.
   *
   * @description
   * This method takes a salt value and uses bcryptjs to synchronously generate a salt for password hashing.
   * The generated salt is then returned.
   */
  private generateSalt(salt: string): string {
    // Use bcryptjs to synchronously generate a salt based on the provided value
    const generatedSalt = bcryptjs.genSaltSync(Number(salt));

    // Return the generated salt
    return generatedSalt;
  }

  /**
   * Hashes a password using bcryptjs.
   *
   * @async
   * @param {string} password - The password to be hashed.
   * @param {string} salt - The salt used for hashing.
   * @returns {Promise<string>} A Promise that resolves to the hashed password.
   * 
   * @description
   * This method takes a password and a salt and uses bcryptjs to asynchronously hash the password.
   * The hashed password is then returned.
   * If any issues occur during the hashing process, an error is thrown for proper error handling.
   */
  private async hashPassword(password: string, salt: string): Promise<string> {
    // Use bcryptjs to hash the password with the provided salt
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Return the hashed password
    return hashedPassword;
  }

  /**
   * Adds a new member to the system.
   *
   * @async
   * @param {IUser} member - The member object to be added.
   * @returns {Promise<IUser>} A Promise that resolves to the added member.
   * @throws {ConflictError} Throws an error if a member with the same username already exists.
   *
   * @description
   * This method checks if a member with the same username already exists.
   * If a member with the same username is found, it throws a ConflictError.
   * It generates a salt for password hashing.
   * It hashes the member's password using the generated salt.
   * It creates a new member with the hashed password.
   * It saves the new member to the database.
   * If any issues occur during the process, an error is thrown for proper error handling.
   */
  async addMember(member: IUser): Promise<IUser> {
    try {
      // Check if the member with the same username already exists.
      const existingUser = await this.model.findOne({ username: member.username });

      // Throw a ConflictError if a member with the same username already exists
      if (existingUser) {
        throw new ConflictError('User with this username already exists');
      }

      // Generate a salt for password hashing.
      const salt = this.generateSalt(SALT);

      // Hash the member's password.
      const hashPassword = await this.hashPassword(member.password, salt);

      // Create a new member with the hashed password.
      const newUser = new this.model({ ...member, password: hashPassword });

      // Save the new member to the database.
      await newUser.save();

      // Return the newly added member.
      return newUser;
    } catch (error) {
      // If any error occurs during the process, rethrow it
      throw error;
    }
  }

  /**
   * Retrieves a paginated list of employee members.
   *
   * @async
   * @param {number} page - The page number to retrieve.
   * @param {number} pageSize - The number of items per page.
   * @returns {Promise<{
  *   employeeMembers: IUser[];
  *   currentPage: number;
  *   totalPages: number;
  *   totalItems: number;
  * }>} A Promise that resolves to an object containing employee data.
  * @throws {InternalError} Throws an error if there is an issue while fetching employee data.
  *
  * @description
  * This method defines a query to filter out admin and superAdmin roles.
  * It counts the total number of employee members matching the query.
  * If the total number of items is zero, it throws an InternalError.
  * It calculates the total number of pages based on the page size.
  * It calculates the number of documents to skip based on the current page.
  * It retrieves employee members using aggregation with pagination.
  * If there are no employee members, it throws an InternalError.
  * The method returns an object containing employee data, including the current page, total pages, and total items.
  * If any issues occur during the retrieval process, an error is thrown for proper error handling.
  */
  async displayAllEmployees(page: number, pageSize: number): Promise<{
    employeeMembers: IUser[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }> {
    try {
      // Define a query to filter out admin and superAdmin roles.
      const matchQuery = { role: { $nin: ["admin", "superAdmin"] } };

      // Count the total number of employee members matching the query.
      const totalItems = await this.model.countDocuments(matchQuery);

      if (!totalItems) {
        throw new InternalError(`Something went wrong. ${totalItems}`);
      }

      // Calculate the total number of pages based on the page size.
      const totalPages = Math.ceil(totalItems / pageSize);

      // Calculate the number of documents to skip based on the current page.
      const skipCount = (page - 1) * pageSize;

      // Retrieve employee members using aggregation with pagination.
      const employeeMembers = await this.model
        .aggregate([
          { $match: matchQuery },
        ])
        .skip(skipCount)
        .limit(pageSize)
        .exec();

      if (!employeeMembers) {
        throw new InternalError(`Something went wrong. ${employeeMembers}`);
      }

      // Return an object containing employee data
      return {
        employeeMembers,
        currentPage: page,
        totalPages,
        totalItems,
      };
    } catch (error) {
      // If any error occurs during the retrieval process, rethrow it
      throw error;
    }
  }

  /**
   * Removes a member by ID.
   *
   * @async
   * @param {string} id - The ID of the member to be removed.
   * @returns {Promise<IUser>} Returns the removed member object.
   * @throws {InternalError} Throws an error if the member is not found or if there's an issue during removal.
   *
   * @description
   * This method finds and removes the member by their ID.
   * If the member is not found, it logs an error, throws an InternalError, and includes the member's ID in the error message.
   * The method returns the removed member object.
   * If any issues occur during the removal process, an error is thrown for proper error handling.
   */
  async removeMember(id: string): Promise<IUser> {
    try {
      // Find and remove the member by their ID.
      const deletedMember = await this.model.findByIdAndRemove(id);

      // If the member was not found, throw an error.
      if (!deletedMember) {
        throw new InternalError(`User with ID ${id} not found`);
      }

      // Return the removed member object
      return deletedMember;
    } catch (error) {
      // If any error occurs during the removal process, rethrow it
      throw error;
    }
  }

  /**
   * Edits a member's role by ID, ensuring the provided role is allowed.
   *
   * @async
   * @param {string} id - The ID of the member whose role is to be edited.
   * @param {string} memberRole - The new role to be set for the member.
   * @returns {Promise<IUser>} Returns the updated member object.
   * @throws {AuthorizationError} Throws an error if the provided role is not allowed.
   * @throws {InternalError} Throws an error if the member is not found or if there's an issue during the update.
   *
   * @description
   * This method defines an array of allowed roles for role modification.
   * It checks if the provided memberRole is allowed and throws an AuthorizationError if not.
   * It then finds and updates the member's role by their ID.
   * If the member is not found, it logs an error, throws an InternalError, and includes the member's ID in the error message.
   * The method returns the updated member object.
   * If any issues occur during the update process, an error is thrown for proper error handling.
   */
  async editMemberRole(id: string, memberRole: string): Promise<IUser> {
    try {
      // Define an array of allowed roles for role modification.
      const chosenRoles: string[] = [this.admin, this.employee];

      // Check if the provided memberRole is allowed.
      if (!chosenRoles.includes(memberRole)) {
        // If not allowed, throw an AuthorizationError
        throw new AuthorizationError(`The role: ${memberRole} is not allowed.`);
      };

      // Find and update the member's role by their ID.
      const member = await this.model.findByIdAndUpdate(id, { role: memberRole }, { new: true });

      // If the member was not found, throw an error.
      if (!member) {
        throw new InternalError(`User with ID ${id} not found`);
      }

      // Return the updated member object
      return member;
    } catch (error) {
      // If any error occurs during the update process, rethrow it
      throw error;
    }
  }

  /**
   * Retrieves a member's profile by ID while excluding sensitive information.
   *
   * @async
   * @param {string} id - The ID of the member whose profile is to be retrieved.
   * @returns {Promise<IUser>} Returns the member's profile excluding sensitive information.
   * @throws {InternalError} Throws an error if the member is not found or if there's an issue during retrieval.
   *
   * @description
   * This method finds the member by ID and excludes sensitive information from the result.
   * If the member is not found, it logs an error, throws an InternalError, and includes the member's ID in the error message.
   * The method returns the member's profile excluding sensitive information.
   * If any issues occur during the retrieval process, an error is thrown for proper error handling.
   */
  async userProfile(id: string): Promise<IUser> {
    try {
      // Find the member by ID and exclude sensitive information from the result.
      const memberProfile = await this.model.findById(id)
        .select(['-password', '-resetPassword', '-currentIp', '-createdAt']);

      // If the member is not found, log an error and throw an exception
      if (!memberProfile) {
        throw new InternalError(`User with ID ${id} not found`);
      }

      // Return the member's profile excluding sensitive information
      return memberProfile;
    } catch (error) {
      // If any error occurs during the retrieval process, rethrow it
      throw error;
    }
  }

  /**
   * Updates a user's password and sets the resetPassword flag.
   *
   * @async
   * @param {string} userId - The ID of the user whose password is to be updated.
   * @param {string} userPassword - The new password to be set for the user.
   * @returns {Promise<IUser>} Returns the updated user object.
   * @throws {InternalError} Throws an error if the user cannot be updated or if there's an issue during the update.
   *
   * @description
   * This method updates a user's password and sets the resetPassword flag in the database.
   * It uses the provided userId to identify the user, sets the new password, and updates the resetPassword flag.
   * The method returns the updated user object.
   * If the user cannot be updated (null), it throws an InternalError.
   * If any issues occur during the update process, an error is thrown for proper error handling.
   */
  async updatePassword(userId: string, userPassword: string): Promise<IUser> {
    try {
      // Attempt to update the user's password and resetPassword flag
      const user = await this.model.findByIdAndUpdate(userId,
        { password: userPassword, resetPassword: true },
        { new: true });

      // Check if the user cannot be updated (null)
      if (!user) {
        // If not updated, throw an InternalError to indicate the issue
        throw new InternalError(`User can not be updated. ${user}`);
      }

      // Return the updated user object
      return user;
    } catch (error) {
      // If any error occurs during the update process, rethrow it
      throw error;
    }
  }

  /**
 * Validates a user object based on a subset of keys.
 *
 * @async
 * @param {IUser} body - The user data to be validated.
 * @param {(keyof IUser)[]} keys - The subset of keys to be validated.
 * @returns {Promise<null>} Returns null if the validation is successful.
 * @throws {ValidationError} Throws an error if there's a validation issue.
 *
 * @description
 * This method creates an instance of the user model with the provided data.
 * It then validates the instance based on the specified subset of keys.
 * If there's a validation issue, a ValidationError is thrown.
 * If the validation is successful, `null` is returned.
 * If any issues occur during the validation process, an error is thrown.
 */
  async userValidationContainer(body: IUser, keys: (keyof IUser)[]): Promise<null> {
    try {
      // Create an instance of the user model with the provided data
      const instance = new this.model(body);

      // Validate the instance based on the specified subset of keys
      const error = instance.validateSync(keys);

      // If there's a validation issue, throw a ValidationError
      if (error !== undefined) {
        throw new ValidationError(`${error}`);
      }

      // Return null if the validation is successful
      return null;
    } catch (error) {
      // If any error occurs during the validation process, rethrow it
      throw error;
    }
  }
}

export default UserService;