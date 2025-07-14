import { injectable, inject } from "tsyringe";
import { IjobsService } from "../interfaces/Iservices/IjobsService";
import { IjobDesignationRepository } from "../interfaces/Irepositories/IjobDesignationRepository";
import { DesignationResponse } from "../interfaces/DTO/IServices/IjobService";
import { IjobDesignation } from "../interfaces/Models/IjobDesignation";

@injectable()
export class JobService implements IjobsService {
  constructor(
    @inject("IjobDesignationRepository")
    private designationRepository: IjobDesignationRepository
  ) {}

  async addDesignation(designation: string): Promise<DesignationResponse> {
    try {
      const existing = await this.designationRepository.findByName(designation);
      if (existing) {
        return {
          success: false,
          message: "Designation already exists",
        };
      }

      const newDesignation = await this.designationRepository.addDesignation(
        designation
      );
      console.log("added new designation from the service:", newDesignation);
      return {
        success: true,
        message: "Designation added successfully",
        data: newDesignation,
      };
    } catch (error) {
      console.error("Error adding designation:", error);
      return {
        success: false,
        message: "Something went wrong while adding designation",
      };
    }
  }

  async toggleDesignationStatus(id: string): Promise<DesignationResponse> {
    try {
      const designation = await this.designationRepository.findById(id);
      console.log(
        "desigantion from the block designation service:",
        designation
      );
      if (!designation) {
        return {
          success: false,
          message: "Designation not found",
        };
      }

      const newStatus = !designation.status;

      const updatedDesignation =
        await this.designationRepository.blockDesignation(id, newStatus);
      console.log(
        "response after blocking the job designation from the designation repository:",
        updatedDesignation
      );

      return {
        success: true,
        message: `Designation successfully ${
          newStatus ? "unblocked" : "blocked"
        }`,
        data: updatedDesignation,
      };
    } catch (error) {
      console.error("Error blocking designation:", error);
      return {
        success: false,
        message: "Failed to block designation",
      };
    }
  }

  async getAllDesignations(options: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      designations: IjobDesignation[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }> {
    try {
      console.log("Function fetching all designations");
      const page = options.page || 1;
      const limit = options.limit || 5;

      const result = await this.designationRepository.getAllDesignations({
        page,
        limit,
        search: options.search,
        status: options.status,
      });

      console.log("result from the designation service:", result);

      return {
        success: true,
        message: "Designations fetched successfully",
        data: {
          designations: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            pages: result.pages,
            limit: limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching designations:", error);
      return {
        success: false,
        message: "Something went wrong while fetching designations",
      };
    }
  }

  async findDesignationByName(name: string): Promise<DesignationResponse> {
    try {
      const designation = await this.designationRepository.findByName(name);
      if (!designation) {
        return {
          success: false,
          message: "Designation not found",
        };
      }

      return {
        success: true,
        message: "Designation found",
        data: designation,
      };
    } catch (error) {
      console.error("Error finding designation:", error);
      return {
        success: false,
        message: "Failed to find designation",
      };
    }
  }
}
