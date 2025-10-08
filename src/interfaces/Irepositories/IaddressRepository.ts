import { AddAddressDto } from "../DTO/IServices/IaddressService";
import { IAddress } from "../Models/Iaddress";

export interface IAddressRepository {
  addAddress(addressData: AddAddressDto): Promise<IAddress>;
  getOwnerAddresses(
    ownerId: string,
    ownerModel: "user" | "technician"
  ): Promise<IAddress[]>;
  deleteAddress(addressId: string): Promise<IAddress | null>;
  findByOwnerAndId(
    addressId: string,
    ownerId: string,
    ownerModel: "user" | "technician"
  ): Promise<IAddress | null>;
}
