import { ISubscriptionExpiryService } from "../interfaces/Iservices/IsubscriptionExpiryService";
import { inject, injectable } from "tsyringe";
import { ISubscriptionPlanRepository } from "../interfaces/Irepositories/IsubscriptionPlanRepository";
import { ISubscriptionPlanHistoryRepository } from "../interfaces/Irepositories/IsubscriptionPlanHistoryRepository";
import { error } from "console";

@injectable()
export class SubscriptionExpiryService implements ISubscriptionExpiryService {
  constructor(
    @inject("ISubscriptionPlanRepository")
    private _subscriptionPlanRepository: ISubscriptionPlanRepository,
    @inject("ISubscriptionPlanHistoryRepository")
    private _subscriptionPlanHistoryRepository: ISubscriptionPlanHistoryRepository
  ) {}

  async handleExpiredSubscriptions(): Promise<void> {
    try {
      console.log("Running the subscription expire check:");

      const basicPlan = await this._subscriptionPlanRepository.findByPlanName(
        "Basic"
      );

      if (!basicPlan) {
        throw Error("Basic Plan not found");
      }

      const activeSubscriptionPlan =
        await this._subscriptionPlanHistoryRepository.findAllActiveSubscriptions();
      console.log("active subscription plans:", activeSubscriptionPlan);

      let expiredCount = 0;

      for (const subscription of activeSubscriptionPlan) {
        if (
          subscription.expiryDate &&
          new Date() > new Date(subscription.expiryDate)
        ) {
          const technicianId = subscription.technicianId.toString();

          await this._subscriptionPlanHistoryRepository.updateSubscriptionHistory(
            technicianId,
            { status: "Expired" }
          );

          if (subscription.hasNextUpgrade && subscription.nextUpgrade) {
            const newPlan =
              await this._subscriptionPlanRepository.findSubscriptionPlanById(
                subscription.nextUpgrade.planId.toString()
              );

            if (!newPlan) {
              throw error("no new plan found");
            }

            const newExpiryDate = new Date();

            newExpiryDate.setMonth(
              newExpiryDate.getMonth() + newPlan?.durationInMonths
            );

            await this._subscriptionPlanHistoryRepository.createHistory({
              technicianId: technicianId,
              subscriptionPlanId: subscription.nextUpgrade.planId.toString(),
              amount: subscription.nextUpgrade.amount,
              paymentId: subscription.nextUpgrade.paymentId?.toString(),
              status: "Active",
              hasNextUpgrade: false,
              expiryDate: newExpiryDate,
            });
          } else {
            await this._subscriptionPlanHistoryRepository.createHistory({
              technicianId: technicianId,
              subscriptionPlanId: basicPlan._id.toString(),
              amount: 0,
              status: "Active",
              hasNextUpgrade: false,
            });
          }

          expiredCount++;
        }
      }
      console.log(`Processed ${expiredCount} expired subscriptions`);
    } catch (error) {
      console.log("Error in subscription expiry:", error);
    }
  }
}
