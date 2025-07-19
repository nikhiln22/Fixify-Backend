import { IJobDesignation } from "../Models/IjobDesignation";

export interface IJobDesignationRepository {
  addDesignation(designation: string): Promise<IJobDesignation>;
  getAllDesignations(options?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{
    data: IJobDesignation[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }>;
  findByName(name: string): Promise<IJobDesignation | null>;
  blockDesignation(
    id: string,
    status: boolean
  ): Promise<IJobDesignation | null>;
  findById(id: string): Promise<IJobDesignation | null>;
}
