import mongoose, { Model, Document } from "mongoose";
import { InternalError } from "../errors/internalError";
import { ConflictError } from "../errors/conflictError";
import { ValidationError } from "../errors/validation";
import { IAirline } from '../Models/Airline';

// Interface for the airline service class
export interface IAirlineService {
  allAirlines(page: number, pageSize: number): Promise<{
    airlines: (Document<unknown, {}, IAirline & { port: string }> & Omit<IAirline & Required<{
      _id: string;
    }>, never>)[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }>;
  getAirlineById(documentId: string): Promise<IAirline>;
  selectByPort(port: string, page: number, pageSize: number): Promise<{
    [x: string]: {
      airlines: IAirline[];
      currentPage: number;
      totalPages: number;
      totalItems: number;
    };
  }>;
  searchAirlineByName(name: string): Promise<IAirline>;
  searchAirlineByPrefixNumber(prefix: string): Promise<IAirline>;
  searchAirlineByAgent(agent: string):
    Promise<(Document<unknown, {}, IAirline> & Omit<IAirline & Required<{
      _id: string;
    }>, never>)[]>;
  createAirline(data: IAirline): Promise<void>;
  updateAirline(id: string, data: IAirline): Promise<IAirline>;
  removeAirlineByName(airline: string): Promise<void>;
  removeAirlineById(id: string): Promise<void>;
  airlineValidationContainer(body: IAirline, keys: (keyof IAirline)[]): Promise<null>;
  updateRelatedAirlines(previousName: string, newName: string): Promise<void>;
  ClearAgentRelatedAirlines(agentName: string): Promise<void>;
}
/**
 * Service class for handling operations related to airlines.
 *
 * This class encapsulates logic for interacting with the Airline model,
 * providing methods for CRUD operations and any additional airline-specific functionality.
 */
class AirlineService {
  private model: Model<IAirline>; // Mongoose model for the Airline collection

  /**
   * Constructor for the AirlineService class.
   * Initializes the Mongoose model for the Airline collection.
   */
  constructor(airlineModel: Model<IAirline>) {
    // Assign the provided Mongoose model to the class property
    this.model = airlineModel;
  }

  /**
   * Retrieves a paginated list of all airlines based on the specified page and page size.
   *
   * @param {number} page - The current page number for pagination.
   * @param {number} pageSize - The number of items to display per page.
   * @throws {InternalError} Throws an internal error if there's an issue with the database or if no airlines are found.
   * @returns {Promise<{ airlines: IAirline[], currentPage: number, totalPages: number, totalItems: number }>} 
   * A Promise that resolves with a paginated list of airlines, current page number, total pages, and total items.
   *
   * @description
   * This method retrieves a paginated list of all airlines from the database based on the specified page and page size.
   * It calculates the total number of pages, the number of documents to skip, and then retrieves the airlines using aggregation with pagination.
   * If there's an issue with the database or no airlines are found, it throws an InternalError.
   * The method returns a Promise that resolves with the paginated list of airlines, current page number, total pages, and total items.
   */
  public async allAirlines(page: number, pageSize: number): Promise<{
    airlines: (Document<unknown, {}, IAirline & { port: string }> & Omit<IAirline & Required<{
      _id: string;
    }>, never>)[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }> {
    try {
      // Count the total number of airlines matching the query.
      const totalItems = await this.model.countDocuments();

      // Throw an internal error if no airlines are found.
      if (totalItems === 0) {
        throw new InternalError(`No airlines found in the database. ${totalItems}`);
      }

      // Calculate the total number of pages based on the page size.
      const totalPages = Math.ceil(totalItems / pageSize);

      // Calculate the number of documents to skip based on the current page.
      const skipCount = (page - 1) * pageSize;

      // Retrieve airlines using aggregation with pagination.
      const airlines = await this.model
        .aggregate([
          {
            // Perform a $lookup to join the Agent collection with the Airline collection based on the agent field.
            $lookup: {
              from: 'agents', // Replace with the actual name of the Agent collection
              localField: 'agent',
              foreignField: 'agent',
              as: 'agentDetails',
            },
          },
          {
            // Unwind the agentDetails array to flatten the results.
            $unwind: '$agentDetails',
          },
          {
            // Add a new field 'port' to each document based on 'agentDetails.port'.
            $addFields: {
              port: '$agentDetails.port',
              room: '$agentDetails.room',
              floor: '$agentDetails.floor',
            },
          },
          {
            // Project to exclude '_id' and 'agentDetails' fields from the final output.
            $project: {
              _id: 1,
              __v: 0, // Exclude the version field
              agentDetails: 0,
            },

          },
        ])
        .skip(skipCount)
        .limit(pageSize)
        .exec();

      // Throw an internal error if there's an issue with retrieving airlines.
      if (!airlines) {
        throw new InternalError(`Error retrieving airlines from the database.`);
      }

      // Return the paginated list of airlines, current page number, total pages, and total items.
      return {
        airlines,
        currentPage: page,
        totalPages,
        totalItems,
      };
    } catch (error) {
      // Propagate any errors that occur during the retrieval process.
      throw error;
    }
  }

  /**
   * Retrieves airline details based on the specified document ID.
   *
   * @param {string} documentId - The ID of the airline document to be retrieved.
   * @throws {InternalError} Throws an internal error if the airline is not found in the database.
   * @returns {Promise<IAirline>} A Promise that resolves with the retrieved airline details.
   *
   * @description
   * This method attempts to retrieve an airline document from the database based on the provided document ID.
   * If the airline is not found, it throws an InternalError.
   * The method returns a Promise that resolves with the retrieved airline details.
   */
  public async getAirlineById(documentId: string): Promise<IAirline> {
    try {
      // Retrieve the airline document based on the provided document ID.
      const [result] = await this.model.aggregate([
        {
          $match: { _id: mongoose.Types.ObjectId.createFromHexString(documentId) },
        },
        {
          $lookup: {
            from: 'agents',
            let: { agent: '$agent' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$agent', '$$agent'] },
                },
              },
              {
                $project: {
                  port: 1,
                  room: 1,
                  floor: 1,
                  // Include other fields from the 'locations' collection as needed
                },
              },
            ],
            as: 'agentDetails',
          },
        },
        {
          $unwind: '$agentDetails', // Unwind the array created by $lookup (if 'agent' is an array)
        },
        {
          $project: {
            _id: 0,
            name: 1,
            agent: 1,
            prefix: 1,
            code: 1,
            // Include other fields from the 'airlines' collection
            port: '$agentDetails.port',
            room: '$agentDetails.room',
            floor: '$agentDetails.floor',
            // Include other fields from the 'locations' collection
          },
        },
      ]);

      // Throw an internal error if the airline is not found in the database.
      if (!result) {
        throw new InternalError('Airline not found in the database.')
      }

      // Return the retrieved airline details.
      return result;
    } catch (error) {
      // Propagate any errors that occur during the retrieval process.
      throw error;
    }
  }

  /**
   * Retrieves a paginated list of airlines based on the specified port, page, and page size.
   *
   * @param {string} port - The port for which to retrieve airlines.
   * @param {number} page - The current page number for pagination.
   * @param {number} pageSize - The number of items to display per page.
   * @returns {Promise<{ [x: string]: { airlines: IAirline[]; currentPage: number; totalPages: number; totalItems: number } }>} 
   * A Promise that resolves with a paginated list of airlines, current page number, total pages, and total items.
   *
   * @description
   * This method performs an aggregation to retrieve a paginated list of airlines based on the specified port, page, and page size.
   * It performs a $lookup to join the Agent collection with the Airline collection based on the agent field.
   * The aggregation pipeline includes a $match stage to filter results based on the specified port.
   * It calculates the total number of pages, skips the appropriate number of documents based on the current page, 
   * and retrieves the paginated list of airlines. If no airlines are found, it throws an InternalError.
   * The method returns a Promise that resolves with an object containing the retrieved airlines, current page number, total pages, and total items.
   */
  async selectByPort(port: string, page: number, pageSize: number): Promise<{
    [x: string]: {
      airlines: IAirline[];
      currentPage: number;
      totalPages: number;
      totalItems: number;
    };
  }> {
    try {
      // Perform a $lookup to join the Agent collection with the Airline collection based on the agent field.
      const aggregationPipeline = [
        {
          $lookup: {
            from: 'agents', // Replace with the actual name of the Agent collection
            localField: 'agent',
            foreignField: 'agent',
            as: 'agentDetails',
          },
        },
        {
          // Unwind the agentDetails array to flatten the results.
          $unwind: '$agentDetails',
        },
        {
          // Add a new field 'port' to each document based on 'agentDetails.port'.
          $addFields: {
            room: '$agentDetails.room',
            floor: '$agentDetails.floor',
          },
        },
        {
          $match: { 'agentDetails.port': port },
        },
        {
          $project: {
            _id: 0,
            __v: 0, // Exclude the version field
            agentDetails: 0,
          },
        },
      ];

      // Calculate the total number of pages based on the page size.
      const skipCount = (page - 1) * pageSize;

      // Execute the aggregation to get the paginated list of airlines.
      const portAirlines = await this.model.aggregate(aggregationPipeline)
        .skip(skipCount)
        .limit(pageSize)
        .exec();

      // Count the total number of airlines matching the specified port.
      const totalItems = await this.model.aggregate([...aggregationPipeline, { $count: 'totalItems' }]).exec();

      // Extract the total count from the aggregation result or default to 0.
      const totalCount = totalItems.length > 0 ? totalItems[0].totalItems : 0;

      // Throw an internal error if no airlines are found for the specified port.
      if (totalCount === 0) {
        throw new InternalError(`No airlines found for the specified port: ${port}`);
      }
      // Calculate the total number of pages based on the page size.
      const totalPages = Math.ceil(totalCount / pageSize);

      // Return an object containing the retrieved airlines, current page, total pages, and total items.
      return {
        [port]: {
          airlines: portAirlines,
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalCount,
        },
      };
    } catch (error) {
      // Propagate any errors that occur during the retrieval process.
      throw error;
    }
  }

  /**
   * Searches for an airline by its name using a case-insensitive regular expression.
   *
   * @param {string} name - The name of the airline to search for.
   * @returns {Promise<IAirline>} A Promise that resolves to the found airline document.
   * @throws {ConflictError} Throws an error if no matching document is found in the database.
   *
   * @description
   * This method performs a case-insensitive search for an airline by its name using a regular expression.
   * It uses the Mongoose aggregate pipeline to perform the search, including a $match stage with a $regex condition.
   * The $lookup stage is used to join the Agent collection with the Airline collection based on the agent field.
   * The result includes the details of the associated agent, and the final projection excludes unnecessary fields.
   * If no matching document is found, the method throws a ConflictError.
   * The method returns a Promise that resolves to the found airline document.
   */
  async searchAirlineByName(name: string): Promise<IAirline> {
    try {
      // Create a case-insensitive regular expression for the provided airline name
      const searchRegex = new RegExp(name, 'i');

      // Use Mongoose aggregate pipeline to search for the airline by name
      const [searchByAirlineName] = await this.model.aggregate([
        {
          $match: { name: { $regex: searchRegex } },
        },
        {
          $lookup: {
            from: 'agents',
            let: { agent: '$agent' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$agent', '$$agent'] },
                },
              },
              {
                $project: {
                  port: 1,
                  room: 1,
                  floor: 1,
                  // Include other fields from the 'agents' collection as needed
                },
              },
            ],
            as: 'agentDetails',
          },
        },
        {
          $unwind: '$agentDetails', // Unwind the array created by $lookup (if 'agent' is an array)
        },
        {
          $project: {
            _id: 0,
            name: 1,
            agent: 1,
            prefix: 1,
            code: 1,
            // Include other fields from the 'airlines' collection
            port: '$agentDetails.port',
            room: '$agentDetails.room',
            floor: '$agentDetails.floor',
            // Include other fields from the 'locations' collection
          },
        },
      ]);

      // If no matching document is found, throw a ConflictError
      if (searchByAirlineName === undefined) {
        throw new ConflictError(`No matching document found for airline: ${name}`);
      }

      // Return the found airline document
      return searchByAirlineName;
    } catch (error) {
      // Propagate any errors that occur during the search
      throw error;
    }
  }

  /**
   * Searches for an airline by its prefix number.
   *
   * @param {string} prefix - The prefix number of the airline to search for.
   * @returns {Promise<IAirline>} A Promise that resolves to the found airline document.
   * @throws {ConflictError} Throws an error if no matching document is found in the database.
   *
   * @description
   * This method searches for an airline by its prefix number using the Mongoose aggregate pipeline.
   * The $match stage filters documents based on the provided prefix.
   * The $lookup stage is used to join the Agent collection with the Airline collection based on the agent field.
   * The result includes the details of the associated agent, and the final projection excludes unnecessary fields.
   * If no matching document is found, the method throws a ConflictError.
   * The method returns a Promise that resolves to the found airline document.
   */
  async searchAirlineByPrefixNumber(prefix: string): Promise<IAirline> {
    try {
      // Use Mongoose aggregate pipeline to search for the airline by prefix
      const [searchByAirlineCode] = await this.model.aggregate([
        {
          $match: { prefix: prefix },
        },
        {
          $lookup: {
            from: 'agents',
            let: { agent: '$agent' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$agent', '$$agent'] },
                },
              },
              {
                $project: {
                  port: 1,
                  room: 1,
                  floor: 1,
                  // Include other fields from the 'locations' collection as needed
                },
              },
            ],
            as: 'agentDetails',
          },
        },
        {
          $unwind: '$agentDetails', // Unwind the array created by $lookup (if 'agent' is an array)
        },
        {
          $project: {
            _id: 0,
            name: 1,
            agent: 1,
            prefix: 1,
            code: 1,
            // Include other fields from the 'airlines' collection
            port: '$agentDetails.port',
            room: '$agentDetails.room',
            floor: '$agentDetails.floor',
            // Include other fields from the 'agents' collection
          },
        },
      ]);

      // If no matching document is found, throw a ConflictError
      if (searchByAirlineCode === undefined) {
        throw new ConflictError("Document not found in the database.");
      }

      // Return the found airline document
      return searchByAirlineCode;
    } catch (error) {
      // Propagate any errors that occur during the search
      throw error;
    }
  }

  /**
   * Searches for an airline by its agent using a case-insensitive regular expression.
   *
   * @param {string} agent - The agency of the airline to search for.
   * @returns {Promise<(Document<unknown, {}, IAirline> & Omit<IAirline & Required<{ _id: string }>, never>)[]>}
   * A Promise that resolves to an array of found airline documents.
   * @throws {ConflictError} Throws an error if no matching document is found in the database.
   *
   * @description
   * This method searches for airlines by their agent using the Mongoose aggregate pipeline.
   * The $match stage filters documents based on the provided case-insensitive regex for the agent field.
   * The $lookup stage is used to join the Agent collection with the Airline collection based on the agent field.
   * The result includes the details of the associated agent, and the final projection excludes unnecessary fields.
   * If no matching document is found, the method throws a ConflictError.
   * The method returns a Promise that resolves to an array of found airline documents.
   */
  async searchAirlineByAgent(agent: string):
    Promise<(Document<unknown, {}, IAirline> & Omit<IAirline & Required<{
      _id: string;
    }>, never>)[]> {
    try {
      // Create a case-insensitive regular expression for the provided agent
      const searchRegex = new RegExp(agent, 'i');

      // Use Mongoose aggregate pipeline to search for the airline by agent
      const [searchByAirlineAgent] = await this.model.aggregate([
        {
          $match: { agent: { $regex: searchRegex } },
        },
        {
          $lookup: {
            from: 'agents',
            let: { agent: '$agent' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$agent', '$$agent'] },
                },
              },
              {
                $project: {
                  agent: 1,
                  port: 1,
                  room: 1,
                  floor: 1,
                  // Include other fields from the 'agents' collection as needed
                },
              },
            ],
            as: 'agentDetails',
          },
        },
        {
          $unwind: '$agentDetails', // Unwind the array created by $lookup (if 'agent' is an array)
        },
        {
          $project: {
            _id: 0,
            // Include other fields from the 'airlines' collection
            agent: '$agentDetails.agent',
            port: '$agentDetails.port',
            room: '$agentDetails.room',
            floor: '$agentDetails.floor',
            // Include other fields from the 'locations' collection
          },
        },
      ]);

      // If no matching document is found, throw a ConflictError
      if (searchByAirlineAgent === undefined) {
        throw new ConflictError(`No matching document found for airline: ${agent}`);
      }

      // Return the found airline document
      return searchByAirlineAgent;
    } catch (error) {
      // Propagate any errors that occur during the search
      throw error;
    }
  }

  /**
   * Adds an airline with an AWB number or updates the existing airline with a new AWB number.
   *
   * @param {IAirline} data - The data for the new airline.
   * @throws {ConflictError} Throws a conflict error if the airline code is already in use.
   * @throws {InternalError} Throws an internal error if something goes wrong during the process.
   * @returns {Promise<void>} A Promise that resolves when the addition or update is complete.
   */
  async createAirline(data: IAirline): Promise<void> {
    try {
      // Step 1: Attempt to find an existing airline by its name or prefix.
      const existAirline = await this.model.findOne({
        $or: [
          { name: data.name },
          { prefix: data.prefix }
        ]
      });

      // Step 2: If the airline already exists, throw a ConflictError.
      if (existAirline) {
        throw new ConflictError(`The airline '${data.name}' or prefix '${data.prefix}' already exists.`);
      };

      // Step 3: Create a new airline with the provided data.
      await this.model.create({ ...data });
    } catch (error) {
      // Step 4: Propagate any errors that occur during the addition or update process.
      throw error;
    }
  }

  /**
   * Update the details of an existing airline.
   *
   * @param {string} id - The ID of the airline to be updated.
   * @param {IAirline} data - The updated data for the airline.
   * @throws {InternalError} Throws an internal error if the update operation fails.
   * @returns {Promise<IAirline>} - Resolves with the updated airline data on successful update.
   *
   * @description
   * This method updates the details of an existing airline based on the provided ID.
   * It uses Mongoose's findByIdAndUpdate method with the 'new' option set to true for returning the modified document.
   * If the update operation is successful, it resolves with the updated airline data.
   * If there are any errors during the process, it throws an InternalError.
   */
  async updateAirline(id: string, data: IAirline): Promise<IAirline> {
    try {
      // Step 1: Use Mongoose's findByIdAndUpdate to update the airline based on the provided ID.
      const updateAirline = await this.model.findByIdAndUpdate(id, data, { new: true });

      // Step 2: If the update operation fails, throw an InternalError.
      if (updateAirline === null) {
        throw new InternalError('Update document failed.');
      }

      // Step 3: Resolve with the updated airline data.
      return updateAirline;
    } catch (error) {
      // Step 4: Propagate any errors that occur during the addition or update process.
      throw error;
    }
  }

  /**
   * Removes an airline by its name using a case-insensitive search.
   *
   * @param {string} airline - The name of the airline to be removed.
   * @throws {ConflictError} Throws a conflict error if no matching document is found.
   * @throws {InternalError} Throws an internal error if something goes wrong during the process.
   * @returns {Promise<void>} A Promise that resolves when the removal is complete.
   *
   * @description
   * This method creates a case-insensitive regular expression for the provided airline name.
   * It uses Mongoose's findOneAndDelete method with the case-insensitive regex to search for the airline.
   * If no matching document is found, it throws a ConflictError.
   * If the removal is successful, the method resolves the Promise.
   */
  async removeAirlineByName(airline: string): Promise<void> {
    try {
      // Create a case-insensitive regular expression for the provided airline name
      const searchRegex = new RegExp(airline, 'i');

      // Use Mongoose findOneAndDelete method with the case-insensitive regex to search for the airline
      const removeByAirlineName = await this.model.findOneAndDelete({ airline: { $regex: searchRegex } }).exec();

      // If no matching document is found, throw a ConflictError
      if (removeByAirlineName === null) {
        throw new ConflictError(`No matching document found for airline: ${airline}`);
      }
    } catch (error) {
      // Propagate any errors that occur during the search
      throw error;
    }
  }

  /**
   * Removes an airline by its ID using Mongoose's findOneAndDelete method.
   *
   * @param {string} id - The ID of the airline to be removed.
   * @throws {ConflictError} Throws a conflict error if no matching document is found.
   * @throws {InternalError} Throws an internal error if something goes wrong during the process.
   * @returns {Promise<void>} A Promise that resolves when the removal is complete.
   *
   * @description
   * This method uses Mongoose's findOneAndDelete method to find and remove the airline by its ID.
   * If no matching document is found, it throws a ConflictError.
   * If the removal is successful, the method resolves the Promise.
   */
  async removeAirlineById(id: string): Promise<void> {
    try {
      // Use Mongoose findOneAndDelete method to find and remove the airline by ID
      const removeAirline = await this.model.findByIdAndDelete(id).exec();

      // If no matching document is found, throw a ConflictError
      if (removeAirline === null) {
        throw new ConflictError(`No matching document found for airline: ${id}`);
      }
    } catch (error) {
      // Propagate any errors that occur during the search
      throw error;
    }
  }

  /**
   * Validates airline data against the Mongoose schema using the provided keys.
   *
   * @param {IAirline} body - The data to be validated against the Mongoose schema.
   * @param {Array<keyof IAirline>} keys - An array of keys representing the Mongoose schema fields for airline data.
   * @throws {ValidationError} Throws a validation error if the data does not conform to the schema.
   * @throws {Error} Throws any other error that occurs during the validation process.
   * @returns {null} Returns null if the validation is successful.
   *
   * @description
   * This method creates an instance of the Mongoose model with the provided airline data.
   * It then validates the instance against the specified schema keys using Mongoose's validateSync method.
   * If there are validation errors, it throws a ValidationError with the error details.
   * If there are other errors during the validation process, they are propagated.
   * In case of successful validation, it returns null.
  */
  async airlineValidationContainer(body: IAirline, keys: (keyof IAirline)[])
    : Promise<null> {
    try {
      // Create an instance of the Mongoose model with the provided airline data.
      const instance = new this.model(body);

      // Validate the instance against the specified schema keys.
      const error = instance.validateSync(keys);

      // If there are validation errors, throw a ValidationError with error details.
      if (error !== undefined) {
        throw new ValidationError(`${error}`);
      }

      // Return null if the validation is successful.
      return null;
    } catch (error) {
      // Propagate any other errors that occur during the validation process.
      throw error;
    }
  }

  /**
   * Asynchronously updates related documents in another collection that match the previous agent name.
   *
   * @param {string} previousName - The previous agent name to identify documents for update.
   * @param {string} newName - The new agent name to be set in the related documents.
   * @returns {Promise<void>} - Resolves when the update of related documents is complete.
   * @throws {Error} - Propagates any errors that occur during the update of related documents.
   */
  async updateRelatedAirlines(previousName: string, newName: string): Promise<void> {
    try {
      // Step 1: Use aggregation to find documents in another collection that match the agent name.
      const aggregationPipeline: any[] = [
        {
          $match: {
            agent: previousName,
          },
        },
        {
          $set: {
            agent: newName,
          },
        },
        {
          $merge: {
            into: "airlines", // Specify the target collection.
            whenMatched: "merge", // Specify the merge behavior.
          },
        },
      ];

      // Step 2: Execute an aggregation pipeline on the MongoDB collection using Mongoose's aggregate function.
      await this.model.aggregate(aggregationPipeline).exec();

      // Step 3: Resolve when the update of related documents is complete.
      return;
    } catch (error) {
      // Step 4: Propagate any errors that occur during the update of related documents.
      throw error;
    }
  }

  /**
   * Asynchronously clears the agent association in related documents within another collection.
   *
   * @param {string} agentName - The name of the agent to be cleared from related documents.
   * @returns {Promise<void>} - Resolves when the agent association is cleared in related documents.
   * @throws {Error} - Propagates any errors that occur during the update of related documents.
   */
  async ClearAgentRelatedAirlines(agentName: string): Promise<void> {
    try {
      // Step 1: Use aggregation to find documents in another collection that match the agent name.
      const aggregationPipeline: any[] = [
        {
          $match: {
            agent: agentName,
          },
        },
        {
          $set: {
            agent: 'no agent',
          },
        },
        {
          $merge: {
            into: "airlines", // Specify the target collection.
            whenMatched: "merge", // Specify the merge behavior.
          },
        },
      ];

      // Step 2: Execute an aggregation pipeline on the MongoDB collection using Mongoose's aggregate function.
      await this.model.aggregate(aggregationPipeline).exec();

      // Step 3: Resolve when the update of related documents is complete.
      return;
    } catch (error) {
      // Step 4: Propagate any errors that occur during the update of related documents.
      throw error;
    }
  }
}

export default AirlineService;