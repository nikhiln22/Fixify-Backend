import { inject, injectable } from "tsyringe";
import { ITimeSlotRepository } from "../interfaces/Irepositories/ItimeSlotRepository";
import { IReservationExpiryService } from "../interfaces/Iservices/IreservationExpiryService";

@injectable()
export class ReservationExpiryService implements IReservationExpiryService {
  constructor(
    @inject("ITimeSlotRepository")
    private _timeSlotRepository: ITimeSlotRepository
  ) {}

  async releaseExpiredReservations(): Promise<void> {
    try {
      console.log("Checking for expired reserved time slots...");

      const now = new Date();

      const expiredSlots =
        await this._timeSlotRepository.findExpiredReservedSlots(now);

      let releasedCount = 0;

      for (const slot of expiredSlots) {
        await this._timeSlotRepository.updateSlotBookingStatus(
          slot.technicianId.toString(),
          slot._id.toString(),
          {
            isReserved: false,
            reservedBy: null,
            reservationExpiry: null,
            isAvailable: true,
          }
        );
        releasedCount++;
      }

      console.log(`Released ${releasedCount} expired reserved slots`);
    } catch (error) {
      console.error("Error releasing expired reserved time slots:", error);
    }
  }
}
