import { IAddressService } from "../interfaces/Iservices/IaddressService";
import { inject, injectable } from "tsyringe";
import { IAddressRepository } from "../interfaces/Irepositories/IaddressRepository";
import { IUserAddress } from "../interfaces/Models/Iaddress";
import { HTTP_STATUS } from "../utils/httpStatus";
import { Types } from "mongoose";

@injectable()
export class AddressService implements IAddressService {
  constructor(
    @inject("IAddressRepository") private addressRepository: IAddressRepository
  ) {}

  async addAddress(
    userId: string,
    addressData: Partial<IUserAddress>
  ): Promise<{
    success: boolean;
    message: string;
    status: number;
    data?: IUserAddress;
  }> {
    try {
      console.log("entering to the address service adding the new address");
      console.log("userId from the address service:", userId);

      if (
        !addressData.fullAddress ||
        !addressData.longitude ||
        !addressData.latitude
      ) {
        return {
          success: false,
          message: "Full address,longitude and latitude are required",
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }

      const newAddressData = {
        userId: new Types.ObjectId(userId),
        addressType: addressData.addressType || "Home",
        fullAddress: addressData.fullAddress,
        longitude: addressData.longitude,
        latitude: addressData.latitude,
        landmark: addressData.landmark,
      };

      console.log(
        "newAddressData for adding the address from the address service:",
        newAddressData
      );

      const savedAddress = await this.addressRepository.addAddress(
        newAddressData as IUserAddress
      );

      return {
        success: true,
        status: HTTP_STATUS.CREATED,
        message: "Address added successfully",
        data: savedAddress,
      };
    } catch (error) {
      console.log("error occured while adding the new Address:", error);
      return {
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        success: false,
        message: "Internal Server Error",
      };
    }
  }

  async getUserAddresses(userId: string): Promise<{
    success: boolean;
    message: string;
    status: number;
    data?: IUserAddress[];
  }> {
    try {
      console.log("entering to the user address fetchning service");
      console.log("userId from the user address fetching service:", userId);
      if (!userId) {
        return {
          success: false,
          message: "Invalid User Id",
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }

      const userAddresses = await this.addressRepository.getUserAddresses(
        userId
      );

      console.log(
        "user address from the address repository in the address service:",
        userAddresses
      );
      return {
        success: true,
        message: "User addresses retrieved successfully",
        status: HTTP_STATUS.OK,
        data: userAddresses,
      };
    } catch (error) {
      console.log("Error occurred while fetching user addresses:", error);
      return {
        success: false,
        message: "Internal Server Error",
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async deleteAddress(
    addressId: string,
    userId: string
  ): Promise<{ success: boolean; message: string; status: number }> {
    try {
      console.log("deleting the user address from the address service");
      console.log("userId from the address service:", userId);
      console.log("addressId from the address service:", addressId);


      if (!addressId || !userId) {
        return {
          success: false,
          message: "Address ID and User ID are required",
          status: HTTP_STATUS.BAD_REQUEST,
        };
      }

      const existingAddress = await this.addressRepository.findById(addressId);

      console.log("existingAddress in address service:",existingAddress);

      if (!existingAddress) {
        return {
          success: false,
          message: "Address not found",
          status: HTTP_STATUS.NOT_FOUND,
        };
      }

      if (existingAddress.userId.toString() !== userId) {
        return {
          success: false,
          message: "Unauthorized: Address does not belong to this user",
          status: HTTP_STATUS.FORBIDDEN,
        };
      }

      const deletedAddress = await this.addressRepository.deleteAddress(
        addressId
      );

      if (!deletedAddress) {
        return {
          success: false,
          message: "Failed to delete address",
          status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        };
      }

      return {
        success: true,
        message: "Address deleted successfully",
        status: HTTP_STATUS.OK,
      };
    } catch (error) {
      console.log("Error occurred while deleting address:", error);
      return {
        success: false,
        message: "Internal Server Error",
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
