import { Schema, model } from "mongoose";
import { IContact } from "../interfaces/modelsInterfaces";

/** 
 *  Contact Model
 *  Collection name: Contact
 *  Schema: contactSchema
 */
export const contactSchema = new Schema<IContact>({
  // Department of the contact, limited to specific values.
  department: {
    type: String,
    enum: ["import", "export", "pharma", "aviation", "transportation"],
  },
  // Name of the contact person, with length constraints.
  contactName: {
    type: String,
    min: 2,
    max: 50,
    required: true,
  },
  // Phone extension with length constraints.
  extension: {
    type: String,
    min: 4,
    max: 4,
    required: true,
  },
  // Contact phone number with length constraints.
  phone: {
    type: String,
    min: 9,
    max: 9,
    required: true,
  },
  // Contact email address with length constraints.
  email: {
    type: String,
    min: 5,
    max: 255,
    required: true,
  },
});

// Mongoose model for the 'Contact' collection.
const Contact = model<IContact>("Contact", contactSchema);

export default Contact;