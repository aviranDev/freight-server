import { Document, Model, Types } from "mongoose";
import { IContact } from "../interfaces/modelsInterfaces";

interface IContactService {
  allContacts(page: number, pageSize: number): Promise<{
    contacts: (Document<unknown, {}, IContact> & Omit<IContact & {
      _id: Types.ObjectId;
    }, never>)[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }>;

  readContactById(documentId: string): Promise<IContact>;

  selectDepartment(selection: string, page: number, pageSize: number): Promise<{
    depratment: (Document<unknown, {}, IContact> & Omit<IContact & {
      _id: Types.ObjectId;
    }, never>)[];
    selection: string;
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }>;

  searchContact(contactName: string, department?: string): Promise<IContact>;

  createContact(data: IContact): Promise<void>;

  updateContact(id: string, data: IContact): Promise<IContact>;

  removeContact(id: string): Promise<null>;

  contactValidationContainer(body: IContact, keys: (keyof IContact)[]): Promise<null>;
}

export default IContactService;
