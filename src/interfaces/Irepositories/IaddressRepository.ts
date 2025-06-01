import { IUserAddress } from "../Models/Iaddress";

export interface IAddressRepository {
  addAddress(addressData: IUserAddress): Promise<IUserAddress>;
  getUserAddresses(userId: string): Promise<IUserAddress[]>;
  deleteAddress(addressId: string): Promise<IUserAddress | null>;
  findById(id: string): Promise<IUserAddress | null>;
}
