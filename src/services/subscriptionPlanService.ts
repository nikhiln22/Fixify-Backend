import { ISubscriptionPlanService } from "../interfaces/Iservices/IsubscriptionPlanService";
import { inject, injectable } from "tsyringe";
import { ISubscriptionPlan } from "../interfaces/Models/IsubscriptionPlan";
import { ISubscriptionPlanRepository } from "../interfaces/Irepositories/IsubscriptionPlanRepository";
import { ISubscriptionPlanHistory } from "../interfaces/Models/IsubscriptionPlanHistory";
import { ISubscriptionPlanHistoryRepository } from "../interfaces/Irepositories/IsubscriptionPlanHistoryRepository";
import config from "../config/env";
import { stripe } from "../config/stripeConfig";
import { IPaymentRepository } from "../interfaces/Irepositories/IpaymentRepository";
import { ITechnicianRepository } from "../interfaces/Irepositories/ItechnicianRepository";
import { CreatePaymentData } from "../interfaces/DTO/IRepository/IpayementRepository";

@injectable()
export class SubscriptionPlanService implements ISubscriptionPlanService {
  constructor(
    @inject("ISubscriptionPlanRepository")
    private _subscriptionPlanRepository: ISubscriptionPlanRepository,
    @inject("ISubscriptionPlanHistoryRepository")
    private _subscriptionPlanHistoryRepository: ISubscriptionPlanHistoryRepository,
    @inject("IPaymentRepository")
    private _paymentRepository: IPaymentRepository,
    @inject("ITechnicianRepository")
    private _technicianRepository: ITechnicianRepository
  ) {}

  async addSubscriptionPlan(data: {
    planName: string;
    commissionRate: number;
    price: number;
    WalletCreditDelay: number;
    profileBoost: boolean;
    durationInMonths: number;
    description?: string;
  }): Promise<{
    message: string;
    success: boolean;
    data?: ISubscriptionPlan;
  }> {
    try {
      console.log(
        "entering to the subscription plan service that adds the plan"
      );
      console.log("Subscription plan data:", data);

      const existingPlan =
        await this._subscriptionPlanRepository.findByPlanName(data.planName);
      if (existingPlan) {
        return {
          message: `Subscription plan '${data.planName}' already exists`,
          success: false,
        };
      }

      const result = await this._subscriptionPlanRepository.addSubscriptionPlan(
        data
      );

      console.log("result after adding the subscription plan:", result);

      return {
        message: "Subscription plan added successfully",
        success: true,
        data: result,
      };
    } catch (error) {
      console.log("error occurred while adding the subscription plan:", error);
      return {
        message: "Error occurred while adding the subscription plan",
        success: false,
      };
    }
  }

  async getAllSubscriptionPlans(options: {
    page?: number;
    limit?: number;
    search?: string;
    filterStatus?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      subscriptionPlans: ISubscriptionPlan[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
      overview: {
        activeTechnicians: number;
        paidSubscribers: number;
        monthlyRevenue: number;
      };
    };
  }> {
    try {
      console.log("Function fetching all the Subscription Plans");
      const page = options.page;
      const limit = options.limit;
      const result =
        await this._subscriptionPlanRepository.getAllSubscriptionPlans({
          page,
          limit,
          search: options.search,
          filterStatus: options.filterStatus,
        });

      console.log("result from the Subscription Plans service:", result);

      const activeTechnicians =
        await this._subscriptionPlanRepository.getActiveTechniciansCount();
      const paidSubscribers =
        await this._subscriptionPlanRepository.getPaidSubscribersCount();
      const monthlyRevenue =
        await this._subscriptionPlanRepository.getMonthlyRevenue();

      return {
        success: true,
        message: "Subscription Plans fetched successfully",
        data: {
          subscriptionPlans: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            pages: result.pages,
            limit: result.limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: result.page > 1,
          },
          overview: {
            activeTechnicians,
            paidSubscribers,
            monthlyRevenue,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching Subscription Plans:", error);
      return {
        success: false,
        message: "Something went wrong while fetching Subscription Plans",
      };
    }
  }

  async blockSubscriptionPlan(id: string): Promise<{
    message: string;
    success: boolean;
    data?: {
      _id: string;
      status: string;
    };
  }> {
    try {
      console.log("entering the service layer that blocks the coupon:", id);
      const subscriptionPlan =
        await this._subscriptionPlanRepository.findSubscriptionPlanById(id);
      console.log("coupon fetched from repository:", subscriptionPlan);

      if (!subscriptionPlan) {
        return {
          success: false,
          message: "subscription plan not found",
        };
      }

      const newStatus =
        subscriptionPlan.status === "Active" ? "Blocked" : "Active";
      const response =
        await this._subscriptionPlanRepository.blockSubscriptionPlan(
          id,
          newStatus
        );
      console.log(
        "Response after toggling subscription plan status from the coupon repository:",
        response
      );

      if (!response) {
        return {
          success: false,
          message: "failed to update the subscription plan status",
        };
      }

      return {
        success: true,
        message: `subscription plan ${subscriptionPlan.planName} ${
          newStatus === "Active" ? "unblocked" : "blocked"
        } successfully`,
        data: {
          _id: response._id,
          status: response.status,
        },
      };
    } catch (error) {
      console.error("Error toggling subscription plan status:", error);
      return {
        message: "Failed to toggle subscription plan status",
        success: false,
      };
    }
  }

  async updateSubscriptionPlan(
    id: string,
    updateData: {
      planName?: string;
      commissionRate?: number;
      price?: number;
      WalletCreditDelay?: number;
      profileBoost?: boolean;
      durationInMonths?: number;
      description?: string;
    }
  ): Promise<{
    message: string;
    success: boolean;
    data?: ISubscriptionPlan;
  }> {
    try {
      console.log(
        "entering to the subscription plan service that updates the plan"
      );
      console.log("Subscription plan ID:", id);
      console.log("Update data:", updateData);

      const existingPlan =
        await this._subscriptionPlanRepository.findSubscriptionPlanById(id);
      if (!existingPlan) {
        return {
          message: "Subscription plan not found",
          success: false,
        };
      }

      if (
        updateData.planName &&
        updateData.planName !== existingPlan.planName
      ) {
        const planWithSameName =
          await this._subscriptionPlanRepository.findByPlanName(
            updateData.planName
          );
        if (planWithSameName && planWithSameName._id.toString() !== id) {
          return {
            message: `Subscription plan '${updateData.planName}' already exists`,
            success: false,
          };
        }
      }

      const result =
        await this._subscriptionPlanRepository.updateSubscriptionPlan(
          id,
          updateData
        );

      if (!result) {
        return {
          message: "Failed to update subscription plan",
          success: false,
        };
      }

      console.log("result after updating the subscription plan:", result);

      return {
        message: "Subscription plan updated successfully",
        success: true,
        data: result,
      };
    } catch (error) {
      console.log(
        "error occurred while updating the subscription plan:",
        error
      );
      return {
        message: "Error occurred while updating the subscription plan",
        success: false,
      };
    }
  }

  async getSubscriptionHistory(options: {
    page?: number;
    limit?: number;
    search?: string;
    filterStatus?: string;
    technicianId?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      subscriptionPlanHistory: ISubscriptionPlanHistory[];
      pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 5;

      const result =
        await this._subscriptionPlanHistoryRepository.getSubscriptionPlansHistory(
          {
            page,
            limit,
            search: options.search,
            filterStatus: options.filterStatus,
            technicianId: options.technicianId,
          }
        );

      return {
        success: true,
        message: "Subscription history fetched successfully",
        data: {
          subscriptionPlanHistory: result.data,
          pagination: {
            total: result.total,
            page: result.page,
            pages: result.pages,
            limit: result.limit,
            hasNextPage: result.page < result.pages,
            hasPrevPage: result.page > 1,
          },
        },
      };
    } catch (error) {
      console.log("Error occurred while fetching subscription history:", error);
      return {
        success: false,
        message: "Error occurred while fetching subscription history",
      };
    }
  }

  async purchaseSubscriptionPlan(
    technicianId: string,
    planId: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: { checkoutUrl: string };
  }> {
    try {
      console.log(
        "entered to the subscription plan service purchase subscription plan function"
      );
      console.log("planId in the purchase subscription plan service:", planId);
      console.log(
        "technicianId in the purchase subscription plan service:",
        technicianId
      );

      const subscriptionPlan =
        await this._subscriptionPlanRepository.findSubscriptionPlanById(planId);

      console.log("found subscription plan:", subscriptionPlan);

      if (!subscriptionPlan) {
        return {
          success: false,
          message: "Subscription plan didnt found",
        };
      }

      const amountInCents = Math.round(subscriptionPlan?.price * 100);

      const getClientUrl = () => {
        if (config.NODE_ENV === "production") {
          return "https://fixify.homes";
        } else {
          return config.CLIENT_URL;
        }
      };

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: `${subscriptionPlan.planName} Subscription Plan`,
                description:
                  subscriptionPlan.description ||
                  `${subscriptionPlan.planName} plan with ${subscriptionPlan.commissionRate}% commission rate`,
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        metadata: {
          planId: planId,
          technicianId: technicianId,
          planName: subscriptionPlan.planName,
          durationInMonths: subscriptionPlan.durationInMonths.toString(),
          price: subscriptionPlan.price,
        },
        success_url: `${getClientUrl()}/technician/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${getClientUrl()}/technician/subscription?cancelled=true`,
      });

      if (!session.url) {
        return {
          success: false,
          message: "Failed to create checkout URL",
        };
      }
      return {
        success: true,
        message: "Checkout session created successfully",
        data: {
          checkoutUrl: session.url,
        },
      };
    } catch (error) {
      console.error("Error in purchaseSubscriptionPlan:", error);
      return {
        success: false,
        message: "Failed to create checkout session. Please try again.",
      };
    }
  }

  async verifyStripeSession(
    technicianId: string,
    sessionId: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: {
      currentSubscription: {
        planName: string;
        status: string;
        commissionRate: number;
        walletCreditDelay: number;
        profileBoost: boolean;
        durationInMonths: number;
        expiresAt?: string;
        amount: number;
      };
      upcomingSubscription?: {
        planName: string;
        commissionRate: number;
        walletCreditDelay: number;
        profileBoost: boolean;
        durationInMonths: number;
        amount: number;
        activatesOn?: string;
      } | null;
      newHistoryEntry: ISubscriptionPlanHistory;
    };
  }> {
    try {
      console.log(
        "entered to the subscriptionplan service that verifies the stripe session"
      );
      console.log(
        "technicianId in the subscription plan service:",
        technicianId
      );
      console.log("sessionId in the subscription plan service:", sessionId);

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (!session || session.payment_status !== "paid") {
        return {
          success: false,
          message: "Payment not completed or session not found",
        };
      }

      const planId = session.metadata?.planId;
      const amount = session.metadata?.price;

      if (!planId || !technicianId || !amount) {
        return {
          success: false,
          message: "Invalid or missing planId, amount in the session metadata",
        };
      }

      const subscriptionPlan =
        await this._subscriptionPlanRepository.findSubscriptionPlanById(planId);

      if (!subscriptionPlan) {
        return {
          success: false,
          message: "Subscription plan not found",
        };
      }

      const currentActiveSubscription =
        await this._subscriptionPlanHistoryRepository.findActiveSubscriptionByTechnicianId(
          technicianId
        );

      if (!currentActiveSubscription) {
        return {
          success: false,
          message: "No active subscription found. Please contact support.",
        };
      }

      const paymentData: CreatePaymentData = {
        technicianId: technicianId,
        subscriptionPlanId: planId,
        amountPaid: parseInt(amount),
        paymentMethod: "Online",
        paymentStatus: "Paid",
      };

      const createdPayment = await this._paymentRepository.createPayment(
        paymentData
      );

      if (!createdPayment) {
        return {
          message: "failed to complete the payment",
          success: false,
        };
      }

      if (!currentActiveSubscription.expiryDate) {
        await this._subscriptionPlanHistoryRepository.updateSubscriptionHistory(
          technicianId,
          { status: "Expired" }
        );

        const expiryDate = new Date();
        expiryDate.setMonth(
          expiryDate.getMonth() + subscriptionPlan.durationInMonths
        );

        const subscriptionHistoryData = {
          technicianId: technicianId,
          subscriptionPlanId: planId,
          amount: parseInt(amount),
          paymentId: createdPayment._id.toString(),
          status: "Active" as const,
          expiryDate: expiryDate,
          hasNextUpgrade: false,
        };

        const createdSubscriptionHistory =
          await this._subscriptionPlanHistoryRepository.createHistory(
            subscriptionHistoryData
          );

        return {
          success: true,
          message: `${subscriptionPlan.planName} plan activated successfully!`,
          data: {
            currentSubscription: {
              planName: subscriptionPlan.planName,
              status: "Active",
              commissionRate: subscriptionPlan.commissionRate,
              walletCreditDelay: subscriptionPlan.WalletCreditDelay,
              profileBoost: subscriptionPlan.profileBoost,
              durationInMonths: subscriptionPlan.durationInMonths,
              expiresAt: expiryDate.toISOString(),
              amount: parseInt(amount),
            },
            upcomingSubscription: null,
            newHistoryEntry: createdSubscriptionHistory,
          },
        };
      }
      else {
        const currentActiveSubscriptionPlan =
          await this._subscriptionPlanRepository.findSubscriptionPlanById(
            currentActiveSubscription.subscriptionPlanId.toString()
          );

        if (!currentActiveSubscriptionPlan) {
          return {
            success: false,
            message: "Current subscription plan not found",
          };
        }

        const updatedSubscription =
          await this._subscriptionPlanHistoryRepository.updateSubscriptionHistory(
            technicianId,
            {
              hasNextUpgrade: true,
              nextUpgrade: {
                planId: planId,
                amount: parseInt(amount),
                paymentId: createdPayment._id.toString(),
              },
            }
          );

        let status = "Active";
        if (currentActiveSubscription.expiryDate) {
          const isStillActive =
            new Date() <= new Date(currentActiveSubscription.expiryDate);
          status = isStillActive ? "Active" : "Expired";
        }

        return {
          success: true,
          message: `Upgrade queued successfully! Your ${subscriptionPlan.planName} plan will activate when your current subscription expires.`,
          data: {
            currentSubscription: {
              planName: currentActiveSubscriptionPlan.planName,
              status: status,
              commissionRate: currentActiveSubscriptionPlan.commissionRate,
              walletCreditDelay:
                currentActiveSubscriptionPlan.WalletCreditDelay,
              profileBoost: currentActiveSubscriptionPlan.profileBoost,
              durationInMonths: currentActiveSubscriptionPlan.durationInMonths,
              expiresAt: currentActiveSubscription.expiryDate?.toISOString(),
              amount: currentActiveSubscription.amount,
            },
            upcomingSubscription: {
              planName: subscriptionPlan.planName,
              commissionRate: subscriptionPlan.commissionRate,
              walletCreditDelay: subscriptionPlan.WalletCreditDelay,
              profileBoost: subscriptionPlan.profileBoost,
              durationInMonths: subscriptionPlan.durationInMonths,
              amount: parseInt(amount),
              activatesOn: currentActiveSubscription.expiryDate?.toISOString(),
            },
            newHistoryEntry: updatedSubscription || currentActiveSubscription,
          },
        };
      }
    } catch (error) {
      console.log("error occurred while verifying the stripe session", error);
      return {
        success: false,
        message: "Failed to verify the stripe session",
      };
    }
  }
}
