import { IuserRepository } from "../../interfaces/Irepositories/IuserRepository";
import { Iuser } from "../../interfaces/Models/Iuser";
import user from "../../models/userModel";
import {
  findByEmailResponseDTO,
  createUserDTO,
} from "../../interfaces/DTO/IRepository/userRepositoryDTO";
import { BaseRepository } from "../base/baseRepository";

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
}
