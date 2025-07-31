import { ISubscriptionExpiryService } from "../interfaces/Iservices/IsubscriptionExpiryService";
import { inject, injectable } from "tsyringe";
import { ISubscriptionPlanRepository } from "../interfaces/Irepositories/IsubscriptionPlanRepository";
import { ISubscriptionPlanHistoryRepository } from "../interfaces/Irepositories/IsubscriptionPlanHistoryRepository";
import { ITechnicianRepository } from "../interfaces/Irepositories/ItechnicianRepository";
import { ISubscriptionPlanHistory } from "../interfaces/Models/IsubscriptionPlanHistory";

@injectable()
export class SubscriptionExpiryService implements ISubscriptionExpiryService {
  constructor(
    @inject("ISubscriptionPlanRepository")
    private _subscriptionPlanRepository: ISubscriptionPlanRepository,
    @inject("ISubscriptionPlanHistoryRepository")
    private _subscriptionPlanHistoryRepository: ISubscriptionPlanHistoryRepository,
    @inject("ITechnicianRepository")
    private _technicianRepository: ITechnicianRepository
  ) {}

  async handleExpiredSubscriptions(): Promise<void> {
    try {
      console.log(
        "entered the handle expired subscriptions function in the SubscriptionPlanService"
      );
      const basicPlan = await this._subscriptionPlanRepository.findByPlanName(
        "basic"
      );
      console.log("found basic plan:", basicPlan);

      if (!basicPlan) {
        throw new Error(
          "Basic plan didnt found and cannot proceed with the expired subscriptions"
        );
      }

      const activeSubscriptions =
        await this._subscriptionPlanHistoryRepository.findAllActiveSubscriptions();
      console.log("activeSubscriptions:", activeSubscriptions);

      let expiredCount = 0;

      for (const subscription of activeSubscriptions) {
        const isExpired = await this.isSubscriptionExpired(subscription);

        if (isExpired) {
          await this.expireSubscription(
            subscription,
            basicPlan?._id.toString()
          );
          expiredCount++;
        }
      }

      console.log(`found ${expiredCount} subscriptions`);
    } catch (error) {
      console.log(
        "error occured while handling the expired subscriptions:",
        error
      );
    }
  }

  private async isSubscriptionExpired(
    subscription: ISubscriptionPlanHistory
  ): Promise<boolean> {
    try {
      console.log(
        "enterd to the isSubscriptionExpired private method in the subscriptionExpiryservice"
      );
      const plan =
        await this._subscriptionPlanRepository.findSubscriptionPlanById(
          subscription.subscriptionPlanId.toString()
        );

      console.log("found Plan:", plan);

      if (!plan) {
        console.log(`plan not found for subscription ${subscription._id}`);
        return false;
      }

      if (plan?.planName === "BASIC" || plan?.durationInMonths === 0) {
        return false;
      }

      const startDate = new Date(subscription.createdAt);
      const expiryDate = new Date(startDate);

      expiryDate.setMonth(expiryDate.getMonth() + plan?.durationInMonths);

      const now = new Date();

      const isExpired = now > expiryDate;

      if (isExpired) {
        console.log(
          `subscription for the plan ${
            plan?.planName
          } expired on ${expiryDate.toISOString()}`
        );
      }

      return isExpired;
    } catch (error) {
      console.log(
        "error occured while checking an subscription is expired or not:",
        error
      );
      throw error;
    }
  }

  private async expireSubscription(
    subscription: ISubscriptionPlanHistory,
    basicPlanId: string
  ): Promise<void> {
    try {
      const technicianId = subscription.technicianId.toString();

      console.log(
        `expiring the subscription plan for the technician ${technicianId}`
      );

      await this._subscriptionPlanHistoryRepository.updateSubscriptionHistory(
        technicianId
      );

      const baicSubscriptionData = {
        technicianId: technicianId,
        subscriptionPlanId: basicPlanId,
        amount: 0,
        status: "Active" as const,
      };

      await this._subscriptionPlanHistoryRepository.createHistory(
        baicSubscriptionData
      );

      await this._technicianRepository.updateSubscriptionPlan(
        technicianId,
        basicPlanId
      );

      console.log(
        `Technician ${technicianId} successfully reverted back to the BASIC PLAN`
      );
    } catch (error) {
      console.log("error occured while checking the expired sessions", error);
      throw error;
    }
  }
}
