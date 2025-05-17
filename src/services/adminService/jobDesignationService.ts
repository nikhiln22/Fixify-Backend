import { injectable, inject } from "tsyringe";
import { IjobDesignationService } from "../../interfaces/Iservices/IadminService/IjobDesignationService";
import { IjobDesignationRepository } from "../../interfaces/Irepositories/IjobDesignationRepository";
import { DesignationResponseDTO } from "../../interfaces/DTO/IServices/Iadminservices.dto/jobDesignationService.dto";
import { HTTP_STATUS } from "../../utils/httpStatus";
import { IjobDesignation } from "../../interfaces/Models/IjobDesignation";

@injectable()
export class JobDesignationService implements IjobDesignationService {
  constructor(
    @inject("IjobDesignationRepository")
    private designationRepository: IjobDesignationRepository
  ) {}

  async addDesignation(designation: string): Promise<DesignationResponseDTO> {
    try {
      const existing = await this.designationRepository.findByName(designation);
      if (existing) {
        return {
          status: HTTP_STATUS.CONFLICT,
          message: "Designation already exists",
        };
      }

      const newDesignation = await this.designationRepository.addDesignation(
        designation
      );
      console.log("added new designation from the service:", newDesignation);
      return {
        status: HTTP_STATUS.CREATED,
        message: "Designation added successfully",
        data: newDesignation,
      };
    } catch (error) {
      console.error("Error adding designation:", error);
      return {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while adding designation",
      };
    }
  }

  async toggleDesignationStatus(id: string): Promise<DesignationResponseDTO> {
    try {
      const designation = await this.designationRepository.findById(id);
      console.log(
        "desigantion from the block designation service:",
        designation
      );
      if (!designation) {
        return {
          status: HTTP_STATUS.NOT_FOUND,
          message: "Designation not found",
        };
      }

      const newStatus = !designation.Status;

      let updatedDesignation =
        await this.designationRepository.blockDesignation(id, newStatus);
      console.log(
        "response after blocking the job designation from the designation repository:",
        updatedDesignation
      );

      return {
        status: HTTP_STATUS.OK,
        message: `Designation successfully ${
          newStatus ? "unblocked" : "blocked"
        }`,
        data: updatedDesignation,
      };
    } catch (error) {
      console.error("Error blocking designation:", error);
      return {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Failed to block designation",
      };
    }
  }

  async getAllDesignations(options: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    success: boolean;
    status: number;
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
      });

      console.log("result from the designation service:", result);

      return {
        success: true,
        status: HTTP_STATUS.OK,
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
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while fetching designations",
      };
    }
  }

  async findDesignationByName(name: string): Promise<DesignationResponseDTO> {
    try {
      const designation = await this.designationRepository.findByName(name);
      if (!designation) {
        return {
          status: HTTP_STATUS.NOT_FOUND,
          message: "Designation not found",
        };
      }

      return {
        status: HTTP_STATUS.OK,
        message: "Designation found",
        data: designation,
      };
    } catch (error) {
      console.error("Error finding designation:", error);
      return {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Failed to find designation",
      };
    }
  }
}
