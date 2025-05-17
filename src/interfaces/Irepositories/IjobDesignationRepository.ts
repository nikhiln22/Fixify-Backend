import { IjobDesignation } from "../Models/IjobDesignation";

export interface IjobDesignationRepository {
  addDesignation(designation: string): Promise<IjobDesignation>;
  getAllDesignations(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    data: IjobDesignation[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }>
  findByName(name: string): Promise<IjobDesignation | null>;
  blockDesignation(id:string,status:boolean): Promise<IjobDesignation | null>;
  findById(id: string): Promise<IjobDesignation | null>;
}
