import { Schema, model } from "mongoose";
import { IAgent } from "../interfaces/modelsInterfaces";
import dotenv from 'dotenv';
import { serverConfig } from '../config/serverConfiguration';
const { FLOORS, PORT_NAMES } = serverConfig.config
dotenv.config();

/** Agent Model
 *  Collection name: Agent
 *  Schema: agentSchema
 *  
 *  Represents an agent in the system with properties like agent name, assigned port, room, and floor.
 */
export const agentSchema = new Schema<IAgent>({
  agent: {
    type: String,
    min: 2,
    max: 50,
    required: true,
    // Validation: Agent name must be between 2 and 50 characters.
  },
  port: {
    type: String,
    enum: [PORT_NAMES.PORT_NAME_1, PORT_NAMES.PORT_NAME_2], // Assign a port from the predefined options (port1, port2)
    // Validation: Agent port must be one of the predefined options or default to an empty string.
  },
  room: {
    type: Number,
    min: 3,
    max: 3,
    required: true,
    // Validation: Agent room must be exactly 3 characters.
  },
  floor: {
    type: String,
    enum: [FLOORS.FLOOR1, FLOORS.FLOOR2, FLOORS.FLOOR3],
    // Validation: Agent floor must be one of the predefined options or default to an empty string.
  },
});

const Agent = model<IAgent>("Agent", agentSchema);

export default Agent;