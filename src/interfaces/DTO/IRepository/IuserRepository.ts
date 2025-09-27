export interface CreateUser {
  username: string;
  email: string;
  phone: number;
  password: string;
  is_verified?: boolean;
  status?: "Active" | "Blocked";
}
