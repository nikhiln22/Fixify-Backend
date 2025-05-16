import { IserviceManagementService } from "../../interfaces/Iservices/IadminService/IserviceManagementService";
import { inject, injectable } from "tsyringe";
import { HTTP_STATUS } from "../../utils/httpStatus";
import {
  ServiceData,
  AddServiceResponseDTO,
} from "../../interfaces/DTO/IServices/Iadminservices.dto/serviceManagement.dto";
import { IFileUploader } from "../../interfaces/IfileUploader/IfileUploader";
import { IserviceRepository } from "../../interfaces/Irepositories/IserviceRepository";
import { IService } from "../../interfaces/Models/Iservice";

@injectable()
export class ServiceManagementService implements IserviceManagementService {
  constructor(
    @inject("IserviceRepository") private serviceRepository: IserviceRepository,
    @inject("IFileUploader") private fileUploader: IFileUploader
  ) {}

  async addService(data: ServiceData): Promise<AddServiceResponseDTO> {
    try {
      console.log("entering the service adding function");
      const existingService = await this.serviceRepository.findServiceByName(
        data.name
      );

      if (existingService) {
        return {
          success: false,
          status: HTTP_STATUS.OK,
          message: "Service already exists",
        };
      }

      let imageUrl = "";

      if (data.imageFile) {
        const uploadResult = await this.fileUploader.uploadFile(
          data.imageFile,
          {
            folder: "fixify/services",
          }
        );

        if (!uploadResult) {
          return {
            success: false,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: "Failed to upload image",
          };
        }

        imageUrl = uploadResult;
      }

      const serviceData = {
        name: data.name,
        price: data.price,
        imageFile: imageUrl,
        description: data.description,
        category: data.categoryId,
      };

      const newService = await this.serviceRepository.addService(serviceData);
      console.log("response from the services adding service:", newService);

      return {
        status: HTTP_STATUS.CREATED,
        success: true,
        message: "service added successfully",
        data: newService,
      };
    } catch (error) {
      console.log("error occurred while adding the service", error);
      return {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        success: false,
        message: "something went wrong while adding the service",
      };
    }
  }

  async getAllServices(options: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
  }): Promise<{
    success: boolean;
    status: number;
    message: string;
    data?: {
      services: IService[];
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
      console.log("Function fetching all the services");

      const page = options.page || 1;
      const limit = options.limit || 5;

      const result = await this.serviceRepository.getAllServices({
        page,
        limit,
        search: options.search,
        categoryId: options.categoryId,
      });

      console.log("result from the servicemanagement service:", result);

      return {
        success: true,
        status: HTTP_STATUS.OK,
        message: "Services fetched successfully",
        data: {
          services: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            pages: result.pages,
            limit: result.limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: result.page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching services:", error);
      return {
        success: false,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        message: "Something went wrong while fetching services",
      };
    }
  }
}
