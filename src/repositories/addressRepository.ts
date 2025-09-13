import { IAddress } from "../interfaces/Models/Iaddress";
import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository";
import address from "../models/addressModel";
import { IAddressRepository } from "../interfaces/Irepositories/IaddressRepository";
import { Types } from "mongoose";

@injectable()
export class AddressRepository
  extends BaseRepository<IAddress>
  implements IAddressRepository
{
  constructor() {
    super(address);
  }

  async addAddress(addressData: IAddress): Promise<IAddress> {
    try {
      console.log("adding the address in the address repository");
      console.log("addressData from the address repository:", addressData);
      const newAddress = await this.create(addressData);

      console.log("address added successfully:", newAddress);

      return newAddress;
    } catch (error) {
      console.log("Error occurred while adding the new address:", error);
      throw new Error("Failed to add new Address");
    }
  }

  async getOwnerAddresses(
    ownerId: string,
    ownerModel: "user" | "technician"
  ): Promise<IAddress[]> {
    try {
      console.log("fetching owner addresses from the address repository");
      console.log("ownerId from the address repository:", ownerId);
      console.log("ownerModel from the address repository:", ownerModel);

      const ownerObjectId = new Types.ObjectId(ownerId);

      const addresses = await this.find({
        ownerId: ownerObjectId,
        ownerModel: ownerModel,
      });

      console.log(
        "addresses fetched successfully from the address repository:",
        addresses
      );

      return addresses as IAddress[];
    } catch (error) {
      console.log("Error occurred while fetching owner addresses:", error);
      throw new Error("Failed to fetch owner addresses");
    }
  }

  async deleteAddress(addressId: string): Promise<IAddress | null> {
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

  async findByOwnerAndId(
    addressId: string,
    ownerId: string,
    ownerModel: "user" | "technician"
  ): Promise<IAddress | null> {
    try {
      console.log(
        "finding address by owner and ID from the address repository"
      );
      console.log("addressId:", addressId);
      console.log("ownerId:", ownerId);
      console.log("ownerModel:", ownerModel);

      const address = await this.findOne({
        _id: new Types.ObjectId(addressId),
        ownerId: new Types.ObjectId(ownerId),
        ownerModel: ownerModel,
      });

      return address;
    } catch (error) {
      console.log(
        "Error occurred while finding address by owner and ID:",
        error
      );
      throw new Error("Failed to find address");
    }
  }
}
