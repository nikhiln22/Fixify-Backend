import { IjobDesignation } from "../Models/IjobDesignation";

export interface IjobDesignationRepository {
  addDesignation(designation: string): Promise<IjobDesignation>;
  getAllDesignations(): Promise<IjobDesignation[]>;
  getPaginatedDesignations(page: number, limit: number): Promise<{ data: IjobDesignation[], total: number }>;
  findByName(name: string): Promise<IjobDesignation | null>;
  blockDesignation(id:string,status:boolean): Promise<void>;
  findById(id: string): Promise<IjobDesignation | null>;
}
