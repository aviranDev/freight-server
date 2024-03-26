import { IUser } from "./modelsInterfaces";

// Define an interface for the UserService class
export interface IUserService {
  // Define the methods of the UserService class
  addMember(member: IUser): Promise<IUser>;
  displayAllEmployees(page: number, pageSize: number): Promise<{
    employeeMembers: IUser[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }>;
  removeMember(id: string): Promise<IUser>;
  editMemberRole(id: string, memberRole: string): Promise<IUser>;
  userProfile(id: string): Promise<IUser>;
  updatePassword(userId: string, userPassword: string): Promise<IUser>;
  userValidationContainer(body: IUser, keys: (keyof IUser)[]): Promise<null>;
}

