import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository";
import service from "../models/serviceModel";
import { IService } from "../interfaces/Models/Iservice";
import { IServiceRepository } from "../interfaces/Irepositories/IserviceRepository";
import { FilterQuery, Types } from "mongoose";

@injectable()
export class ServiceRepository
  extends BaseRepository<IService>
  implements IServiceRepository
{
  constructor() {
    super(service);
  }

  async addService(serviceData: {
    name: string;
    price: number;
    imageFile: string;
    description: string;
    category: string;
    designation: string;
  }): Promise<IService> {
    try {
      console.log("entered into the service adding function in the repository");
      const newService = await this.create({
        name: serviceData.name,
        image: serviceData.imageFile,
        price: serviceData.price,
        description: serviceData.description,
        category: new Types.ObjectId(serviceData.category),
        designation: new Types.ObjectId(serviceData.designation),
      });
      return newService;
    } catch (error) {
      console.log("error occurred while adding the service", error);
      throw new Error("failed to add the new Service");
    }
  }

  async findServiceByName(name: string): Promise<IService | null> {
    try {
      console.log("Checking if service already exists...");
      return await this.findOne({ name });
    } catch (error) {
      console.error("Error occurred while finding the service:", error);
      throw new Error("Failed to find service by name");
    }
  }

  async getAllServices(options: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    status?: string;
  }): Promise<{
    data: IService[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    try {
      console.log("entering the function which fetches all the services");
      const page = options.page || 1;
      const limit = options.limit || 5;

      const filter: FilterQuery<IService> = {};

      if (options.categoryId) {
        filter.category = new Types.ObjectId(options.categoryId);
      }

      if (options.search) {
        filter.$or = [
          { name: { $regex: options.search, $options: "i" } },
          { description: { $regex: options.search, $options: "i" } },
        ];
      }

      if (options.status) {
        if (options.status === "active") {
          filter.status = true;
        } else if (options.status === "blocked") {
          filter.status = false;
        }
      }

      const result = (await this.find(filter, {
        pagination: { page, limit },
        sort: { createdAt: -1 },
      })) as { data: IService[]; total: number };

      const populatedData = await Promise.all(
        result.data.map(async (service) => {
          return await this.model.populate(service, {
            path: "category",
            select: "name",
          });
        })
      );

      console.log("populated data from the service repository:", populatedData);

      return {
        data: populatedData,
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit),
      };
    } catch (error) {
      console.log("error occured while fetching the data:", error);
      throw new Error("Failed to fetch the services");
    }
  }

  async findServiceById(id: string): Promise<IService | null> {
    try {
      const service = await this.findById(id);
      return service;
    } catch (error) {
      throw new Error("Error finding service by ID: " + error);
    }
  }

  async updateServiceStatus(
    serviceId: string,
    newStatus: boolean
  ): Promise<IService | null> {
    try {
      console.log(
        `Updating service status to ${newStatus} for service ${serviceId}`
      );

      const updatedService = await this.updateOne(
        { _id: serviceId },
        { status: newStatus }
      );

      console.log(`Service status update operation completed:`, updatedService);
      return updatedService;
    } catch (error) {
      console.error(
        `Error in repository while updating service status:`,
        error
      );
      throw new Error(
        "Error occured while updating the service status:" + error
      );
    }
  }

  async updateService(
    id: string,
    updateData: {
      name?: string;
      image?: string;
      price?: number;
      description?: string;
      categoryId?: string;
    }
  ): Promise<IService | null> {
    try {
      console.log(`Updating service with ID: ${id}`, updateData);

      const updateObject: any = {};

      if (updateData.name !== undefined) {
        updateObject.name = updateData.name;
      }

      if (updateData.image !== undefined) {
        updateObject.image = updateData.image;
      }

      if (updateData.price !== undefined) {
        updateObject.price = updateData.price;
      }

      if (updateData.description !== undefined) {
        updateObject.description = updateData.description;
      }

      if (updateData.categoryId !== undefined) {
        updateObject.category = updateData.categoryId;
      }

      await this.updateOne({ _id: id }, { $set: updateObject });

      const updatedService = await this.model
        .findById(id)
        .populate("category", "name _id");

      console.log(`Service updated successfully:`, updatedService);
      return updatedService;
    } catch (error) {
      console.error(`Error updating service:`, error);
      throw new Error(`Failed to update service: ${error}`);
    }
  }
}
