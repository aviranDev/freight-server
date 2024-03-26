import { IUser } from "../interfaces/modelsInterfaces";

interface ISessionService {
  generateAccessToken(user: IUser): string;
  generateRefreshToken(user: IUser): string;
  verifyRefreshToken(refreshToken: string): Promise<IUser>;
  verifyAccessToken(authHeader: string): IUser;
  removeRefreshToken(cookie: string): Promise<void>;
  storeRefreshTokenInDb(refreshToken: string, userId: string): Promise<void>;
  removeExpiredSessions(expirationDate: Date): Promise<void>;
}

export default ISessionService;