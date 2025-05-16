import { Types } from "mongoose";
import { IService } from "../Models/Iservice";

export interface IserviceRepository {
  addService(serviceData: {
    name: string;
    price: number;
    imageFile: string;
    description: string;
    category: string;
  }): Promise<IService>;

  findServiceByName(name: string): Promise<IService | null>;

  getAllServices(options: {
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
  }>;
}