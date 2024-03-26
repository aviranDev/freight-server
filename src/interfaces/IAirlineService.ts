import { Document } from "mongoose";
import { IAirline } from "./modelsInterfaces";




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
