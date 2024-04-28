import { Model, Document, Types } from "mongoose";
import { InternalError } from "../errors/internalError";
import { ConflictError } from "../errors/conflictError";
import { ValidationError } from "../errors/validation";
import { IContact } from "../Models/Contact";

export interface IContactService {
  allContacts(page: number, pageSize: number): Promise<{
    contacts: (Document<unknown, {}, IContact> & Omit<IContact & {
      _id: Types.ObjectId;
    }, never>)[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }>;

  readContactById(documentId: string): Promise<IContact>;

  selectDepartment(selection: string, page: number, pageSize: number): Promise<{
    depratment: (Document<unknown, {}, IContact> & Omit<IContact & {
      _id: Types.ObjectId;
    }, never>)[];
    selection: string;
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }>;

  searchContact(contactName: string, department?: string): Promise<IContact>;

  createContact(data: IContact): Promise<void>;

  updateContact(id: string, data: IContact): Promise<IContact>;

  removeContact(id: string): Promise<null>;

  contactValidationContainer(body: IContact, keys: (keyof IContact)[]): Promise<null>;
}
/**
 * ContactService manages operations related to contacts.
 * This service is responsible for handling CRUD (Create, Read, Update, Delete)
 * operations for contacts using the provided Mongoose model.
 */
class ContactService {
  private model: Model<IContact>; // Mongoose model for the Contact collection

  /**
   * Constructor for the ContactService class.
   * Initializes the class with the provided Mongoose model for contacts.
   */
  constructor(conatctModel: Model<IContact>) {
    // Assign the provided Mongoose model to the class property
    this.model = conatctModel;
  }

  /**
   * Retrieves a paginated list of all contacts.
   *
   * @param {number} page - The current page number.
   * @param {number} pageSize - The number of items to display per page.
   * @returns {Promise<{ contacts: Array<any>, currentPage: number, totalPages: number, totalItems: number }>}
   *          A Promise that resolves with an object containing paginated contacts information.
   * @throws {InternalError} Throws an error if there's an issue during the retrieval process.
   *
   * @description
   * This method retrieves a paginated list of contacts from the data model.
   * It calculates the total number of items, total pages, and skips the appropriate number of items based on the page.
   * Contacts are then retrieved using aggregation with pagination.
   * If any issues occur during the retrieval process, an InternalError is thrown.
   */
  public async allContacts(page: number, pageSize: number): Promise<{
    contacts: (Document<unknown, {}, IContact> & Omit<IContact & {
      _id: Types.ObjectId;
    }, never>)[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }> {
    try {
      // Count the total number of employee members matching the query.
      const totalItems = await this.model.countDocuments();

      // If there are no items, throw an InternalError
      if (!totalItems) {
        throw new InternalError(`Something went wrong. ${totalItems}`);
      }

      // Calculate the total number of pages based on the page size.
      const totalPages = Math.ceil(totalItems / pageSize);

      // Calculate the number of documents to skip based on the current page.
      const skipCount = (page - 1) * pageSize;

      // Retrieve employee members using aggregation with pagination.
      const contacts = await this.model
        .find({})
        .skip(skipCount)
        .limit(pageSize)
        .exec();

      // If no contacts are found, throw an InternalError
      if (!contacts) {
        throw new InternalError(`Something went wrong. ${contacts}`);
      }

      // Return paginated contacts information
      return {
        contacts,
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
   * Retrieves a contact by its ID.
   *
   * @param {string} documentId - The ID of the contact to be retrieved.
   * @returns {Promise<any>} A Promise that resolves with the contact object if found.
   * @throws {InternalError} Throws an error if the contact is not found in the database or if there's an issue during retrieval.
   *
   * @description
   * This method retrieves a contact from the data model based on its ID.
   * If the contact is not found, it throws an InternalError.
   * If any issues occur during the retrieval process, an InternalError is thrown.
   */
  public async readContactById(documentId: string): Promise<IContact> {
    try {
      // Retrieve the contact by its ID
      const contact = await this.model.findById(documentId);

      // If the contact is not found, throw an InternalError
      if (!contact) {
        throw new InternalError('Contact not found in the database.')
      }

      // Return the retrieved contact
      return contact;
    } catch (error) {
      // If any error occurs during the retrieval process, rethrow it
      throw error;
    }
  }

  /**
   * Retrieves a paginated list of contacts based on a specified department selection.
   *
   * @param {string} selection - The department to filter contacts by.
   * @param {number} page - The current page number.
   * @param {number} pageSize - The number of items to display per page.
   * @returns {Promise<{ department: Array<any>, selection: string, currentPage: number, totalPages: number, totalItems: number }>}
   *          A Promise that resolves with an object containing paginated department contacts information.
   * @throws {InternalError} Throws an error if there's an issue during the retrieval process.
   *
   * @description
   * This method retrieves a paginated list of contacts from the data model based on the specified department.
   * It calculates the total number of items, total pages, and skips the appropriate number of items based on the page.
   * Contacts are then retrieved using aggregation with pagination and department filtering.
   * If any issues occur during the retrieval process, an InternalError is thrown.
   */
  async selectDepartment(selection: string, page: number, pageSize: number): Promise<{
    depratment: (Document<unknown, {}, IContact> & Omit<IContact & {
      _id: Types.ObjectId;
    }, never>)[];
    selection: string;
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }> {
    try {
      // Count the total number of contacts matching the department selection.
      const totalItems = await this.model.countDocuments().where({ department: selection });

      // If there are no items, throw an InternalError
      if (totalItems === 0) {
        throw new InternalError(`Something went wrong. ${totalItems}`);
      }

      // Calculate the total number of pages based on the page size.
      const totalPages = Math.ceil(totalItems / pageSize);

      // Calculate the number of documents to skip based on the current page.
      const skipCount = (page - 1) * pageSize;

      // Retrieve contacts using aggregation with pagination and department filtering.
      const depratment = await this.model.find({}).where({ department: selection })
        .skip(skipCount)
        .limit(pageSize)
        .exec();

      // If no contacts are found, throw an InternalError
      if (depratment === null) {
        throw new InternalError('Contact not found');
      }

      // Return paginated department contacts information
      return {
        depratment,
        selection,
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
   * Search for a contact by name, optionally filtering by department.
   * @param contactName - The name of the contact to search for.
   * @param department - Optional. The department to filter the search by.
   * @returns A Promise resolving to the found contact document.
   * @throws ValidationError if the contactName parameter is missing.
   * @throws ConflictError if the provided department is invalid or the contact is not found.
   */
  async searchContact(contactName: string, department?: string): Promise<IContact> {
    try {
      // Validation: Check if the "contactName" parameter is present
      if (!contactName) {
        throw new ValidationError('Contact name parameter is required for search.');
      }

      // Validation: Check if the provided department is valid
      const validDepartments = ['import', 'export', 'pharma', 'aviation', 'transportation'];
      if (department && !validDepartments.includes(department as string)) {
        throw new ConflictError(`Department not found in the database.`);
      }

      // Define a filter object based on the provided query parameters
      const filter: { contactName: RegExp; department?: { $in: string[] } } =
        { contactName: new RegExp(contactName as string, 'i') };

      // Perform the search query using the model
      const contact = await this.model.findOne(filter);

      // If no matching document is found, throw a ConflictError
      if (!contact) {
        throw new ConflictError(`Contact not found in the database.`);
      }

      // If department is provided and not matching, throw a ConflictError
      if (department && contact.department !== department) {
        throw new ConflictError(`Contact name exists, but not in the specified department: ${department}`);
      }

      // Return the found contact document
      return contact;
    } catch (error) {
      // If any error occurs during the retrieval process, rethrow it
      throw error;
    }
  }

  /**
   * Creates a new contact.
   *
   * @param {IContact} data - The data of the contact to be created.
   * @throws {ConflictError} Throws an error if a contact with the same name already exists.
   * @throws {Error} Throws an error if there's an issue during the creation process.
   *
   * @description
   * This method checks if a contact with the provided name already exists.
   * If it does, it throws a ConflictError indicating that the contact already exists.
   * If the contact does not exist, a new contact is created using the provided data.
   * If any issues occur during the creation process, an error is thrown.
   */
  async createContact(data: IContact): Promise<void> {
    try {
      // Check if a contact with the provided name already exists
      const contact = await this.model.findOne({ contactName: data?.contactName })

      // If a contact with the same name already exists, throw a ConflictError
      if (contact) {
        throw new ConflictError('Contact is already exist.')
      }

      // Create a new contact using the provided data
      await this.model.create({ ...data });
    } catch (error) {
      // If any error occurs during the creation process, rethrow it
      throw error;
    }
  }

  /**
   * Updates a contact by its ID.
   *
   * @param {string} id - The ID of the contact to be updated.
   * @param {IContact} data - The updated data for the contact.
   * @returns {Promise<IContact>} A Promise that resolves with the updated contact object.
   * @throws {InternalError} Throws an error if the contact is not found in the database or if there's an issue during the update.
   *
   * @description
   * This method updates a contact in the database based on its ID.
   * If the contact is not found, it throws an InternalError.
   * If the contact is found, it updates the contact with the provided data and returns the updated contact object.
   * If any issues occur during the update process, an error is thrown.
   */
  async updateContact(id: string, data: IContact): Promise<IContact> {
    try {
      // Find and update the contact by its ID
      const contact = await this.model.findByIdAndUpdate(id, { ...data }, { new: true });

      // If the contact is not found, throw an InternalError
      if (contact === null) {
        throw new InternalError(`Update contact failed: document not found in the database.`)
      }

      // Return the updated contact object
      return contact;
    } catch (error) {
      // If any error occurs during the update process, rethrow it
      throw error;
    }
  }

  /**
   * Removes a contact by its ID.
   *
   * @param {string} id - The ID of the contact to be removed.
   * @throws {InternalError} Throws an error if the contact is not found in the database or if there's an issue during removal.
   *
   * @description
   * This method removes a contact from the database based on its ID.
   * If the contact is not found, it throws an InternalError.
   * If the contact is found, it is deleted, and no result is returned.
   * If any issues occur during the removal process, an error is thrown.
   */
  async removeContact(id: string): Promise<null> {
    try {
      // Find and delete the contact by its ID
      const contact = await this.model.findByIdAndDelete(id).exec();

      // If the contact is not found, throw an InternalError
      if (contact === null) {
        throw new InternalError('Contact not found.')
      }

      // Return null as the contact is successfully deleted
      return null;
    } catch (error) {
      // If any error occurs during the removal process, rethrow it
      throw error;
    }
  }

  /**
   * Validates a contact based on a subset of keys.
   *
   * @param {IContact} body - The contact data to be validated.
   * @param {(keyof IContact)[]} keys - The subset of keys to be validated.
   * @throws {ValidationError} Throws an error if there's a validation issue.
   *
   * @description
   * This method creates an instance of the contact model with the provided data.
   * It then validates the instance based on the specified subset of keys.
   * If there's a validation issue, a ValidationError is thrown.
   * If the validation is successful, `null` is returned.
   * If any issues occur during the validation process, an error is thrown.
   */
  async contactValidationContainer(body: IContact, keys: (keyof IContact)[]) {
    try {
      // Create an instance of the contact model with the provided data
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

export default ContactService;