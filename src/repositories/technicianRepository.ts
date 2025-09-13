import { ITechnicianRepository } from "../interfaces/Irepositories/ItechnicianRepository";
import { ITechnician } from "../interfaces/Models/Itechnician";
import technician from "../models/technicianModel";
import {
  CreateTechnician,
  TechnicianQualification,
  UpdateTechnicianQualificationResponse,
  VerifyTechnicianResponse,
  RejectTechnicianResponse,
  INearbyTechnicianResponse,
} from "../interfaces/DTO/IRepository/ItechnicianRepository";
import { BaseRepository } from "./baseRepository";
import { injectable } from "tsyringe";
import { FilterQuery, Types } from "mongoose";

@injectable()
export class TechnicianRepository
  extends BaseRepository<ITechnician>
  implements ITechnicianRepository
{
  constructor() {
    super(technician);
  }
  async createTechnician(
    technicianData: CreateTechnician
  ): Promise<ITechnician> {
    try {
      const newTechnician = await this.create(technicianData);
      console.log("savedTechnician from TechnicianRepository:", newTechnician);
      if (!newTechnician) {
        throw new Error("cannot be saved");
      }
      return newTechnician;
    } catch (error) {
      console.log(error);
      throw new Error("Error occured while creating new technician:");
    }
  }

  async updateTechnicianExpiry(
    email: string,
    newExpiresAt: Date
  ): Promise<void> {
    try {
      console.log(
        "entering to the technician repository that updates the expiry time"
      );
      console.log(
        "newExpiresAt in the technician expiry update function:",
        newExpiresAt
      );

      await this.updateOne({ email: email }, { expiresAt: newExpiresAt });
    } catch (error) {
      console.log("error occured while updating the user expiry time:", error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<ITechnician | null> {
    try {
      console.log("email in the findbymail technician Repository:", email);
      const technicianData = await this.findOne({ email });
      console.log("technicianData from technician repository:", technicianData);
      return technicianData;
    } catch (error) {
      console.log("error occured while fetching the technician:", error);
      throw new Error("An error occurred while retrieving the technician");
    }
  }

  async updateTechnicianVerification(email: string): Promise<void> {
    try {
      console.log(
        "entered to the repository function that updates the technician data:"
      );
      console.log("email in the update technician verification:", email);

      await this.updateOne({ email: email }, { $unset: { expiresAt: "" } });
    } catch (error) {
      console.log(
        "error occurred while updating technician verification:",
        error
      );
      throw new Error(
        "An error occurred while updating technician verification"
      );
    }
  }

  async updatePassword(email: string, hashedPassword: string): Promise<void> {
    try {
      const result = await this.updateOne(
        { email },
        { password: hashedPassword }
      );

      if (!result) {
        throw new Error("Failed to update password or technician not found");
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
            image: qualificationData.profilePhoto,
            certificates: qualificationData.certificates,
            status: qualificationData.status,
          },
        }
      );

      if (updatedTechnician) {
        const technicianData = {
          yearsOfExperience: updatedTechnician.yearsOfExperience,
          Designation: updatedTechnician.Designation,
          About: updatedTechnician.About,
          image: updatedTechnician.image,
          certificates: updatedTechnician.certificates,
          is_verified: updatedTechnician.is_verified,
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

  async getTechnicianById(id: string): Promise<ITechnician | null> {
    try {
      console.log("Finding technician by ID in repository:", id);
      const technicianData = await this.findById(id, {
        populate: {
          path: "Designation",
          select: "designation",
        },
      });

      console.log("Found technician data:", technicianData);

      return technicianData;
    } catch (error) {
      console.log("Error occurred while fetching the technician by ID:", error);
      throw new Error("An error occurred while retrieving the technician");
    }
  }

  async getAllApplicants(options: { page?: number; limit?: number }): Promise<{
    data: ITechnician[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      console.log("entering the function which fetches all the applicants");
      const page = options.page;
      const limit = options.limit;

      const filter = { status: "Pending" };

      if (page !== undefined && limit !== undefined) {
        const result = (await this.find(filter, {
          pagination: { page, limit },
          sort: { createdAt: -1 },
        })) as { data: ITechnician[]; total: number };

        console.log("data fetched from the technician repository:", result);

        return {
          data: result.data,
          total: result.total,
          page,
          limit,
          pages: Math.ceil(result.total / limit),
        };
      } else {
        const allApplicants = (await this.find(filter, {
          sort: { createdAt: -1 },
        })) as ITechnician[];

        console.log("all coupons without pagination:", allApplicants);
        return {
          data: allApplicants,
          total: allApplicants.length,
          page: 1,
          limit: allApplicants.length,
          pages: 1,
        };
      }
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
    data: ITechnician[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      console.log("entering the function which fetches all the technicians");
      const page = options.page;
      const limit = options.limit;

      const filter: FilterQuery<ITechnician> = {
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

      if (page !== undefined && limit !== undefined) {
        const result = (await this.find(filter, {
          pagination: { page, limit },
          sort: { createdAt: -1 },
          populate: { path: "Designation", select: "designation" },
        })) as { data: ITechnician[]; total: number };

        console.log("data fetched from the technician repository:", result);

        return {
          data: result.data,
          total: result.total,
          page,
          limit,
          pages: Math.ceil(result.total / limit),
        };
      } else {
        const allTechnicians = (await this.find(filter, {
          sort: { createdAt: -1 },
        })) as ITechnician[];

        console.log("all offers without pagination:", allTechnicians);
        return {
          data: allTechnicians,
          total: allTechnicians.length,
          page: 1,
          limit: allTechnicians.length,
          pages: 1,
        };
      }
    } catch (error) {
      console.log("error occurred while fetching the technicians:", error);
      throw new Error("Failed to fetch the technicians");
    }
  }

  async toggleTechnicianStatus(
    technicianId: string,
    newStatus: "Active" | "Blocked"
  ): Promise<ITechnician> {
    try {
      console.log(
        `Toggling technician status to ${newStatus} for ID:`,
        technicianId
      );

      const updatedTechnician = await this.updateOne(
        { _id: technicianId },
        {
          status: newStatus,
        }
      );

      console.log("updatedTechnician:", updatedTechnician);

      if (!updatedTechnician) {
        throw new Error("Technician not found");
      }

      return updatedTechnician;
    } catch (error) {
      console.log("Error occurred while toggling technician status:", error);
      throw new Error("An error occurred while updating the technician status");
    }
  }

  async nearbyTechnicians(
    designationId: string,
    userLongitude: number,
    userLatitude: number,
    radius: number = 10
  ): Promise<INearbyTechnicianResponse[]> {
    try {
      console.log("Searching for technicians near user location:", {
        designationId,
        userLongitude,
        userLatitude,
        radius,
      });

      const nearbyTechniciansWithRatings = await this.model.aggregate([
        {
          $match: {
            Designation: new Types.ObjectId(designationId),
            is_verified: true,
            status: "Active",
          },
        },

        {
          $lookup: {
            from: "addresses",
            let: { technicianId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$ownerId", "$$technicianId"] },
                      { $eq: ["$ownerModel", "technician"] },
                      { $ne: ["$latitude", null] },
                      { $ne: ["$longitude", null] },
                    ],
                  },
                },
              },
            ],
            as: "address",
          },
        },

        { $unwind: "$address" },

        {
          $lookup: {
            from: "subscriptionplans",
            localField: "subscriptionPlanId",
            foreignField: "_id",
            as: "subscriptionPlan",
          },
        },

        {
          $lookup: {
            from: "subscriptionplanhistories",
            let: { technicianId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$technicianId", "$$technicianId"] },
                      { $eq: ["$status", "Active"] },
                    ],
                  },
                },
              },
            ],
            as: "activeSubscription",
          },
        },

        {
          $lookup: {
            from: "ratings",
            localField: "_id",
            foreignField: "technicianId",
            as: "ratings",
          },
        },

        {
          $addFields: {
            averageRating: {
              $cond: {
                if: { $gt: [{ $size: "$ratings" }, 0] },
                then: { $avg: "$ratings.rating" },
                else: 0,
              },
            },

            totalReviews: { $size: "$ratings" },

            isProfileBoosted: {
              $cond: {
                if: { $gt: [{ $size: "$subscriptionPlan" }, 0] },
                then: { $arrayElemAt: ["$subscriptionPlan.profileBoost", 0] },
                else: false,
              },
            },

            subscriptionPlanName: {
              $cond: {
                if: { $gt: [{ $size: "$subscriptionPlan" }, 0] },
                then: { $arrayElemAt: ["$subscriptionPlan.planName", 0] },
                else: "BASIC",
              },
            },
          },
        },

        {
          $project: {
            _id: 1,
            username: 1,
            image: 1,
            yearsOfExperience: 1,
            averageRating: 1,
            isProfileBoosted: 1,
            "address.latitude": 1,
            "address.longitude": 1,
          },
        },
      ]);

      console.log(
        `Found ${nearbyTechniciansWithRatings.length} technicians with designation and address`
      );

      if (nearbyTechniciansWithRatings.length === 0) {
        return [];
      }

      const nearbyTechniciansWithDistance = nearbyTechniciansWithRatings
        .map((technician) => {
          const distance = this.calculateDistance(
            userLatitude,
            userLongitude,
            technician.address.latitude,
            technician.address.longitude
          );

          return {
            ...technician,
            distance: Math.round(distance * 100) / 100,
          };
        })
        .filter((technician) => technician.distance <= radius);

      const sortedTechnicians = nearbyTechniciansWithDistance.sort((a, b) => {
        if (a.isProfileBoosted !== b.isProfileBoosted) {
          return b.isProfileBoosted ? 1 : -1;
        }

        if (a.averageRating !== b.averageRating) {
          return b.averageRating - a.averageRating;
        }

        return a.distance - b.distance;
      });

      const cleanedTechnicians = sortedTechnicians.map((technician) => ({
        _id: technician._id,
        username: technician.username,
        image: technician.image,
        yearsOfExperience: technician.yearsOfExperience,
        averageRating: technician.averageRating,
      }));

      console.log(
        `Found ${cleanedTechnicians.length} technicians within ${radius}km`,
        cleanedTechnicians
      );

      return cleanedTechnicians as INearbyTechnicianResponse[];
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

  async countActiveTechnicians(): Promise<number> {
    try {
      console.log(
        "enetered to the function that fetches the total active technicians in technician repository"
      );
      const activeTechncians = await this.countDocument({ status: "Active" });
      console.log(
        "total active technicians in the technician repository:",
        activeTechncians
      );
      return activeTechncians;
    } catch (error) {
      console.log(
        "error occured while fetching the active technicians count:",
        error
      );
      return 0;
    }
  }
}
