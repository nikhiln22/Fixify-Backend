import { IServiceService } from "../interfaces/Iservices/IserviceService";
import { inject, injectable } from "tsyringe";
import {
  ServiceData,
  AddServiceResponse,
  ToggleServiceStatusResponse,
  UpdatedServiceResponse,
  GetServiceDetailsResponse,
} from "../interfaces/DTO/IServices/IservicesService";
import { IFileUploader } from "../interfaces/IfileUploader/IfileUploader";
import { IServiceRepository } from "../interfaces/Irepositories/IserviceRepository";
import { IService } from "../interfaces/Models/Iservice";
import { ICategoryRepository } from "../interfaces/Irepositories/IcategoryRepository";

@injectable()
export class ServiceServices implements IServiceService {
  constructor(
    @inject("IServiceRepository")
    private _serviceRepository: IServiceRepository,
    @inject("ICategoryRepository")
    private _categoryRepository: ICategoryRepository,
    @inject("IFileUploader") private fileUploader: IFileUploader
  ) {}

  async addService(data: ServiceData): Promise<AddServiceResponse> {
    try {
      console.log("entering the service adding function");
      const existingService = await this._serviceRepository.findServiceByName(
        data.name
      );

      if (existingService) {
        return {
          success: false,
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
        designation: data.designationId,
      };

      const newService = await this._serviceRepository.addService(serviceData);
      console.log("response from the services adding service:", newService);

      return {
        success: true,
        message: "service added successfully",
        data: newService,
      };
    } catch (error) {
      console.log("error occurred while adding the service", error);
      return {
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
    status?: string;
  }): Promise<{
    success: boolean;
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

      const page = options.page;
      const limit = options.limit;

      const result = await this._serviceRepository.getAllServices({
        page,
        limit,
        search: options.search,
        categoryId: options.categoryId,
        status: options.status,
      });

      console.log("result from the servicemanagement service:", result);

      return {
        success: true,
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
        message: "Something went wrong while fetching services",
      };
    }
  }

  async toggleServiceStatus(
    serviceId: string
  ): Promise<ToggleServiceStatusResponse> {
    try {
      console.log("toggling the status of the category");
      const service = await this._serviceRepository.findServiceById(serviceId);

      if (!service) {
        return {
          success: false,
          message: "Service not found",
        };
      }

      const newStatus = service.status === "Active" ? "Blocked" : "Active";

      const updatedService = await this._serviceRepository.updateServiceStatus(
        serviceId,
        newStatus
      );

      if (!updatedService) {
        return {
          success: false,
          message: "Failed to update service",
        };
      }

      console.log(
        "Response after toggling service status from the service repository:",
        updatedService
      );

      return {
        success: true,
        message: `${updatedService.name} successfully ${
          newStatus === "Active" ? "unblocked" : "Blocked"
        }`,
        data: {
          _id: updatedService._id,
          status: updatedService.status,
        },
      };
    } catch (error) {
      console.error("Error toggling service status:", error);
      return {
        success: false,
        message: "Failed to toggle service status",
      };
    }
  }

  async updateService(
    serviceId: string,
    updateData: {
      name?: string;
      image?: string;
      description?: string;
      price?: number;
      categoryId?: string;
    }
  ): Promise<UpdatedServiceResponse> {
    try {
      console.log("Updating service details");

      const service = await this._serviceRepository.findServiceById(serviceId);

      if (!service) {
        return {
          success: false,
          message: "Service not found",
        };
      }

      const updatedFields: {
        name?: string;
        image?: string;
        description?: string;
        price?: number;
        categoryId?: string;
      } = {};

      if (updateData.name !== undefined) {
        updatedFields.name = updateData.name;
      }

      if (updateData.description !== undefined) {
        updatedFields.description = updateData.description;
      }

      if (updateData.price !== undefined) {
        updatedFields.price = updateData.price;
      }

      if (updateData.categoryId !== undefined) {
        updatedFields.categoryId = updateData.categoryId;
      }

      if (updateData.image) {
        const newImageUrl = await this.fileUploader.uploadFile(
          updateData.image,
          { folder: "services" }
        );

        if (!newImageUrl) {
          return {
            success: false,
            message: "Failed to upload image to cloud storage",
          };
        }

        updatedFields.image = newImageUrl;
      }

      if (Object.keys(updatedFields).length === 0) {
        return {
          success: false,
          message: "No update data provided",
        };
      }

      const updatedService = await this._serviceRepository.updateService(
        serviceId,
        updatedFields
      );

      if (!updatedService) {
        return {
          success: false,
          message: "Failed to update Service",
        };
      }

      return {
        success: true,
        message: "Service updated successfully",
        data: updatedService,
      };
    } catch (error) {
      console.error("Error updating service:", error);
      return {
        success: false,
        message: "Failed to update service",
      };
    }
  }
  async getServiceDetails(
    serviceId: string
  ): Promise<GetServiceDetailsResponse> {
    try {
      console.log(
        "serviceId in the service service layer for getting service layers:",
        serviceId
      );

      const service = await this._serviceRepository.findServiceById(serviceId);

      console.log("fetched service details:", service);

      if (!service) {
        return {
          success: false,
          message: "Service not found",
        };
      }

      const relatdServicesResult = await this._serviceRepository.getAllServices(
        {
          categoryId: service?.category.toString(),
          status: "active",
        }
      );

      console.log("fetched related services:", relatdServicesResult);

      const relatedServices = relatdServicesResult.data.filter(
        (relatedService) => relatedService._id.toString() !== serviceId
      );

      console.log("final related services result:", relatedServices);

      return {
        success: true,
        message: "service details fetched successfully",
        data: {
          service: service,
          relatedService: relatedServices,
        },
      };
    } catch (error) {
      console.log("error occured while fetching the service Details:", error);
      return {
        success: false,
        message: "Failed to update category",
      };
    }
  }
}
