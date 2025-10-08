export interface IBookingExpiryService {
  deleteExpiredPendingBookings(): Promise<void>;
  
}
