import { IAdmin } from "../Models/Iadmin";

export interface IAdminRepository {
  findByEmail(email: string): Promise<IAdmin | null>;
  getAdmin(): Promise<IAdmin | null>;
}
