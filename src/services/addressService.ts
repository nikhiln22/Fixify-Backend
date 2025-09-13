import { IAddressService } from "../interfaces/Iservices/IaddressService";
import { inject, injectable } from "tsyringe";
import { IAddressRepository } from "../interfaces/Irepositories/IaddressRepository";
import { IAddress } from "../interfaces/Models/Iaddress";
import { Types } from "mongoose";

@injectable()
export class AddressService implements IAddressService {
  constructor(
    @inject("IAddressRepository") private _addressRepository: IAddressRepository
  ) {}

  async addAddress(
    ownerId: string,
    ownerModel: "user" | "technician",
    addressData: Partial<IAddress>
  ): Promise<{
    success: boolean;
    message: string;
    data?: IAddress;
  }> {
    try {
      console.log("entering to the address service adding the new address");
      console.log("ownerId from the address service:", ownerId);
      console.log("ownerModel from the address service:", ownerModel);

      if (
        !addressData.fullAddress ||
        !addressData.longitude ||
        !addressData.latitude
      ) {
        return {
          success: false,
          message: "Full address, longitude and latitude are required",
        };
      }

      const newAddressData: Partial<IAddress> = {
        ownerId: new Types.ObjectId(ownerId),
        ownerModel: ownerModel,
        fullAddress: addressData.fullAddress,
        longitude: addressData.longitude,
        latitude: addressData.latitude,
      };

      if (addressData.addressType) {
        newAddressData.addressType = addressData.addressType;
      }

      if (addressData.landmark) {
        newAddressData.landmark = addressData.landmark;
      }

      if (addressData.houseNumber) {
        newAddressData.houseNumber = addressData.houseNumber;
      }

      console.log(
        "newAddressData for adding the address from the address service:",
        newAddressData
      );

      const savedAddress = await this._addressRepository.addAddress(
        newAddressData as IAddress
      );

      return {
        success: true,
        message: "Address added successfully",
        data: savedAddress,
      };
    } catch (error) {
      console.log("error occurred while adding the new Address:", error);
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
    data?: IAddress[];
  }> {
    try {
      console.log("entering to the address fetching service");
      console.log("ownerId from the address fetching service:", ownerId);
      console.log("ownerModel from the address fetching service:", ownerModel);

      if (!ownerId) {
        return {
          success: false,
          message: "Invalid Owner Id",
        };
      }

      const ownerAddresses = await this._addressRepository.getOwnerAddresses(
        ownerId,
        ownerModel
      );

      console.log(
        "owner addresses from the address repository in the address service:",
        ownerAddresses
      );
      return {
        success: true,
        message: "Owner addresses retrieved successfully",
        data: ownerAddresses,
      };
    } catch (error) {
      console.log("Error occurred while fetching owner addresses:", error);
      return {
        success: false,
        message: "Internal Server Error",
      };
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
