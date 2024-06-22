import { Schema, model } from "mongoose";
import dotenv from 'dotenv';
import { serverConfig } from '../config/serverConfiguration';
export interface IAgent {
  _id?: string;
  agent: string;
  port: string;
  room: number;
  floor: number;
  phone: string[];
};

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
    min: 1,
    max: 999,
    required: true,
    // Validation: Agent room must be exactly 3 characters.
  },
  floor: {
    type: Number,
    enum: [FLOORS.FLOOR1, FLOORS.FLOOR2, FLOORS.FLOOR3],
    // Validation: Agent floor must be one of the predefined options or default to an empty string.
  },
  phone: {
    type: [{
      type: String,
      validate: {
        validator: function (v: string) {
          return /^\d{10}$/.test(v); // Validate each phone number format
        },
        message: (props: { value: string }) => `${props.value} is not a valid 10-digit phone number!`
      }
    }],
    default: [], // Default value: an empty array
  },
});




const Agent = model<IAgent>("Agent", agentSchema);

export default Agent;