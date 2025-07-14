import { IUserAddress } from "../Models/Iaddress";

export interface IAddressService {
  addAddress(
    userId: string,
    addressData: Partial<IUserAddress>
  ): Promise<{
    success: boolean;
    message: string;
    data?: IUserAddress;
  }>;

  getUserAddresses(userId: string): Promise<{
    success: boolean;
    message: string;
    data?: IUserAddress[];
  }>;

  //   updateAddress(
  //     addressId: string,
  //     userId: string,
  //     addressData: Partial<IUserAddress>
  //   ): Promise<{
  //     success: boolean;
  //     message: string;
  //     status: number;
  //     data?: IUserAddress;
  //   }>;

  deleteAddress(
    addressId: string,
    userId: string
  ): Promise<{
    success: boolean;
    message: string;
  }>;

  //   getAddressById(
  //     addressId: string,
  //     userId: string
  //   ): Promise<{
  //     success: boolean;
  //     message: string;
  //     status: number;
  //     data?: IUserAddress;
  //   }>;
}
