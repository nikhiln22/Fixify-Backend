import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository";
import service from "../models/serviceModel";
import { IService } from "../interfaces/Models/Iservice";
import { IserviceRepository } from "../interfaces/Irepositories/IserviceRepository";
import { FilterQuery, Types } from "mongoose";

@injectable()
export class ServiceRepository
  extends BaseRepository<IService>
  implements IserviceRepository
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
  }): Promise<IService> {
    try {
      console.log("entered into the service adding function in the repository");
      const newService = await this.create({
        name: serviceData.name,
        image: serviceData.imageFile,
        price: serviceData.price,
        description: serviceData.description,
        category: new Types.ObjectId(serviceData.category),
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
}
