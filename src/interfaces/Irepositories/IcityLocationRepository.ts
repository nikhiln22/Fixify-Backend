import { ICityLocation } from "../Models/IcityLocation";

export interface ICityLocationRepository {
  getAllCities(): Promise<ICityLocation[]>;
  getLocationByCity(city: string): Promise<ICityLocation | null>;
}
