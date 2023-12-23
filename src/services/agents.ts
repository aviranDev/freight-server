import { Model, Document } from "mongoose";
import Agent from "../Models/Agent";
import { IAgent } from "../interfaces/modelsInterfaces";
import InternalError from "../errors/services/internalError";

class AgentService {
  private model: Model<IAgent>;
  // Constructor to initialize the class
  constructor() {
    // Assign the provided Mongoose model to the class property
    this.model = Agent;
  }

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
}

export default AgentService;