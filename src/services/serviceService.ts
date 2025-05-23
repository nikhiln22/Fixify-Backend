import { IServiceService} from "../interfaces/Iservices/IserviceService";
import { inject, injectable } from "tsyringe";
import { HTTP_STATUS } from "../utils/httpStatus";
import {
  ServiceData,
  AddServiceResponse,
  AddCategoryResponseDTO,
  ToggleCategoryStatusResponseDTO,
  UpdatedCategoryResponseDTO,
} from "../interfaces/DTO/IServices/IservicesService";
import { IFileUploader } from "../interfaces/IfileUploader/IfileUploader";
import { IserviceRepository } from "../interfaces/Irepositories/IserviceRepository";
import { IService } from "../interfaces/Models/Iservice";
import { Icategory } from "../interfaces/Models/Icategory";
import { ICategoryRepository } from "../interfaces/Irepositories/IcategoryRepository";

@injectable()
export class ServiceServices implements IServiceService {
  constructor(
    @inject("IserviceRepository") private serviceRepository: IserviceRepository,
    @inject("ICategoryRepository") private categoryRepository: ICategoryRepository,
    @inject("IFileUploader") private fileUploader: IFileUploader
  ) {}

  async addService(data: ServiceData): Promise<AddServiceResponse> {
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

  async addCategory(
      name: string,
      imageFile: string
    ): Promise<AddCategoryResponseDTO> {
      try {
        const existingCategory = await this.categoryRepository.findCategoryByName(
          name
        );
        if (existingCategory) {
          return {
            success: false,
            status: HTTP_STATUS.OK,
            message: "Category already exists",
          };
        }
  
        const imageUrl = await this.fileUploader.uploadFile(imageFile, {
          folder: "fixify/categories",
        });
  
        if (!imageUrl) {
          return {
            success: false,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: "Failed to upload image",
          };
        }
  
        const newCategory = await this.categoryRepository.addCategory(
          name,
          imageUrl
        );
        console.log("response from the category adding service:", newCategory);
        return {
          status: HTTP_STATUS.CREATED,
          success: true,
          message: "Category addedd successfully",
          data: newCategory,
        };
      } catch (error) {
        console.log("error occured while adding the category");
        return {
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          success: false,
          message: "something went wrong while adding the category",
        };
      }
    }
  
    async getAllCategories(options: {
      page?: number;
      limit?: number;
      search?: string;
    }): Promise<{
      success: boolean;
      status: number;
      message: string;
      data?: {
        categories: Icategory[];
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
        console.log(
          "fetching all the categories from the category management service"
        );
  
        const page = options.page;
        const limit = options.limit;
  
        const result = await this.categoryRepository.getAllCategories({
          page,
          limit,
          search: options.search,
        });
  
        console.log("result from the categorymanagementservice:", result);
  
          return {
          success: true,
          status: HTTP_STATUS.OK,
          message: "categories fetched successfully",
          data: {
            categories: result.data,
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
        console.log("error fetching the categories:", error);
        return {
          success:false,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: "failed to fetch the categories",
        };
      }
    }
  
    async toggleCategoryStatus(
      categoryId: string
    ): Promise<ToggleCategoryStatusResponseDTO> {
      try {
        console.log("toggling the status of the category");
        const category = await this.categoryRepository.findCategoryById(
          categoryId
        );
  
        if (!category) {
          return {
            success: false,
            status: HTTP_STATUS.NOT_FOUND,
            message: "Category not found",
          };
        }
  
        const newStatus = !category.status;
  
        const updatedCategory =
          await this.categoryRepository.updateCategoryStatus(
            categoryId,
            newStatus
          );
  
        if (!updatedCategory) {
          return {
            success: false,
            status: HTTP_STATUS.NOT_FOUND,
            message: "Failed to update category",
          };
        }
  
        console.log(
          "Response after toggling category status from the category repository:",
          updatedCategory
        );
  
        return {
          success: true,
          status: HTTP_STATUS.OK,
          message: `Category successfully ${
            newStatus ? "activated" : "deactivated"
          }`,
          data: updatedCategory,
        };
      } catch (error) {
        console.error("Error toggling category status:", error);
        return {
          success: false,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: "Failed to toggle category status",
        };
      }
    }
  
    async updateCategory(
      categoryId: string,
      updateData: { name?: string; image?: string }
    ): Promise<UpdatedCategoryResponseDTO> {
      try {
        console.log("Updating category details");
  
        const category = await this.categoryRepository.findCategoryById(
          categoryId
        );
  
        if (!category) {
          return {
            success: false,
            status: HTTP_STATUS.NOT_FOUND,
            message: "Category not found",
          };
        }
  
        const updatedFields: { name?: string; image?: string } = {};
  
        if (updateData.name !== undefined) {
          updatedFields.name = updateData.name;
        }
  
        if (updateData.image) {
          const newImageUrl = await this.fileUploader.uploadFile(
            updateData.image,
            { folder: "categories" }
          );
  
          if (!newImageUrl) {
            return {
              success: false,
              status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
              message: "Failed to upload image to cloud storage",
            };
          }
  
          updatedFields.image = newImageUrl;
        }
  
        if (Object.keys(updatedFields).length === 0) {
          return {
            success: false,
            status: HTTP_STATUS.BAD_REQUEST,
            message: "No update data provided",
          };
        }
  
        const updatedCategory = await this.categoryRepository.updateCategory(
          categoryId,
          updatedFields
        );
  
        if (!updatedCategory) {
          return {
            success: false,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: "Failed to update category",
          };
        }
  
        return {
          success: true,
          status: HTTP_STATUS.OK,
          message: "Category updated successfully",
          data: updatedCategory,
        };
      } catch (error) {
        console.error("Error updating category:", error);
        return {
          success: false,
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
          message: "Failed to update category",
        };
      }
    }
}