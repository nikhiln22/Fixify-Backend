import { ItechnicianRepository } from "../interfaces/Irepositories/ItechnicianRepository";
import { Itechnician } from "../interfaces/Models/Itechnician";
import technician from "../models/technicianModel";
import {
  findByEmailResponse,
  createTechnician,
  UpdatePasswordResponse,
  TechnicianQualification,
  UpdateTechnicianQualificationResponse,
  findByIdResponse,
} from "../interfaces/DTO/IRepository/ItechnicianRepository";
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
    technicianData: createTechnician
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

  async findByEmail(email: string): Promise<findByEmailResponse> {
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
  ): Promise<UpdatePasswordResponse> {
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
    qualificationData: TechnicianQualification
  ): Promise<UpdateTechnicianQualificationResponse> {
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
            latitude:qualificationData.latitude,
            longitude:qualificationData.longitude,
            address: qualificationData.address,
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
          address: updatedTechnician.address,
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

  async getTechnicianById(id: string): Promise<findByIdResponse> {
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

  async getUnverifiedTechnicians(
    page: number,
    limit: number
  ): Promise<{ data: Itechnician[]; total: number }> {
    try {
      console.log(
        "fetchning the unverified technicians from the technician database"
      );

      const unVerifiedTechnicians = await this.find(
        { is_verified: false },
        {
          pagination: { page, limit },
          sort: { createdAt: -1 },
        }
      );
      console.log("unVerifiedTechnicians:", unVerifiedTechnicians);
      return unVerifiedTechnicians as { data: Itechnician[]; total: number };
    } catch (error) {
      console.log("Error occured with the fetchning the unverified technician:",error);
      throw new Error("An error occurred while retrieving the technician");
    }
  }
}
