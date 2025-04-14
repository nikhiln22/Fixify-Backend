import { IjobDesignation } from "../Models/IjobDesignation";

export interface IjobDesignationRepository {
  addDesignation(designation: string): Promise<IjobDesignation>;
  getAllDesignations(): Promise<IjobDesignation[]>;
  findByName(name: string): Promise<IjobDesignation | null>;
  blockDesignation(id:string): Promise<void>;
  findById(id: string): Promise<IjobDesignation | null>;
}
