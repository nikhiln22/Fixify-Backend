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
      const now = new Date();
      const istTime = now.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "medium",
      });

      console.log(`[${istTime}] Running the subscription expiry check...`);
      await this._subscriptionPlanExpiryService.handleExpiredSubscriptions();
      console.log(`[${istTime}] Completed subscription expiry check.`);
    });

    cron.schedule("0 * * * *", async () => {
      const now = new Date();
      const istTime = now.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "medium",
      });

      console.log(`[${istTime}] Running hourly wallet credit processing...`);
      await this._walletCreditService.processWalletCredits();
      console.log(`[${istTime}] Completed wallet credit processing.`);
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
}
