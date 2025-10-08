import { IAddressService } from "../interfaces/Iservices/IaddressService";
import { inject, injectable } from "tsyringe";
import { IAddressRepository } from "../interfaces/Irepositories/IaddressRepository";
import {
  AddAddressDto,
  AddressResponseDto,
  OwnerAddressResponseDto,
} from "../interfaces/DTO/IServices/IaddressService";

@injectable()
export class AddressService implements IAddressService {
  constructor(
    @inject("IAddressRepository") private _addressRepository: IAddressRepository
  ) {}

  async addAddress(addressData: AddAddressDto): Promise<{
    success: boolean;
    message: string;
    data?: AddressResponseDto;
  }> {
    try {
      console.log("Entering address service - addAddress");
      console.log("Address data received:", addressData);

      if (
        !addressData.fullAddress ||
        addressData.latitude === undefined ||
        addressData.longitude === undefined
      ) {
        return {
          success: false,
          message: "Full address, longitude and latitude are required",
        };
      }

      const savedAddress = await this._addressRepository.addAddress(
        addressData
      );

      const responseDto: AddressResponseDto = {
        _id: savedAddress._id.toString(),
        addressType: savedAddress.addressType,
        houseNumber: savedAddress.houseNumber,
        landMark: savedAddress.landmark,
        fullAddress: savedAddress.fullAddress,
      };

      return {
        success: true,
        message: "Address added successfully",
        data: responseDto,
      };
    } catch (error) {
      console.log("Error occurred while adding the new address:", error);
      return {
        success: false,
        message: "Internal Server Error",
      };
    }
  }

  async getOwnerAddresses(
    ownerId: string,
    ownerModel: "user" | "technician"
  ): Promise<{
    success: boolean;
    message: string;
    data?: OwnerAddressResponseDto[];
  }> {
    try {
      if (!ownerId) {
        return { success: false, message: "Invalid Owner Id" };
      }

      const ownerAddresses = await this._addressRepository.getOwnerAddresses(
        ownerId,
        ownerModel
      );

      const addressesDto: OwnerAddressResponseDto[] = ownerAddresses.map(
        (addr) => ({
          _id: addr._id.toString(),
          addressType: addr.addressType,
          fullAddress: addr.fullAddress,
          houseNumber: addr.houseNumber,
          landmark: addr.landmark,
          latitude: addr.latitude,
          longitude: addr.longitude,
        })
      );

      return {
        success: true,
        message: "Owner addresses retrieved successfully",
        data: addressesDto,
      };
    } catch (error) {
      console.error("Error occurred while fetching owner addresses:", error);
      return { success: false, message: "Internal Server Error" };
    }
  }

  async deleteAddress(
    addressId: string,
    ownerId: string,
    ownerModel: "user" | "technician"
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log("deleting the address from the address service");
      console.log("ownerId from the address service:", ownerId);
      console.log("addressId from the address service:", addressId);
      console.log("ownerModel from the address service:", ownerModel);

      if (!addressId || !ownerId) {
        return {
          success: false,
          message: "Address ID and Owner ID are required",
        };
      }

      const existingAddress = await this._addressRepository.findByOwnerAndId(
        addressId,
        ownerId,
        ownerModel
      );

      console.log("existingAddress in address service:", existingAddress);

      if (!existingAddress) {
        return {
          success: false,
          message: "Address not found",
        };
      }

      if (
        existingAddress.ownerId.toString() !== ownerId ||
        existingAddress.ownerModel !== ownerModel
      ) {
        return {
          success: false,
          message: "Unauthorized: Address does not belong to this owner",
        };
      }

      const deletedAddress = await this._addressRepository.deleteAddress(
        addressId
      );

      if (!deletedAddress) {
        return {
          success: false,
          message: "Failed to delete address",
        };
      }

      return {
        success: true,
        message: "Address deleted successfully",
      };
    } catch (error) {
      console.log("Error occurred while deleting address:", error);
      return {
        success: false,
        message: "Internal Server Error",
      };
    }
  }
}
