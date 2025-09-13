import { IService } from "../Models/Iservice";

export interface IServiceRepository {
  addService(serviceData: {
    name: string;
    image: string;
    description: string;
    categoryId: string;
    designationId: string;
    serviceType: "fixed" | "hourly";
    price?: number;
    estimatedTime?: number;
    hourlyRate?: number;
    maxHours?: number;
  }): Promise<IService>;

  findServiceByName(name: string): Promise<IService | null>;

  getAllServices(options: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    status?: string;
    serviceType?: string;
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
    newStatus: string
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

  getServicesByIds(serviceIds: string[]): Promise<IService[]>;
}
