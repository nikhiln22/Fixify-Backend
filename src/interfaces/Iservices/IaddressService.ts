import { IAddress } from "../Models/Iaddress";

export interface IAddressService {
  addAddress(
    ownerId: string,
    ownerModel: "user" | "technician",
    addressData: Partial<IAddress>
  ): Promise<{
    success: boolean;
    message: string;
    data?: IAddress;
  }>;

  getOwnerAddresses(
    userId: string,
    ownerModel: "user" | "technician"
  ): Promise<{
    success: boolean;
    message: string;
    data?: IAddress[];
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
    ownerId: string,
    ownerModel: "user" | "technician"
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
