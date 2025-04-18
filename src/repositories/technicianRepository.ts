import { ItechnicianRepository } from "../interfaces/Irepositories/ItechnicianRepository";
import { Itechnician } from "../interfaces/Models/Itechnician";
import technician from "../models/technicianModel";
import {
  findByEmailResponseDTO,
  createTechnicianDTO,
  UpdatePasswordResponseDTO,
} from "../interfaces/DTO/IRepository/technicianRepositoryDTO";
import { BaseRepository } from "./baseRepository";
import { injectable } from "tsyringe";

@injectable()
export class TechnicianRepository
  extends BaseRepository<Itechnician>
  implements ItechnicianRepository
{
  constructor() {
    super(technician);
  }
  async createTechnician(
    technicianData: createTechnicianDTO
  ): Promise<Itechnician> {
    try {
      const newTechnician = await this.create(technicianData);
      console.log("savedTechnician from TechnicianRepository:", newTechnician);
      if (!newTechnician) {
        throw new Error("cannot be saved");
      }
      return newTechnician;
    } catch (error) {
      throw new Error("Error occured while creating new technician");
    }
  }

  async findByEmail(email: string): Promise<findByEmailResponseDTO> {
    try {
      console.log("email in the findbymail technician Repository:", email);
      const technicianData = await this.findOne({ email });
      console.log("technicianData from technician repository:", technicianData);
      if (technicianData) {
        return { success: true, technicianData };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.log("error occured while fetching the technician");
      throw new Error("An error occurred while retrieving the technician");
    }
  }

  async updatePassword(
    email: string,
    hashedPassword: string
  ): Promise<UpdatePasswordResponseDTO> {
    try {
      const result = await this.updateOne(
        { email },
        { password: hashedPassword }
      );

      if (result) {
        return { success: true };
      } else {
        return {
          success: false,
          message: "Failed to update password or technician not found",
        };
      }
    } catch (error) {
      console.log("Error occurred while updating password:", error);
      throw new Error("An error occurred while updating the password");
    }
  }
}
