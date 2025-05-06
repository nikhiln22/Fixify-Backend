import { ICityLocationRepository } from "../interfaces/Irepositories/IcityLocationRepository";
import Location from "../models/cityLocationModel";
import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository";
import { ICityLocation } from "../interfaces/Models/IcityLocation";

@injectable()
export class CityLocationRepository
  extends BaseRepository<ICityLocation>
  implements ICityLocationRepository
{
  constructor() {
    super(Location);
  }

  async getAllCities(): Promise<ICityLocation[]> {
    try {
      console.log("fetching all the cities from the database");
      const cities = await this.find();
      console.log(`found ${cities.length} cities`);
      return cities;
    } catch (error) {
      console.log("error occured while fetching the cities from the database");
      throw error;
    }
  }

  async getLocationByCity(city: string): Promise<ICityLocation|null> {
    try {
      console.log(`fetching the locations for the city:${city}`);
      const locations = await this.findOne({ city: city });
      console.log(`locations found with the ${city}:`, locations);
      return locations;
    } catch (error) {
      console.log(
        "error occured while fetching the locations for the cities:",
        error
      );
      throw error
    }
  }
}
