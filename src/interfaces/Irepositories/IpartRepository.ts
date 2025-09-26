import { AddPart, UpdatePart } from "../DTO/IServices/IpartService";
import { IPart } from "../Models/Ipart";

export interface IPartsRepository {
  addPart(data: AddPart): Promise<IPart | null>;
  getAllParts(options: {
    page?: number;
    limit?: number;
    search?: string;
    serviceId?: string;
    status?: string;
  }): Promise<{
    data: IPart[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }>;
  findPartById(id: string): Promise<IPart | null>;
  updatePartStatus(partId: string, newStatus: string): Promise<IPart | null>;
  updatePart(partId: string, data: UpdatePart): Promise<IPart | null>;
}
