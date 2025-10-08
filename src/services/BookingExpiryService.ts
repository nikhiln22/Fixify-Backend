import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../interfaces/Irepositories/IbookingRespository";
import { IBookingExpiryService } from "../interfaces/Iservices/IbookingExpiryService";

@injectable()
export class BookingExpiryService implements IBookingExpiryService {
  constructor(
    @inject("IBookingRepository")
    private _bookingRepository: IBookingRepository
  ) {}

  async deleteExpiredPendingBookings(): Promise<void> {
    try {
      console.log("Checking for expired pending bookings...");

      const now = new Date();

      const expiredBookings =
        await this._bookingRepository.findExpiredPendingBookings(now);

      let deletedCount = 0;

      for (const booking of expiredBookings) {
        await this._bookingRepository.deleteBookingById(booking._id.toString());
        deletedCount++;
      }

      console.log(`Deleted ${deletedCount} expired pending bookings.`);
    } catch (error) {
      console.error("Error deleting expired pending bookings:", error);
    }
  }
}
