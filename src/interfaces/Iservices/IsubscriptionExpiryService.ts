export interface ISubscriptionExpiryService {
  handleExpiredSubscriptions(): Promise<void>;
}
