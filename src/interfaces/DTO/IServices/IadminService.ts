export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    _id: string;
    email: string;
    status: string;
  };
  access_token?: string;
  refresh_token?: string;
}

export interface LoginData {
  email: string;
  password: string;
}
