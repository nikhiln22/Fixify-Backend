import {createUserDTO, findByEmailResponseDTO, UpdatePasswordResponseDTO} from "../DTO/IRepository/userRepositoryDTO";
import { Iuser } from "../Models/Iuser";

export interface IuserRepository {
    createUser(userData: createUserDTO): Promise<Iuser>
    findByEmail(email: string): Promise<findByEmailResponseDTO>
    updatePassword(email: string, hashedPassword: string): Promise<UpdatePasswordResponseDTO>;
}