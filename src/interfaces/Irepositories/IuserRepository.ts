import {createUserDTO, findByEmailResponseDTO, UpdatePasswordResponseDTO} from "../DTO/IRepository/userRepositoryDTO";
import { Iuser } from "../Models/Iuser";

export interface IuserRepository {
    createUser(userData: createUserDTO): Promise<Iuser>
    findByEmail(email: string): Promise<findByEmailResponseDTO>
    updatePassword(email: string, hashedPassword: string): Promise<UpdatePasswordResponseDTO>;
    getPaginatedUsers(page: number, limit: number): Promise<{ data: Iuser[], total: number }>;
    blockUser(id:string,status:string): Promise<void>;
    findById(id: string): Promise<Iuser | null>;
}