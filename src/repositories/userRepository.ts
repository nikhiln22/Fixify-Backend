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
      console.log("userData from user repository:",userData);
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

  async updatePassword(email: string, hashedPassword: string): Promise<UpdatePasswordResponseDTO> {
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
          message: "Failed to update password or user not found" 
        };
      }
    } catch (error) {
      console.log("Error occurred while updating password:", error);
      throw new Error("An error occurred while updating the password");
    }
  }
}
