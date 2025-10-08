export interface IReservationExpiryService {
  releaseExpiredReservations(): Promise<void>;
}
