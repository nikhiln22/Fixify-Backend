import { Iuser } from "../../../Models/Iuser";

export interface PaginatedUserResponse {
  status: number;
  message: string;
  users?: Iuser[];
  total?: number;
  totalPages?: number;
}

export interface ToggleUserStatusResponse {
  message: string;
  user?: Iuser;
}
