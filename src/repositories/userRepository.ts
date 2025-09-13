import { IUserRepository } from "../interfaces/Irepositories/IuserRepository";
import { IUser } from "../interfaces/Models/Iuser";
import user from "../models/userModel";
import { CreateUser } from "../interfaces/DTO/IRepository/IuserRepository";
import { BaseRepository } from "./baseRepository";
import { injectable } from "tsyringe";
import { FilterQuery } from "mongoose";

@injectable()
export class UserRepository
  extends BaseRepository<IUser>
  implements IUserRepository
{
  constructor() {
    super(user);
  }
  async createUser(userData: CreateUser): Promise<IUser> {
    try {
      const newUser = await this.create(userData);
      console.log("savedUser from userRepository:", newUser);
      if (!newUser) {
        throw new Error("cannot be saved");
      }
      return newUser;
    } catch (error) {
      console.log("error occured while creating the user:", error);
      throw new Error("Error occured while creating new user");
    }
  }

  async updateUserExpiry(email: string, newExpiresAt: Date): Promise<void> {
    try {
      console.log(
        "entering to the user repository that updates the expiry time"
      );
      console.log("email in the userexpiryupdate function:", email);
      console.log(
        "newExpiresAt in the user expiry update function:",
        newExpiresAt
      );

      await this.updateOne({ email: email }, { expiresAt: newExpiresAt });
    } catch (error) {
      console.log("error occured while updating the user expiry time:", error);
      throw error;
    }
  }

  async updateUserVerification(email: string): Promise<void> {
    try {
      console.log(
        "entered to the repository function that updates the user data:"
      );
      console.log("email in the update user verification:", email);

      await this.updateOne(
        { email: email },
        { is_verified: true, status: "Active", $unset: { expiresAt: "" } }
      );
    } catch (error) {
      console.log("error occurred while updating user verification:", error);
      throw new Error("An error occurred while updating user verification");
    }
  }


  async findByEmail(email: string): Promise<IUser | null> {
    try {
      const userData = await this.findOne({ email });
      console.log("userData from user repository:", userData);
      return userData;
    } catch (error) {
      console.log("error occured while fetching the user:", error);
      throw new Error("An error occurred while retrieving the user");
    }
  }


  async updatePassword(email: string, hashedPassword: string): Promise<void> {
    try {
      const result = await this.updateOne(
        { email },
        { password: hashedPassword }
      );

      if (!result) {
        throw new Error("Failed to update password or user not found");
      }
    } catch (error) {
      console.log("Error occurred while updating password:", error);
      throw new Error("An error occurred while updating the password");
    }
  }

  async getAllUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{
    data: IUser[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      console.log("entering the function which fetches all the users");
      const page = options.page;
      const limit = options.limit;

      const filter: FilterQuery<IUser> = {};

      if (options.search) {
        filter.$or = [
          { username: { $regex: options.search, $options: "i" } },
          { email: { $regex: options.search, $options: "i" } },
        ];
      }

      if (options.status) {
        if (options.status === "active") {
          filter.status = "Active";
        } else if (options.status === "blocked") {
          filter.status = "Blocked";
        }
      }

      if (page !== undefined && limit !== undefined) {
        const result = (await this.find(filter, {
          pagination: { page, limit },
          sort: { createdAt: -1 },
        })) as { data: IUser[]; total: number };

        console.log("data fetched from the user repository:", result);

        return {
          data: result.data,
          total: result.total,
          page,
          limit,
          pages: Math.ceil(result.total / limit),
        };
      } else {
        const allUsers = (await this.find(filter, {
          sort: { createdAt: -1 },
        })) as IUser[];

        console.log("all categories without pagination:", allUsers);
        return {
          data: allUsers,
          total: allUsers.length,
          page: 1,
          limit: allUsers.length,
          pages: 1,
        };
      }
    } catch (error) {
      console.log("error occurred while fetching the users:", error);
      throw new Error("Failed to fetch the users");
    }
  }

  async blockUser(
    userId: string,
    newStatus: "Active" | "Blocked"
  ): Promise<IUser> {
    try {
      console.log(`Attempting to update user ${userId} status to ${newStatus}`);

      const updatedUser = await this.updateOne(
        { _id: userId },
        { status: newStatus }
      );

      if (!updatedUser) {
        console.log(`User with ID ${userId} not found`);
        throw new Error("User not found");
      }

      console.log("Successfully updated user status:", {
        userId: updatedUser._id,
        newStatus: updatedUser.status,
      });

      return updatedUser;
    } catch (error) {
      console.error("Error in blockUser:", error);
      throw new Error("Failed to update user status: " + error);
    }
  }

  async findById(id: string): Promise<IUser | null> {
    try {
      return await user.findById(id).exec();
    } catch (error) {
      throw new Error("Error finding designation by ID: " + error);
    }
  }

  async editProfile(
    userId: string,
    profileData: {
      username?: string;
      phone?: string;
      image?: string;
    }
  ): Promise<IUser | null> {
    try {
      console.log("editing user profile in repository for ID:", userId);
      console.log("Profile data:", profileData);

      const updatedUser = await this.updateOne(
        { _id: userId },
        {
          $set: {
            username: profileData.username,
            phone: profileData.phone,
            image: profileData.image,
          },
        }
      );

      return updatedUser;
    } catch (error) {
      console.log("Error occurred while updating user profile:", error);
      throw new Error("An error occurred while updating the user profile");
    }
  }

  async countActiveUsers(): Promise<number> {
    try {
      console.log(
        "entered to the function that fetches the total number of the active users"
      );
      const countActiveUsers = await this.countDocument({ status: "Active" });
      return countActiveUsers;
    } catch (error) {
      console.log("error occured while fetching the active users:", error);
      return 0;
    }
  }
}
