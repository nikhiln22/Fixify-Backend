import { IUserAddress } from "../interfaces/Models/Iaddress";
import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository";
import userAddress from "../models/addressModel";
import { IAddressRepository } from "../interfaces/Irepositories/IaddressRepository";
import { Types } from "mongoose";

@injectable()
export class AddressRepository
  extends BaseRepository<IUserAddress>
  implements IAddressRepository
{
  constructor() {
    super(userAddress);
  }
  async addAddress(addressData: IUserAddress): Promise<IUserAddress> {
    try {
      console.log("adding the user address in the address repository");
      console.log("addressData from the address repository:", addressData);
      const newAddress = await this.create(addressData);

      console.log("address addedd successfully:", newAddress);

      return newAddress;
    } catch (error) {
      console.log("Error occured while adding the new address:", error);
      throw new Error("Failed to add new Address");
    }
  }

  async getUserAddresses(userId: string): Promise<IUserAddress[]> {
    try {
      console.log("fetching user addresses from the address repository");
      console.log("userId from the address repository:", userId);

      const userObjectId = new Types.ObjectId(userId);

      const addresses = await this.find({ userId: userObjectId });

      console.log(
        "addresses fetched successfully from the address repository:",
        addresses
      );

      return addresses as IUserAddress[];
    } catch (error) {
      console.log("Error occurred while fetching user addresses:", error);
      throw new Error("Failed to fetch user addresses");
    }
  }

  async deleteAddress(addressId: string): Promise<IUserAddress | null> {
    try {
      console.log("deleting address from the address repository");
      console.log("addressId from the address repository:", addressId);

      const deletedAddress = await this.deleteOne({
        _id: new Types.ObjectId(addressId),
      });

      console.log("address deleted successfully:", deletedAddress);

      return deletedAddress;
    } catch (error) {
      console.log("Error occurred while deleting address:", error);
      throw new Error("Failed to delete address");
    }
  }
}
