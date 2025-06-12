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
  VerifyTechnicianResponse,
  RejectTechnicianResponse,
} from "../interfaces/DTO/IRepository/ItechnicianRepository";
import { BaseRepository } from "./baseRepository";
import { injectable } from "tsyringe";
import { FilterQuery } from "mongoose";

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
            latitude: qualificationData.latitude,
            longitude: qualificationData.longitude,
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
      const technicianData = await this.model
        .findById(id)
        .populate("Designation")
        .exec();

      console.log("Found technician data:", technicianData);
      console.log("Designation field:", technicianData?.Designation);

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

  async getAllApplicants(options: { page?: number; limit?: number }): Promise<{
    data: Itechnician[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      console.log("entering the function which fetches all the applicants");
      const page = options.page || 1;
      const limit = options.limit || 5;

      const filter = { is_verified: false };

      const result = (await this.find(filter, {
        pagination: { page, limit },
        sort: { createdAt: -1 },
      })) as { data: Itechnician[]; total: number };

      console.log("data fetched from the technician repository:", result);

      return {
        data: result.data,
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      };
    } catch (error) {
      console.log("error occurred while fetching the applicants:", error);
      throw new Error("Failed to fetch the applicants");
    }
  }

  async verifyTechnician(
    technicianId: string
  ): Promise<VerifyTechnicianResponse> {
    try {
      console.log("Verifying technician with ID:", technicianId);

      const updatedTechnician = await this.updateOne(
        { _id: technicianId },
        {
          $set: {
            is_verified: true,
            status: "Active",
          },
        }
      );

      if (updatedTechnician) {
        return {
          success: true,
          message: "Technician verified successfully",
          technicianData: updatedTechnician,
        };
      } else {
        return {
          success: false,
          message: "Technician not found or already verified",
        };
      }
    } catch (error) {
      console.log("Error occurred while verifying technician:", error);
      throw new Error("An error occurred while verifying the technician");
    }
  }

  async rejectTechnician(
    technicianId: string
  ): Promise<RejectTechnicianResponse> {
    try {
      console.log("Rejecting technician with ID:", technicianId);

      const deletedTechnician = await this.deleteOne({ _id: technicianId });

      if (deletedTechnician) {
        return {
          success: true,
          message: "Technician application rejected and removed successfully",
        };
      } else {
        return {
          success: false,
          message: "Technician not found",
        };
      }
    } catch (error) {
      console.log("Error occurred while rejecting technician:", error);
      throw new Error("An error occurred while rejecting the technician");
    }
  }

  async getAllTechnicians(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    designation?: string;
  }): Promise<{
    data: Itechnician[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      console.log("entering the function which fetches all the technicians");
      const page = options.page || 1;
      const limit = options.limit || 5;

      const filter: FilterQuery<Itechnician> = {
        is_verified: true,
      };

      if (options.search) {
        filter.$or = [
          { username: { $regex: options.search, $options: "i" } },
          { email: { $regex: options.search, $options: "i" } },
        ];
      }

      if (options.status) {
        filter.status = options.status;
      }

      if (options.designation) {
        filter.Designation = options.designation;
      }

      const result = (await this.find(filter, {
        pagination: { page, limit },
        sort: { createdAt: -1 },
      })) as { data: Itechnician[]; total: number };

      console.log("data fetched from the technician repository:", result);

      return {
        data: result.data,
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      };
    } catch (error) {
      console.log("error occurred while fetching the technicians:", error);
      throw new Error("Failed to fetch the technicians");
    }
  }

  async toggleTechnicianStatus(
    technicianId: string,
    newStatus: "Active" | "Blocked"
  ): Promise<{
    success: boolean;
    message?: string;
    technicianData?: Itechnician;
  }> {
    try {
      console.log(
        `Toggling technician status to ${newStatus} for ID:`,
        technicianId
      );

      const updatedTechnician = await this.updateOne(
        { _id: technicianId },
        {
          $set: {
            status: newStatus,
          },
        }
      );

      console.log("updatedTechnician:", updatedTechnician);

      if (updatedTechnician) {
        return {
          success: true,
          message: `Technician status updated to ${newStatus} successfully`,
          technicianData: updatedTechnician,
        };
      } else {
        return {
          success: false,
          message: "Technician not found or status update failed",
        };
      }
    } catch (error) {
      console.log("Error occurred while toggling technician status:", error);
      throw new Error("An error occurred while updating the technician status");
    }
  }

  // Add this method to your TechnicianRepository class
  // This finds technicians within radius of USER'S location

  async nearbyTechnicians(
    designationId: string,
    userLongitude: number,
    userLatitude: number,
    radius: number = 10
  ): Promise<Itechnician[]> {
    try {
      console.log("Searching for technicians near user location:", {
        designationId,
        userLongitude,
        userLatitude,
        radius,
      });

      const techniciansWithDesignation = (await this.findAll({
        Designation: designationId,
        is_verified: true,
        status: "Active",
        latitude: { $exists: true, $ne: null },
        longitude: { $exists: true, $ne: null },
      })) as Itechnician[];

      console.log(
        `Found ${techniciansWithDesignation.length} technicians with designation and location data`
      );

      if (techniciansWithDesignation.length === 0) {
        return [];
      }

      const nearbyTechniciansWithDistance = techniciansWithDesignation
        .map((technician) => {
          const distance = this.calculateDistance(
            userLatitude, 
            userLongitude, 
            technician.latitude!, 
            technician.longitude! 
          );

          return {
            ...technician.toObject(),
            distance: Math.round(distance * 100) / 100, 
          };
        })
        .filter((technician) => technician.distance <= radius) 
        .sort((a, b) => a.distance - b.distance); 

      console.log(
        `Found ${nearbyTechniciansWithDistance.length} technicians within ${radius}km of user's location`
      );

      return nearbyTechniciansWithDistance as Itechnician[];
    } catch (error) {
      console.log("Error occurred while fetching nearby technicians:", error);
      throw new Error("An error occurred while retrieving nearby technicians");
    }
  }

  private calculateDistance(
    userLat: number, 
    userLon: number,
    technicianLat: number, 
    technicianLon: number
  ): number {
    const R = 6371; 

    const dLat = this.toRadians(technicianLat - userLat);
    const dLon = this.toRadians(technicianLon - userLon);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(userLat)) *
        Math.cos(this.toRadians(technicianLat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

   private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
