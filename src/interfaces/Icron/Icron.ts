export interface ICronService {
  startCronJobs(): Promise<void>;
  stopCronJobs(): Promise<void>;
}
