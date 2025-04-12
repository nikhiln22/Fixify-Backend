import { findByEmailResponseDTO } from "../DTO/IRepository/adminRepositoryDTO";

export interface IadminRepository {
  findByEmail(email: string): Promise<findByEmailResponseDTO>;
}
