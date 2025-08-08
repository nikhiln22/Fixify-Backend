import { IUserRepository } from "../interfaces/Irepositories/IuserRepository";
import { IUser } from "../interfaces/Models/Iuser";
import user from "../models/userModel";
import {
  FindByEmailResponse,
  CreateUser,
  UpdatePasswordResponse,
} from "../interfaces/DTO/IRepository/IuserRepository";
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

  async findByEmail(email: string): Promise<FindByEmailResponse> {
    try {
      const userData = await this.findOne({ email });
      console.log("userData from user repository:", userData);
      if (userData) {
        return { success: true, userData };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.log("error occured while fetching the user:", error);
      throw new Error("An error occurred while retrieving the user");
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
          message: "Failed to update password or user not found",
        };
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
      const page = options.page || 1;
      const limit = options.limit || 6;

      const filter: FilterQuery<IUser> = {};

      if (options.search) {
        filter.$or = [
          { username: { $regex: options.search, $options: "i" } },
          { email: { $regex: options.search, $options: "i" } },
        ];
      }

      if (options.status) {
        if (options.status === "active") {
          filter.status = true;
        } else if (options.status === "blocked") {
          filter.status = false;
        }
      }

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
    } catch (error) {
      console.log("error occurred while fetching the users:", error);
      throw new Error("Failed to fetch the users");
    }
  }

  async blockUser(id: string, status: boolean): Promise<void> {
    try {
      const response = await this.updateOne({ _id: id }, { status: status });
      console.log("blocking the user in the user repository:", response);
    } catch (error) {
      throw new Error("Failed to block designation: " + error);
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
  ): Promise<IUser | undefined> {
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

      if (updatedUser) {
        const { password, ...safeUser } = updatedUser.toObject
          ? updatedUser.toObject()
          : updatedUser;
        return safeUser as IUser;
      } else {
        return undefined;
      }
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
      const countActiveUsers = await this.countDocument({ status: true });
      return countActiveUsers;
    } catch (error) {
      console.log("error occured while fetching the active users:", error);
      return 0;
    }
  }
}
