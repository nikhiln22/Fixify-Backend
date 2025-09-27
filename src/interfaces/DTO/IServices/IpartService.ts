export interface AddPart {
  name: string;
  price: number;
  description: string;
  services: string[];
}

export interface AddPartResponse {
  _id: string;
  name: string;
  price: number;
  description: string;
  services: {
    _id: string;
    name: string;
  }[];
  status: string;
}

export interface TogglePartStatusResponse {
  success: boolean;
  message: string;
  data?: {
    _id: string;
    status: string;
  };
}

export interface UpdatePart {
  name?: string;
  description?: string;
  price?: number;
  services?: string[];
}

export interface UpdatePartResponse {
  _id: string;
  name: string;
  description: string;
  price: number;
  services: {
    _id: string;
    name: string;
  }[];
}
