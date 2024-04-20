import { Schema, model } from "mongoose";
import { IUser } from "../interfaces/modelsInterfaces";
import { usernameRejex } from "../utils/rejex";
import { serverConfig } from "../config/serverConfiguration";

// User roles
const { ROLE1, ROLE2, ROLE3 } = serverConfig.config.ROLES;

/** User Model
 *  Collection name: User
 *  Schema: UserSchema 
 */
export const UserSchema = new Schema<IUser>({
  // User's username with length constraints, uniqueness, and regex validation.
  username: {
    type: String,
    min: 2,
    max: 50,
    unique: true,
    required: true,
    match: usernameRejex,
  },
  // User's password with length constraints.
  password: {
    type: String,
    min: 6,
    max: 255,
    required: true,
  },
  // User's role with predefined values, defaulting to ROLE3.
  role: {
    type: String,
    enum: [ROLE1, ROLE2, ROLE3],
    default: ROLE3,
    required: true,
  },
  // Flag indicating whether the user needs a password reset.
  resetPassword: {
    type: Boolean,
    default: false,
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  accountLocked: {
    type: Boolean,
    default: false
  },
  lastFailedLoginDate: {
    type: Date,
    default: null
  },
  // Timestamp for user creation.
  createdAt: {
    type: Date,
    default: Date.now(),
  }
})

// Mongoose model for the 'User' collection.
const User = model<IUser>("User", UserSchema);

export default User;