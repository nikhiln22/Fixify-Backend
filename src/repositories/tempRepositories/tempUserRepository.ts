import { ITempUserRepository } from "../../interfaces/Irepositories/ItempUserRepository";
import { ITempUser } from "../../interfaces/Models/ItempUser";
import mongoose from "mongoose";
import tempUser from "../../models/tempUserModel";
import { BaseRepository } from "../baseRepository";
import {
  CreateTempUserResponse,
  FindTempUserByEmail,
  FindTempUserById,
  UpdateTempUser,
} from "../../interfaces/DTO/IRepository/IuserRepository";

export class TempUserRepository
  extends BaseRepository<ITempUser>
  implements ITempUserRepository
{
  constructor() {
    super(tempUser);
  }

  async createTempUser(
    tempUserData: ITempUser
  ): Promise<CreateTempUserResponse> {
    try {
      console.log("entering into the temporary user creating function");
      const temporaryUser = await this.create(tempUserData);
      console.log("temporaryUser:", temporaryUser);
      const savedTemporaryUser = await temporaryUser.save();
      console.log(
        "savedTemporaryUser from userRepository:",
        savedTemporaryUser
      );
      const tempUserId = (
        savedTemporaryUser._id as mongoose.Types.ObjectId
      ).toString();
      if (!savedTemporaryUser) {
        throw new Error("cannot be saved");
      }
      return { success: true, tempUserId };
    } catch (error) {
      console.log(error);
      throw new Error("Error occured while creating new user");
    }
  }

  async findTempUserById(tempUserId: string): Promise<FindTempUserById> {
    try {
      const tempSavedUser = await this.findById(tempUserId);
      console.log("tempSavedUser:", tempSavedUser);
      if (tempSavedUser) {
        return { success: true, tempUserData: tempSavedUser };
      } else {
        return {
          success: false,
          message: "Temporary user not found or expired",
        };
      }
    } catch (error) {
      console.log("Error fetching temporary user:", error);
      throw new Error("An error occurred while retrieving the temporary user");
    }
  }

  async findTempUserByEmail(email: string): Promise<FindTempUserByEmail> {
    try {
      const tempSavedUser = await this.findOne({
        email,
        expiresAt: { $gt: new Date() },
      });
      console.log("tempSavedUser by Email:", tempSavedUser);
      if (tempSavedUser) {
        return { success: true, tempUserData: tempSavedUser };
      } else {
        return {
          success: false,
          message: "Temporary user not found or expired",
        };
      }
    } catch (error) {
      console.log("error fetching temporary user by email:", error);
      throw new Error("An error occured while retreiving the temporary user");
    }
  }

  async updateTempUser(
    tempUserId: string,
    updateData: Partial<ITempUser>
  ): Promise<UpdateTempUser> {
    try {
      const updatedUser = await this.updateOne(
        { _id: tempUserId },
        { $set: updateData }
      );
      console.log("updated User:", updatedUser);
      if (updatedUser) {
        return { message: "temp userId updated successfully", success: true };
      } else {
        return {
          success: false,
          message: "Failed to update temporary user",
        };
      }
    } catch (error) {
      console.log("Error updating temporary user:", error);
      throw new Error("An error occurred while updating the temporary user");
    }
  }
}
