import { Schema, model } from "mongoose";
import Agent from "./Agent";
import { ValidationError } from "../errors/validation";

export interface IAirline {
  _id?: string;
  name: string;
  prefix: string;
  code: string;
  agent: string;
};

/** Airline Model
 *  Collection name: Airline
 *  Schema: airlineSchema 
 */
export const airlineSchema = new Schema<IAirline>({
  // Name of the airline with length constraints.
  name: {
    type: String,
    min: 2,
    max: 50,
    required: true,
  },
  // Prefix of the airline with length constraints.
  prefix: {
    type: String,
    min: 3,
    max: 3,
    required: true,
  },
  // Code of the airline with length constraints.
  code: {
    type: String,
    min: 2,
    max: 2,
    required: true,
  },
  // Agent associated with the airline with length constraints.
  agent: {
    type: String,
    max: 50,
    required: true,
  },
});

// Add a 'validate' middleware to the schema
airlineSchema.pre('validate', async function (next) {
  // Retrieve the 'agent' value from the document being validated
  const agent = this.get('agent');

  // Fetch the unique values from the library collection
  const agents = await Agent.distinct('agent');

  // Check if the provided value exists in the library collection
  if (!agents.includes(agent)) {

    // Throw a custom validation error
    return next(new ValidationError(`Invalid agent value for the agent field.`));
  }

  // If the validation passes, continue to the next middleware
  next();
});

// Create the 'Agent' model using the defined schema
const Airline = model<IAirline>("Airline", airlineSchema);

// Export the 'Agent' model
export default Airline;