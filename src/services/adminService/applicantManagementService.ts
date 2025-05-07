import { IapplicantManagementService } from "../../interfaces/Iservices/IadminService/IapplicantManagementService";
import { HTTP_STATUS } from "../../utils/httpStatus";
import { ItechnicianRepository } from "../../interfaces/Irepositories/ItechnicianRepository";
import { PaginatedApplicantsResponse } from "../../interfaces/DTO/IServices/Iadminservices.dto/applicantsManagement.dto";
import { inject, injectable } from "tsyringe";

@injectable()
export class ApplicantManagementService implements IapplicantManagementService {
  constructor(
    @inject("ItechnicianRepository")
    private technicianRepository: ItechnicianRepository
  ) {}

  async getPaginatedUnverifiedTechnicians(
    page: number
  ): Promise<PaginatedApplicantsResponse> {
    let limit = 5;
    try {
      console.log(
        "entering the fetching function of the unverified technicians"
      );
      const result = await this.technicianRepository.getUnverifiedTechnicians(
        page,
        limit
      );

      console.log("result from the applicantmanagementservice:", result);

      const totalPages = Math.ceil(result.total / limit);

      return {
        status: HTTP_STATUS.OK,
        message: "applicants fetched successfully",
        applicants: result.data,
        total: result.total,
        totalPages,
      };
    } catch (error) {
      console.log("error fetching the applicants:", error);
      return {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "failed to fetch the applicants",
      };
    }
  }
}
