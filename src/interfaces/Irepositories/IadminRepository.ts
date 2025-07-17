import { FindByEmailResponse } from "../DTO/IRepository/adminRepository";

export interface IAdminRepository {
  findByEmail(email: string): Promise<FindByEmailResponse>;
}
