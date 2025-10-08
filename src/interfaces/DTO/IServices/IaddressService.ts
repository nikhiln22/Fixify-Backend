export interface AddAddressDto {
  addressType?: "Work" | "Home";
  houseNumber?: string;
  landmark?: string;
  ownerModel: "user" | "technician";
  ownerId: string;
  fullAddress: string;
  longitude: number;
  latitude: number;
}

export interface AddressResponseDto {
  _id: string;
  addressType?: "Work" | "Home";
  houseNumber?: string;
  landMark?: string;
  fullAddress: string;
}

export interface OwnerAddressResponseDto {
  _id: string;
  addressType?: "Home" | "Work";
  fullAddress: string;
  houseNumber?: string;
  landmark?: string;
  latitude: number;
  longitude: number;
}
