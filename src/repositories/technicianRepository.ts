import { ITechnicianRepository } from "../interfaces/Irepositories/ItechnicianRepository";
import { ITechnician } from "../interfaces/Models/Itechnician";
import technician from "../models/technicianModel";
import {
  FindByEmailResponse,
  CreateTechnician,
  UpdatePasswordResponse,
  TechnicianQualification,
  UpdateTechnicianQualificationResponse,
  FindByIdResponse,
  VerifyTechnicianResponse,
  RejectTechnicianResponse,
  INearbyTechnicianResponse,
} from "../interfaces/DTO/IRepository/ItechnicianRepository";
import { BaseRepository } from "./baseRepository";
import { injectable } from "tsyringe";
import { FilterQuery, Types } from "mongoose";
import { ISubscriptionPlan } from "../interfaces/Models/IsubscriptionPlan";

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

  async findByEmail(email: string): Promise<FindByEmailResponse> {
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
      console.log("error occured while fetching the technician:", error);
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

  async getTechnicianById(id: string): Promise<FindByIdResponse> {
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
    data: ITechnician[];
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
      })) as { data: ITechnician[]; total: number };

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
    data: ITechnician[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      console.log("entering the function which fetches all the technicians");
      const page = options.page || 1;
      const limit = options.limit || 5;

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
    technicianData?: ITechnician;
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

    // ✅ Use aggregation to get technicians with ratings and subscription data
    const nearbyTechniciansWithRatings = await this.model.aggregate([
      // Match technicians with required criteria
      {
        $match: {
          Designation: new Types.ObjectId(designationId),
          is_verified: true,
          status: "Active",
          latitude: { $exists: true, $ne: null },
          longitude: { $exists: true, $ne: null },
        },
      },

      // Lookup subscription plan details
      {
        $lookup: {
          from: "subscriptionplans", // ✅ Fixed collection name
          localField: "subscriptionPlanId",
          foreignField: "_id",
          as: "subscriptionPlan",
        },
      },

      // Lookup active subscription history
      {
        $lookup: {
          from: "subscriptionplanhistories", // your subscription history collection
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

      // Lookup ratings for each technician
      {
        $lookup: {
          from: "ratings", // your ratings collection name
          localField: "_id",
          foreignField: "technicianId",
          as: "ratings",
        },
      },

      // Add calculated fields
      {
        $addFields: {
          // Calculate average rating
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: "$ratings" }, 0] },
              then: { $avg: "$ratings.rating" }, // assuming 'rating' is your rating field
              else: 0,
            },
          },

          // Count total reviews
          totalReviews: { $size: "$ratings" },

          // Check if profile is boosted
          isProfileBoosted: {
            $cond: {
              if: { $gt: [{ $size: "$subscriptionPlan" }, 0] },
              then: { $arrayElemAt: ["$subscriptionPlan.profileBoost", 0] },
              else: false,
            },
          },

          // Get subscription plan name for reference
          subscriptionPlanName: {
            $cond: {
              if: { $gt: [{ $size: "$subscriptionPlan" }, 0] },
              then: { $arrayElemAt: ["$subscriptionPlan.planName", 0] },
              else: "BASIC",
            },
          },
        },
      },

      // ✅ PROJECT ONLY THE REQUIRED FIELDS
      {
        $project: {
          _id: 1,
          username: 1,
          image: 1,
          yearsOfExperience: 1,
          averageRating: 1,
          latitude: 1,    // Keep for distance calculation
          longitude: 1,   // Keep for distance calculation
          isProfileBoosted: 1, // Keep for sorting
          // All other fields (email, password, phone, address, etc.) are excluded
        },
      },
    ]);

    console.log(
      `Found ${nearbyTechniciansWithRatings.length} technicians with designation and location data`
    );

    if (nearbyTechniciansWithRatings.length === 0) {
      return [];
    }

    // ✅ Calculate distance and filter by radius
    const nearbyTechniciansWithDistance = nearbyTechniciansWithRatings
      .map((technician) => {
        const distance = this.calculateDistance(
          userLatitude,
          userLongitude,
          technician.latitude!,
          technician.longitude!
        );

        return {
          ...technician,
          distance: Math.round(distance * 100) / 100,
        };
      })
      .filter((technician) => technician.distance <= radius);

    // ✅ Sort by profile boost first, then by rating, then by distance
    const sortedTechnicians = nearbyTechniciansWithDistance.sort((a, b) => {
      // First priority: Profile boost (boosted profiles first)
      if (a.isProfileBoosted !== b.isProfileBoosted) {
        return b.isProfileBoosted ? 1 : -1;
      }

      // Second priority: Average rating (higher rating first)
      if (a.averageRating !== b.averageRating) {
        return b.averageRating - a.averageRating;
      }

      // Third priority: Distance (closer first)
      return a.distance - b.distance;
    });

    // ✅ Final cleanup - remove fields used only for sorting/calculation
    const cleanedTechnicians = sortedTechnicians.map(technician => ({
      _id: technician._id,
      username: technician.username,
      image: technician.image,
      yearsOfExperience: technician.yearsOfExperience,
      averageRating: technician.averageRating,
    }));

    console.log(
      `Found ${cleanedTechnicians.length} technicians within ${radius}km, sorted by profile boost, rating, and distance`,
      cleanedTechnicians
    );

    return cleanedTechnicians as INearbyTechnicianResponse[];
  } catch (error) {
    console.log("Error occurred while fetching nearby technicians:", error);
    throw new Error("An error occurred while retrieving nearby technicians");
  }
}

// ✅ Keep your existing helper methods
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

  async getTechniciansWithSubscriptions(options: {
    page?: number;
    limit?: number;
    search?: string;
    filterPlan?: string;
  }): Promise<{
    data: ITechnician[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      console.log(
        "entered to the technician repository that fetches technicians with subscription plans"
      );

      const page = options.page || 1;
      const limit = options.limit || 10;

      const filter: FilterQuery<ITechnician> = {};

      if (options.search) {
        filter.$or = [
          { username: { $regex: options.search, $options: "i" } },
          { email: { $regex: options.search, $options: "i" } },
        ];
      }

      const result = (await this.find(filter, {
        pagination: { page, limit },
        sort: { createdAt: -1 },
        populate: {
          path: "subscriptionPlanId",
          select: "planName monthlyPrice commissionRate",
        },
      })) as { data: ITechnician[]; total: number };

      let filteredTechnicians = result.data;

      if (options.filterPlan) {
        filteredTechnicians = result.data.filter((technician) => {
          const plan = technician.subscriptionPlanId as {
            planName: string;
            price: number;
            commissionRate: number;
          };
          return plan?.planName === options.filterPlan;
        });
      }

      return {
        data: filteredTechnicians,
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      };
    } catch (error) {
      console.log(
        "error occurred while fetching technicians with subscription plans:",
        error
      );
      throw new Error("Failed to fetch technicians with subscription plans");
    }
  }

  async getActiveSubscriptionPlan(technicianId: string): Promise<{
    success: boolean;
    subscriptionData?: {
      planName: string;
      status: string;
      commissionRate: number;
      walletCreditDelay: number;
      profileBoost: boolean;
      durationInMonths: number;
      amount: number;
    };
  }> {
    try {
      console.log(
        "Getting active subscription plan for technician:",
        technicianId
      );

      const technicianData = await this.model
        .findById(technicianId)
        .populate("subscriptionPlanId")
        .exec();

      if (!technicianData) {
        return { success: false };
      }

      if (!technicianData.subscriptionPlanId) {
        return { success: false };
      }

      const subscriptionPlan =
        technicianData.subscriptionPlanId as ISubscriptionPlan;

      let expiresAt: string | undefined = undefined;

      if (subscriptionPlan.durationInMonths > 0) {
        const startDate = new Date(technicianData.createdAt);
        const expiryDate = new Date(startDate);
        expiryDate.setMonth(
          expiryDate.getMonth() + subscriptionPlan.durationInMonths
        );
        expiresAt = expiryDate.toISOString();
      }

      const subscriptionData = {
        planName: subscriptionPlan.planName,
        status: technicianData.status,
        commissionRate: subscriptionPlan.commissionRate,
        walletCreditDelay: subscriptionPlan.WalletCreditDelay,
        profileBoost: subscriptionPlan.profileBoost,
        durationInMonths: subscriptionPlan.durationInMonths,
        startDate: technicianData.createdAt.toISOString(),
        expiresAt,
        amount: subscriptionPlan.price,
      };

      console.log("Found subscription data:", subscriptionData);
      return { success: true, subscriptionData };
    } catch (error) {
      console.log("Error getting active subscription plan:", error);
      throw new Error("Failed to get active subscription plan");
    }
  }

  async updateSubscriptionPlan(
    technicianId: string,
    planId: string
  ): Promise<{ data: ITechnician } | null> {
    try {
      console.log(
        "technicianId in the update subscription plan in the technician repository:",
        technicianId
      );
      console.log(
        "planId in the update subscription plan in the technician repository",
        planId
      );

      const filter = { _id: technicianId };

      const update = { subscriptionPlanId: planId, updatedAt: new Date() };

      const updatedTechnician = await this.updateOne(filter, update);

      if (!updatedTechnician) {
        return null;
      }

      return { data: updatedTechnician };
    } catch (error) {
      console.log(
        "error occured while updating the technician subscription plan:",
        error
      );
      throw error;
    }
  }
}
