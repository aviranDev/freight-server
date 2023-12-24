import { Model, Document, Types } from "mongoose";
import Agent from "../Models/Agent";
import { IAgent } from "../interfaces/modelsInterfaces";
import InternalError from "../errors/services/internalError";
import ConflictError from "../errors/services/conflict";
import ValidationError from "../errors/services/validation";
import AirlineService from "./airline";
class AgentService {
  private model: Model<IAgent>;
  airlineService: AirlineService;

  // Constructor to initialize the class
  constructor() {
    // Assign the provided Mongoose model to the class property
    this.model = Agent;
    this.airlineService = new AirlineService();
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

  /**
   * Creates a new agent based on the provided data.
   *
   * @param {IAgent} data - The data of the agent to be created.
   * @returns {Promise<void>} - Resolves if the agent is created successfully.
   * @throws {ConflictError} - If an agent with the same name or room prefix already exists.
   * @throws {Error} - If any other error occurs during the creation process.
   */
  async createAgent(data: IAgent): Promise<void> {
    try {
      // Step 1: Attempt to find an existing agent by its name or room number.
      const existAgent = await this.model.findOne({
        $or: [
          { agent: data.agent },
          { room: data.room }
        ]
      });

      // Step 2: If the agent already exists, throw a ConflictError.
      if (existAgent) {
        if (existAgent.agent === data.agent) {
          // The condition { agent: data.agent } was satisfied.
          throw new ConflictError(`Agent with name '${data.agent}' already exists.`);
        } else if (existAgent.room === data.room) {
          // The condition { room: data.room } was satisfied.
          throw new ConflictError(`Agent with room '${data.room}' already exists.`);
        }
      }

      // Step 3: Create a new agent with the provided data.
      await this.model.create({ ...data });
    } catch (error) {
      // Step 4: Propagate any errors that occur during the addition or update process.
      throw error;
    }
  }

  /**
   * Service method to update an existing agent based on the provided ID.
   *
   * @param {string} id - The ID of the agent to be updated.
   * @param {IAgent} data - The data to update the agent with.
   * @returns {Promise<IAgent>} - Resolves with the updated agent data if the update is successful.
   * @throws {InternalError} - If the update operation fails.
   * @throws {Error} - If any other error occurs during the update process.
   */
  async updateAgent(id: string, data: IAgent): Promise<IAgent> {
    try {
      // Step 1: Retrieve the previous agent data before the update.
      const previousAgent = await this.model.findById(id);

      // Step 2: Use Mongoose's findByIdAndUpdate to update the agent based on the provided ID.
      const updatedAgent = await this.model.findByIdAndUpdate(id, data, { new: true });

      // Step 3: If the update operation fails, throw an InternalError.
      if (previousAgent === null || updatedAgent === null) {
        throw new InternalError('Update document failed.');
      }

      // Step 4: Update related documents in another collection.
      await this.airlineService.updateRelatedAirlines(previousAgent.agent, updatedAgent.agent);

      // Step 5: Resolve with the updated agent data.
      return updatedAgent;
    } catch (error) {
      // Step 6: Propagate any errors that occur during the update process.
      throw error;
    }
  }
}

export default AgentService;