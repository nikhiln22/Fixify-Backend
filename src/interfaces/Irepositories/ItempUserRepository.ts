import {
  createTempUserResponseDTO,
  findTempUserByEmailDTO,
  findTempUserByIdDTO,
  updateTempUserDTO,
} from "../DTO/IRepository/userRepositoryDTO";
import { ItempUser } from "../Models/ItempUser";

export interface ItempUserRepository {
  createTempUser(userData: ItempUser): Promise<createTempUserResponseDTO>;
  findTempUserById(tempUserId: String): Promise<findTempUserByIdDTO>;
  findTempUserByEmail(email: string): Promise<findTempUserByEmailDTO>;
  updateTempUser(
      tempUserId: string,
      updateData: Partial<ItempUser>
    ): Promise<updateTempUserDTO>
}
