import {
  CreateTempUserResponse,
  FindTempUserByEmail,
  FindTempUserById,
  UpdateTempUser,
} from "../DTO/IRepository/IuserRepository";
import { ITempUser } from "../Models/ItempUser";

export interface ITempUserRepository {
  createTempUser(userData: ITempUser): Promise<CreateTempUserResponse>;
  findTempUserById(tempUserId: string): Promise<FindTempUserById>;
  findTempUserByEmail(email: string): Promise<FindTempUserByEmail>;
  updateTempUser(
    tempUserId: string,
    updateData: Partial<ITempUser>
  ): Promise<UpdateTempUser>;
}
