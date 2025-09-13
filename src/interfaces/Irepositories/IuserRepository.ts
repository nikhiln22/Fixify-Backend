import { CreateUser } from "../DTO/IRepository/IuserRepository";
import { IUser } from "../Models/Iuser";

export interface IUserRepository {
  createUser(userData: CreateUser): Promise<IUser>;
  updateUserExpiry(email: string, newExpiresAt: Date): Promise<void>;
  updateUserVerification(email: string): Promise<void>;
  findByEmail(email: string): Promise<IUser | null>;
  updatePassword(email: string, hashedPassword: string): Promise<void>;
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
  blockUser(userId: string, newStatus: "Active" | "Blocked"): Promise<IUser>;
  findById(id: string): Promise<IUser | null>;
  editProfile(
    userId: string,
    profileData: {
      username?: string;
      phone?: string;
      profilePhoto?: string;
    }
  ): Promise<IUser | null>;

  countActiveUsers(): Promise<number>;
}
