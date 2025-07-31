export interface ICronService {
  startCronJobs(): Promise<void>;
  stopCronJobs(): Promise<void>;
  triggerSubscriptionCheck(): Promise<void>;
  triggerWalletCredits(): Promise<void>;
}
