import { IuserRepository } from "../interfaces/Irepositories/IuserRepository";
import { Iuser } from "../interfaces/Models/Iuser";
import user from "../models/userModel";
import {
  findByEmailResponseDTO,
  createUserDTO,
  UpdatePasswordResponseDTO,
} from "../interfaces/DTO/IRepository/userRepositoryDTO";
import { BaseRepository } from "./baseRepository";
import { injectable } from "tsyringe";

@injectable()
export class UserRepository
  extends BaseRepository<Iuser>
  implements IuserRepository
{
  constructor() {
    super(user);
  }
  async createUser(userData: createUserDTO): Promise<Iuser> {
    try {
      const newUser = await this.create(userData);
      console.log("savedUser from userRepository:", newUser);
      if (!newUser) {
        throw new Error("cannot be saved");
      }
      return newUser;
    } catch (error) {
      throw new Error("Error occured while creating new user");
    }
  }

  async findByEmail(email: string): Promise<findByEmailResponseDTO> {
    try {
      const userData = await this.findOne({ email });
      console.log("userData from user repository:", userData);
      if (userData) {
        return { success: true, userData };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.log("error occured while fetching the user");
      throw new Error("An error occurred while retrieving the user");
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
          message: "Failed to update password or user not found",
        };
      }
    } catch (error) {
      console.log("Error occurred while updating password:", error);
      throw new Error("An error occurred while updating the password");
    }
  }

  async getPaginatedUsers(
    page: number,
    limit: number
  ): Promise<{ data: Iuser[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      const data = await user.find().skip(skip).limit(limit).exec();
      const total = await user.countDocuments();
      return { data, total };
    } catch (error) {
      console.error("Error fetching paginated users:", error);
      throw new Error("Failed to fetch paginated users");
    }
  }

  async blockUser(id: string, status: string): Promise<void> {
    try {
      let response = await this.updateOne({ _id: id }, { status: status });
      console.log(
        "blocking the user in the user repository:",
        response
      );
    } catch (error) {
      throw new Error("Failed to block designation: " + error);
    }
  }

  async findById(id: string): Promise<Iuser | null> {
    try {
      return await user.findById(id).exec();
    } catch (error) {
      throw new Error("Error finding designation by ID: " + error);
    }
  }
}
