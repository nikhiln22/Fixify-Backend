import { IAdminRepository } from "../interfaces/Irepositories/IadminRepository";
import Admin from "../models/adminModel";
import { IAdmin } from "../interfaces/Models/Iadmin";
import { BaseRepository } from "./baseRepository";
import { FindByEmailResponse } from "../interfaces/DTO/IRepository/adminRepository";
import { injectable } from "tsyringe";

@injectable()
export class AdminRepository
  extends BaseRepository<IAdmin>
  implements IAdminRepository
{
  constructor() {
    super(Admin);
  }
  async findByEmail(email: string): Promise<FindByEmailResponse> {
    try {
      console.log("email in the admin repository:", email);
      console.log("email type:", typeof email);
      const adminData = await this.findOne({ email });
      console.log("adminData from the repository:", adminData);
      if (adminData) {
        return { success: true, adminData };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.log("error occured while fetching the error", error);
      throw new Error("An error occured while retrieving the admin");
    }
  }
}
