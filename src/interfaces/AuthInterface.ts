import { IAuth } from "./modelsInterfaces";

export interface IAuthService {
  authenticateUser(username: string, password: string): Promise<{ accessToken: string, refreshToken: string }>;
  refreshAccessToken(refreshToken: string): Promise<{ success: boolean, accessToken?: string }>;
  resetUserPassword(userId: string, cookie: string, password: string, confirmPassword: string): Promise<void>;
  logoutUser(cookie: string): Promise<void>;
  authValidationContainer(body: IAuth, keys: (keyof IAuth)[]): Promise<null>;
}