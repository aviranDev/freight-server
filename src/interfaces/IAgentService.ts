import { Document, Model } from "mongoose";
import { IAgent } from "../interfaces/modelsInterfaces";
import { IAirlineService } from "../interfaces/IAirlineService";

interface IAgentService {
  allAgents(page: number, pageSize: number): Promise<{
    agents: (Document<unknown, {}, IAgent & { port: string }> & Omit<IAgent & Required<{
      _id: string;
    }>, never>)[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }>;

  selectByPort(port: string, page: number, pageSize: number): Promise<{
    portAgents: (Document<unknown, {}, IAgent & { port: string }> & Omit<IAgent & Required<{
      _id: string;
    }>, never>)[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }>;

  getAgentById(documentId: string): Promise<IAgent>;

  agentValidationContainer(body: IAgent, keys: (keyof IAgent)[]): Promise<null>;

  createAgent(data: IAgent): Promise<void>;

  updateAgent(id: string, data: IAgent): Promise<IAgent>;

  removeAgentById(id: string): Promise<void>;
}

export default IAgentService;
