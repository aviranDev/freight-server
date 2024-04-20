import { Document, Types } from "mongoose";

// Represents a refresh token document.
export interface ISession extends Document {
  refreshToken: string;
  userId: Types.ObjectId;
  lastLogin: Date;
};

export interface IAuth {
  username: string;
  password: string;
  confirmPassword?: string;
}

// Define the payload token 
export interface TokenPayload {
  _id: string;
  username: string;
  resetPassword: boolean;
  role: string;
}

// Represents a member document.
export interface IUser {
  _id: string;
  username: string;
  password: string;
  role: string;
  token: string;
  resetPassword: boolean;
  failedLoginAttempts: number;
  accountLocked: boolean;
  lastFailedLoginDate: Date | null;
  createdAt: Date
};

// Represents a contact document.
export interface IContact {
  department: string;
  contactName: string;
  phone: string;
  extension: string;
  email: string;
};

// Represents an airline document.
export interface IAirline {
  _id?: string;
  name: string;
  prefix: string;
  code: string;
  agent: string;
};

export interface IAgent {
  _id?: string;
  agent: string;
  port: string;
  room: number;
  floor: string;
};