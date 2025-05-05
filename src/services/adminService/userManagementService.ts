import { inject, injectable } from "tsyringe";
import { IuserRepository } from "../../interfaces/Irepositories/IuserRepository";
import { HTTP_STATUS } from "../../utils/httpStatus";
import {
  PaginatedUserResponse,
  ToggleUserStatusResponse,
} from "../../interfaces/DTO/IServices/Iadminservices.dto/userManagement.dto";

@injectable()
export class UserManagementService {
  constructor(
    @inject("IuserRepository") private userRepository: IuserRepository
  ) {}

  async getPaginatedUsers(page: number): Promise<PaginatedUserResponse> {
    const limit = 5;

    try {
      const result = await this.userRepository.getPaginatedUsers(page, limit);
      const totalPages = Math.ceil(result.total / limit);

      return {
        status: HTTP_STATUS.OK,
        message: "Users fetched successfully",
        users: result.data,
        total: result.total,
        totalPages,
      };
    } catch (error) {
      console.error("Error fetching paginated users:", error);
      return {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Failed to fetch paginated users",
      };
    }
  }

  async toggleUserStatus(id: string): Promise<ToggleUserStatusResponse> {
    try {
      const user = await this.userRepository.findById(id);
      console.log("User fetched from repository:", user);

      if (!user) {
        return {
          message: "User not found",
        };
      }

      const newStatus = user.status === 'Active' ? 'Blocked' : 'Active';
      let response = await this.userRepository.blockUser(id, newStatus);
      console.log(
        "Response after toggling user status from the user repository:",
        response
      );

      return {
        message: `User successfully ${newStatus ? "unblocked" : "blocked"}`,
        user: { ...user.toObject(), status: newStatus },
      };
    } catch (error) {
      console.error("Error toggling user status:", error);
      return {
        message: "Failed to toggle user status",
      };
    }
  }
}
