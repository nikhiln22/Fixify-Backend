import {
  AddAddressDto,
  AddressResponseDto,
  OwnerAddressResponseDto,
} from "../DTO/IServices/IaddressService";

export interface IAddressService {
  addAddress(addressData: AddAddressDto): Promise<{
    success: boolean;
    message: string;
    data?: AddressResponseDto;
  }>;

  getOwnerAddresses(
    ownerId: string,
    ownerModel: "user" | "technician"
  ): Promise<{
    success: boolean;
    message: string;
    data?: OwnerAddressResponseDto[];
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
