import { createTempUserResponseDTO, createUserDTO, findByEmailResponseDTO, findTempUserByIdDTO } from "../DTO/IRepository/userRepositoryDTO";
import { ItempUser } from "../Models/ItempUser";
import { Iuser } from "../Models/Iuser";

export interface IuserRepository {
    createUser(userData: createUserDTO): Promise<Iuser>
    findByEmail(email: string): Promise<findByEmailResponseDTO>
    createTempUser(userData: ItempUser): Promise<createTempUserResponseDTO>
    findTempUserById(tempUserId: String): Promise<findTempUserByIdDTO>
}