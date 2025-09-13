import { IDesignation } from "../Models/Idesignation";

export interface IDesignationRepository {
  addDesignation(designation: string): Promise<IDesignation>;
  getAllDesignations(options?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{
    data: IDesignation[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }>;
  findDesignationByName(name: string): Promise<IDesignation | null>;
  blockDesignation(
    id: string,
    newStatus: "Active" | "Blocked"
  ): Promise<IDesignation | null>;
  findDesignationById(id: string): Promise<IDesignation | null>;
}
