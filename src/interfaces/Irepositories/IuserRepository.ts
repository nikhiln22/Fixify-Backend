import {
  CreateUser,
  FindByEmailResponse,
  UpdatePasswordResponse,
} from "../DTO/IRepository/IuserRepository";
import { IUser } from "../Models/Iuser";

export interface IUserRepository {
  createUser(userData: CreateUser): Promise<IUser>;
  findByEmail(email: string): Promise<FindByEmailResponse>;
  updatePassword(
    email: string,
    hashedPassword: string
  ): Promise<UpdatePasswordResponse>;

  getAllUsers(options: {
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
  }>;
  blockUser(id: string, status: boolean): Promise<void>;
  findById(id: string): Promise<IUser | null>;
  editProfile(
    userId: string,
    profileData: {
      username?: string;
      phone?: string;
      profilePhoto?: string;
    }
  ): Promise<IUser | undefined>;

  countActiveUsers(): Promise<number>;
}
