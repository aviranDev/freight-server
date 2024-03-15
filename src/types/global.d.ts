// Import the original Express types from the express module
import { Request } from 'express';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      ATLAS_USERNAME: string;
      ATLAS_PASSWORD: string;
      ATALS_CONNECTION: string;
      ATALS_DB: string;
      ACCESS_TOKEN_EXPIRE: string;
      REFRESH_TOKEN_EXPIRE: string;
      ACCESS_TOKEN_SECRET: string;
      REFRESH_TOKEN_SECRET: string;
      PORT_NAME_1: string;
      PORT_NAME_2: string;
      FLOOR1: string;
      FLOOR2: string;
      FLOOR3: string;
      SALT: string;
      ROLE1: string;
      ROLE2: string;
      ROLE3: string;
      LOCAL_DB: string;
      LOCAL_DB_PORT: string;
      CORS_ORIGIN_1: string;
    }
  }

  namespace Express {
    interface Request {
      user: {
        _id: string;
        username: string;
        role: string;
        resetPassword: boolean;
      };
    }
  }
}