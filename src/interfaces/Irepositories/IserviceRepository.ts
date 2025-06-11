import { IService } from "../Models/Iservice";

export interface IserviceRepository {
  addService(serviceData: {
    name: string;
    price: number;
    imageFile: string;
    description: string;
    category: string;
    designation: string;
  }): Promise<IService>;

  findServiceByName(name: string): Promise<IService | null>;

  getAllServices(options: {
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
  }>;
  findServiceById(id: string): Promise<IService | null>;
  updateServiceStatus(
    serviceId: string,
    newStatus: boolean
  ): Promise<IService | null>;
  updateService(
    id: string,
    updateData: {
      name?: string;
      image?: string;
      price?: number;
      description?: string;
      categoryId?: string;
    }
  ): Promise<IService | null>;
}
