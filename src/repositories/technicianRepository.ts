import { ItechnicianRepository } from "../interfaces/Irepositories/ItechnicianRepository";
import { Itechnician } from "../interfaces/Models/Itechnician";
import technician from "../models/technicianModel";
import {
  findByEmailResponseDTO,
  createTechnicianDTO,
  UpdatePasswordResponseDTO,
  TechnicianQualificationDTO,
  UpdateTechnicianQualificationResponseDTO,
  findByIdResponseDTO,
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

  async updateTechnicianQualification(
    technicianId: string,
    qualificationData: TechnicianQualificationDTO
  ): Promise<UpdateTechnicianQualificationResponseDTO> {
    try {
      console.log(
        "Updating technician qualification in repository for ID:",
        technicianId
      );
      console.log("Qualification data:", qualificationData);

      const updatedTechnician = await this.updateOne(
        { _id: technicianId },
        {
          $set: {
            yearsOfExperience: qualificationData.experience,
            Designation: qualificationData.designation,
            About: qualificationData.about,
            city: qualificationData.city,
            preferredWorkLocation: qualificationData.preferredWorkLocation,
            image: qualificationData.profilePhoto,
            certificates: qualificationData.certificates,
          },
        }
      );

      if (updatedTechnician) {
        const technicianData = {
          yearsOfExperience: updatedTechnician.yearsOfExperience,
          Designation: updatedTechnician.Designation,
          About: updatedTechnician.About,
          city: updatedTechnician.city,
          preferredWorkLocation: updatedTechnician.preferredWorkLocation,
          image: updatedTechnician.image,
          certificates: updatedTechnician.certificates,
        };
        return {
          success: true,
          message: "Technician qualification updated successfully",
          technician: technicianData,
        };
      } else {
        return {
          success: false,
          message:
            "Failed to update technician qualification or technician not found",
        };
      }
    } catch (error) {
      console.log(
        "Error occurred while updating technician qualification:",
        error
      );
      throw new Error(
        "An error occurred while updating the technician qualification"
      );
    }
  }

  async getTechnicianById(id: string): Promise<findByIdResponseDTO> {
    try {
      console.log("Finding technician by ID in repository:", id);
      const technicianData = await this.findById(id);

      if (technicianData) {
        return {
          success: true,
          technicianData,
        };
      } else {
        return {
          success: false,
          message: "Technician not found",
        };
      }
    } catch (error) {
      console.log("Error occurred while fetching the technician by ID:", error);
      throw new Error("An error occurred while retrieving the technician");
    }
  }
}
