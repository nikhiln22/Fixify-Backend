import cron from "node-cron";
import { inject, injectable } from "tsyringe";
import { ICronService } from "../interfaces/Icron/Icron";
import { ISubscriptionExpiryService } from "../interfaces/Iservices/IsubscriptionExpiryService";
import { IWalletCreditService } from "../interfaces/Iservices/IwalletCreditService";

@injectable()
export class CronService implements ICronService {
  constructor(
    @inject("ISubscriptionExpiryService")
    private _subscriptionPlanExpiryService: ISubscriptionExpiryService,
    @inject("IWalletCreditService")
    private _walletCreditService: IWalletCreditService
  ) {}

  async startCronJobs(): Promise<void> {
    console.log("starting the cron jobs...");

    cron.schedule("0 0 * * *", async () => {
      console.log("Running the subscription expiry check...");
      await this._subscriptionPlanExpiryService.handleExpiredSubscriptions();
    });

    cron.schedule("0 1 * * *", async () => {
      console.log("Running the wallet credit processing...");
      await this._walletCreditService.processWalletCredits();
    });

    console.log("cron jobs started successfully...");
  }

  async stopCronJobs(): Promise<void> {
    const tasks = cron.getTasks();

    tasks.forEach((task) => {
      task.stop();
    });

    console.log("stopped all the cron jobs");
  }

  async triggerSubscriptionCheck(): Promise<void> {
    console.log("Manual triggering for the subscription checks");
    await this._subscriptionPlanExpiryService.handleExpiredSubscriptions();
  }

  async triggerWalletCredits(): Promise<void> {
    console.log("Manually triggering the wallet credits:");
    await this._walletCreditService.processWalletCredits();
  }
}
