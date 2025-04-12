import { IadminRepository } from "../../interfaces/Irepositories/IadminRepository";
import Admin from "../../models/adminModel";
import { Iadmin } from "../../interfaces/Models/Iadmin";
import { BaseRepository } from "../base/baseRepository";
import { findByEmailResponseDTO } from "../../interfaces/DTO/IRepository/adminRepositoryDTO";
import { injectable } from "tsyringe";

@injectable()
export class AdminRepository
  extends BaseRepository<Iadmin>
  implements IadminRepository
{
  constructor() {
    super(Admin);
  }
  async findByEmail(email: string): Promise<findByEmailResponseDTO> {
    try {
      console.log("email in the admin repository:",email);
      console.log("email type:",typeof email);
      const adminData = await this.findOne({ email });
      console.log("adminData from the repository:", adminData);
      if (adminData) {
        return { success: true, adminData };
      } else {
        return { success: false };
      }
    } catch (error) {
        console.log("error occured while fetching the error",error);
        throw new Error("An error occured while retrieving the admin");
    }
  }
}
