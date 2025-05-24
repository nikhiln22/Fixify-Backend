import {
  createUserDTO,
  findByEmailResponseDTO,
  UpdatePasswordResponseDTO,
} from "../DTO/IRepository/userRepositoryDTO";
import { Iuser } from "../Models/Iuser";

export interface IuserRepository {
  createUser(userData: createUserDTO): Promise<Iuser>;
  findByEmail(email: string): Promise<findByEmailResponseDTO>;
  updatePassword(
    email: string,
    hashedPassword: string
  ): Promise<UpdatePasswordResponseDTO>;
  
  getAllUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?:string;
  }): Promise<{
    data: Iuser[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }>;
  blockUser(id: string, status: boolean): Promise<void>;
  findById(id: string): Promise<Iuser | null>;
}
