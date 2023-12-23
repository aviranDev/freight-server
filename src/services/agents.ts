import { Model, Document } from "mongoose";
import Agent from "../Models/Agent";
import { IAgent } from "../interfaces/modelsInterfaces";
import InternalError from "../errors/services/internalError";
import ConflictError from "../errors/services/conflict";
import ValidationError from "../errors/services/validation";

class AgentService {
  private model: Model<IAgent>;
  // Constructor to initialize the class
  constructor() {
    // Assign the provided Mongoose model to the class property
    this.model = Agent;
  }

  /**
   * Retrieves a paginated list of all agents.
   * 
   * @param {number} page - The current page.
   * @param {number} pageSize - The number of items per page.
   * @returns {Promise<Object>} - Resolves with a paginated list of agents, current page, total pages, and total items.
   * @throws {NotFoundError} - If no agents are found.
   * @throws {InternalError} - If there's an issue retrieving agents.
   */
  public async allAgents(page: number, pageSize: number): Promise<{
    agents: (Document<unknown, {}, IAgent & { port: string }> & Omit<IAgent & Required<{
      _id: string;
    }>, never>)[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }> {
    try {
      // Count the total number of agents matching the query.
      const totalItems = await this.model.countDocuments();

      // Throw an internal error if no agents are found.
      if (totalItems === 0) {
        throw new InternalError(`Agents not found in the database. ${totalItems}`);
      }

      // Calculate the total number of pages based on the page size.
      const totalPages = Math.ceil(totalItems / pageSize);

      // Calculate the number of documents to skip based on the current page.
      const skipCount = (page - 1) * pageSize;

      const agents = await this.model.find({})
        .skip(skipCount)
        .limit(pageSize)
        .exec();

      // Throw an internal error if there's an issue with retrieving agents.
      if (!agents) {
        throw new InternalError(`Error retrieving airlines from the database.`);
      }

      // Return the paginated list of airlines, current page number, total pages, and total items.
      return {
        agents,
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
   * Retrieves agents for a specified port in a paginated manner.
   * 
   * @param {string} port - The port for which agents are to be retrieved.
   * @param {number} page - The current page.
   * @param {number} pageSize - The number of items per page.
   * @returns {Promise<Object>} - Resolves with a paginated list of agents, current page, total pages, and total items.
   * @throws {NotFoundError} - If no agents are found for the specified port.
   * @throws {InternalError} - If there's an issue retrieving agents.
   */
  async selectByPort(port: string, page: number, pageSize: number): Promise<{
    portAgents: (Document<unknown, {}, IAgent & { port: string }> & Omit<IAgent & Required<{
      _id: string;
    }>, never>)[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }> {
    try {
      // Count the total number of agents matching the query.
      const totalItems = await this.model.countDocuments();

      // Throw an internal error if no agents are found.
      if (totalItems === 0) {
        throw new InternalError(`Agents not found in the database. ${totalItems}`);
      }

      // Calculate the total number of pages based on the page size.
      const totalPages = Math.ceil(totalItems / pageSize);

      // Calculate the number of documents to skip based on the current page.
      const skipCount = (page - 1) * pageSize;

      // Extract the total count from the aggregation result or default to 0.
      // Execute the aggregation to get the paginated list of agents.
      const portAgents = await this.model.find({}).where({ port: port })
        .skip(skipCount)
        .limit(pageSize)
        .exec();

      // Throw an internal error if no airlines are found for the specified port.
      if (portAgents === null) {
        throw new InternalError(`No agents found for the specified port: ${port}`);
      }

      // Return an object containing the retrieved airlines, current page, total pages, and total items.
      return {
        portAgents,
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
   * Retrieves details of an agent by its ID.
   * 
   * @param {string} documentId - The ID of the agent to retrieve.
   * @returns {Promise<IAgent>} - Resolves with the agent details.
   * @throws {ConflictError} - If the agent is not found.
   * @throws {InternalError} - If there's an issue retrieving the agent.
   */
  public async getAgentById(documentId: string): Promise<IAgent> {
    try {
      // Attempt to find the agent in the database by its ID.
      const agent = await this.model.findById(documentId);

      // If the agent is not found (null), throw a NotFoundError.
      if (agent === null) {
        throw new ConflictError('Agent not found.');
      }

      // Return the agent details if found.
      return agent;
    } catch (error) {
      // Propagate any errors that occur during the retrieval process.
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
  async agentValidationContainer(body: IAgent, keys: (keyof IAgent)[])
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
}

export default AgentService;