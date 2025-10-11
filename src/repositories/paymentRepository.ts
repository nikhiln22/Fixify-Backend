import { IPaymentRepository } from "../interfaces/Irepositories/IpaymentRepository";
import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository";
import payment from "../models/paymentModel";
import { IPayment } from "../interfaces/Models/Ipayment";
import {
  CreatePaymentData,
  FormattedEarningsResult,
  ProjectedEarningsResult,
  UpdatePaymentData,
} from "../interfaces/DTO/IRepository/IpayementRepository";
import mongoose, { FilterQuery, Types } from "mongoose";

@injectable()
export class PaymentRepository
  extends BaseRepository<IPayment>
  implements IPaymentRepository
{
  constructor() {
    super(payment);
  }

  async createPayment(paymentData: CreatePaymentData): Promise<IPayment> {
    try {
      console.log(
        "entering to the create payment method in the payment repository"
      );
      console.log("paymentData in the createPayment Method:", paymentData);

      const mongoPaymentData: Partial<IPayment> = {};

      mongoPaymentData.technicianId = new Types.ObjectId(
        paymentData.technicianId
      );
      mongoPaymentData.amountPaid = paymentData.amountPaid;
      mongoPaymentData.paymentMethod = paymentData.paymentMethod;
      mongoPaymentData.paymentStatus = paymentData.paymentStatus;

      if (paymentData.userId) {
        mongoPaymentData.userId = new Types.ObjectId(paymentData.userId);
      }
      if (paymentData.bookingId) {
        mongoPaymentData.bookingId = new Types.ObjectId(paymentData.bookingId);
      }
      if (paymentData.subscriptionPlanId) {
        mongoPaymentData.subscriptionPlanId = new Types.ObjectId(
          paymentData.subscriptionPlanId
        );
      }

      if (paymentData.originalAmount) {
        mongoPaymentData.originalAmount = paymentData.originalAmount;
      }

      if (paymentData.offerId) {
        mongoPaymentData.offerId = new Types.ObjectId(paymentData.offerId);
      }

      if (paymentData.couponId) {
        mongoPaymentData.couponId = new Types.ObjectId(paymentData.couponId);
      }

      if (paymentData.fixifyShare !== undefined) {
        mongoPaymentData.fixifyShare = paymentData.fixifyShare;
      }
      if (paymentData.technicianShare !== undefined) {
        mongoPaymentData.technicianShare = paymentData.technicianShare;
      }

      if (paymentData.creditReleaseDate !== undefined) {
        mongoPaymentData.creditReleaseDate = paymentData.creditReleaseDate;
      }

      const newPayment = await this.create(mongoPaymentData);
      return newPayment;
    } catch (error) {
      console.log("error occurred while creating a payment:", error);
      throw error;
    }
  }

  async findByBookingId(bookingId: string): Promise<IPayment | null> {
    try {
      console.log(
        "entering to the payment repository that fetches the payment by bookingId"
      );
      console.log("searching for payment with bookingId:", bookingId);

      const mongoBookingId = new Types.ObjectId(bookingId);

      const payment = await this.findOne({ bookingId: mongoBookingId });
      console.log("found payment:", payment);
      return payment;
    } catch (error) {
      console.log(
        "error occurred while fetching the payment by bookingId:",
        error
      );
      throw error;
    }
  }

  async updatePayment(
    paymentId: string,
    updateData: UpdatePaymentData
  ): Promise<IPayment | null> {
    try {
      console.log("updating payment in payment repository");
      console.log("paymentId:", paymentId);
      console.log("updateData:", updateData);

      const updatedPayment = await this.updateOne(
        { _id: new Types.ObjectId(paymentId) },
        updateData
      );

      console.log("payment updated successfully");
      return updatedPayment;
    } catch (error) {
      console.log("error occurred while updating payment:", error);
      throw error;
    }
  }

  async findPaymentsReadyForCredit(): Promise<IPayment[]> {
    try {
      console.log("Finding payments ready for credit release...");

      const currentDate = new Date();

      const payments = await this.findAll({
        creditReleaseDate: { $lte: currentDate },
        technicianPaid: false,
        paymentStatus: "Paid",
        technicianShare: { $exists: true, $gt: 0 },
      });

      console.log(`Found ${payments.length} payments ready for credit`);
      return payments;
    } catch (error) {
      console.log("Error finding payments ready for credit:", error);
      throw error;
    }
  }

  async getTotalRevenue(): Promise<number> {
    try {
      console.log(
        "entered to the payment repository that calculates total revenue"
      );

      const revenueResult = await this.model.aggregate([
        {
          $match: {
            paymentStatus: "Paid",
            refundStatus: "Not Refunded",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $cond: [
                  { $ifNull: ["$bookingId", false] },
                  "$fixifyShare",
                  "$amountPaid",
                ],
              },
            },
          },
        },
      ]);

      const totalRevenue =
        revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
      console.log("calculated total revenue:", totalRevenue);
      return totalRevenue;
    } catch (error) {
      console.log("error occurred while calculating total revenue:", error);
      return 0;
    }
  }

  async getRevenueByDays(
    days: number
  ): Promise<Array<{ date: string; revenue: number }>> {
    try {
      console.log("fetching revenue trends from payment repository:", days);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const result = await this.model.aggregate([
        {
          $match: {
            paymentStatus: "Paid",
            refundStatus: "Not Refunded",
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            revenue: {
              $sum: {
                $cond: [
                  { $ne: ["$bookingId", null] },
                  "$fixifyShare",
                  "$amountPaid",
                ],
              },
            },
          },
        },
        {
          $project: {
            date: "$_id",
            revenue: 1,
            _id: 0,
          },
        },
        {
          $sort: { date: 1 },
        },
      ]);

      console.log("revenue trends result:", result);
      return result;
    } catch (error) {
      console.log("error in getRevenueByDays repository:", error);
      return [];
    }
  }

  async getTechnicianEarnings(
    technicianId: string,
    period: "daily" | "weekly" | "monthly" | "yearly",
    startDate?: Date,
    endDate?: Date
  ): Promise<FormattedEarningsResult[]> {
    try {
      console.log(`Fetching ${period} earnings for technician:`, technicianId);

      const matchConditions: FilterQuery<IPayment> = {
        technicianId: new mongoose.Types.ObjectId(technicianId),
        paymentStatus: "Paid",
        technicianPaid: true,
        technicianShare: { $exists: true, $gt: 0 },
      };

      if (!startDate || !endDate) {
        const now = new Date();
        endDate = now;

        switch (period) {
          case "daily":
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          case "weekly":
            startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
            break;
          case "monthly":
            startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
            break;
          case "yearly":
            startDate = new Date(now.getFullYear() - 3, 0, 1);
            break;
        }
      }

      matchConditions.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };

      const createGroupId = (period: string): Record<string, unknown> => {
        switch (period) {
          case "daily":
            return {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            };
          case "weekly":
            return {
              year: { $year: "$createdAt" },
              week: { $week: "$createdAt" },
            };
          case "monthly":
            return {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            };
          case "yearly":
            return {
              year: { $year: "$createdAt" },
            };
          default:
            throw new Error(`Invalid period: ${period}`);
        }
      };

      const createDateFormat = (period: string): Record<string, unknown> => {
        switch (period) {
          case "daily":
            return {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: "$_id.day",
              },
            };
          case "weekly":
            return {
              $concat: [
                { $toString: "$_id.year" },
                "-W",
                {
                  $cond: {
                    if: { $gt: ["$_id.week", 0] },
                    then: { $toString: "$_id.week" },
                    else: "1",
                  },
                },
              ],
            };
          case "monthly":
            return {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: 1,
              },
            };
          case "yearly":
            return {
              $dateFromParts: {
                year: "$_id.year",
                month: 1,
                day: 1,
              },
            };
          default:
            throw new Error(`Invalid period: ${period}`);
        }
      };

      const groupId = createGroupId(period);
      const dateFormat = createDateFormat(period);

      const earnings = await this.model.aggregate<ProjectedEarningsResult>([
        {
          $match: matchConditions,
        },
        {
          $lookup: {
            from: "bookings",
            localField: "bookingId",
            foreignField: "_id",
            as: "booking",
          },
        },
        {
          $unwind: "$booking",
        },
        {
          $match: {
            "booking.bookingStatus": "Completed",
          },
        },
        {
          $group: {
            _id: groupId,
            totalEarnings: { $sum: "$technicianShare" },
            jobsCompleted: { $sum: 1 },
            avgEarningsPerJob: { $avg: "$technicianShare" },
            totalBookingAmount: { $sum: "$amountPaid" },
            totalFixifyShare: { $sum: "$fixifyShare" },
          },
        },
        {
          $project: {
            _id: 0,
            date: dateFormat,
            period: period,
            totalEarnings: { $round: ["$totalEarnings", 2] },
            jobsCompleted: 1,
            avgEarningsPerJob: { $round: ["$avgEarningsPerJob", 2] },
            totalBookingAmount: { $round: ["$totalBookingAmount", 2] },
            totalFixifyShare: { $round: ["$totalFixifyShare", 2] },
          },
        },
        {
          $sort: { date: 1 },
        },
      ]);

      const formattedResults: FormattedEarningsResult[] = earnings.map(
        (item) => ({
          date: item.date,
          period: item.period,
          totalEarnings: item.totalEarnings,
          jobsCompleted: item.jobsCompleted,
          avgEarningsPerJob: item.avgEarningsPerJob,
          totalBookingAmount: item.totalBookingAmount,
          totalFixifyShare: item.totalFixifyShare,
        })
      );

      return formattedResults;
    } catch (error) {
      console.log(`Error fetching ${period} earnings:`, error);
      throw error;
    }
  }

  async getTechnicianServiceCategoriesRevenue(
    technicianId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<
    Array<{
      categoryId: string;
      categoryName: string;
      revenue: number;
      jobsCount: number;
    }>
  > {
    try {
      console.log(
        `Fetching service revenue breakdown for technician:`,
        technicianId
      );

      const matchConditions: FilterQuery<IPayment> = {
        technicianId: new mongoose.Types.ObjectId(technicianId),
        paymentStatus: "Paid",
        technicianPaid: true,
        technicianShare: { $exists: true, $gt: 0 },
      };

      if (startDate && endDate) {
        matchConditions.createdAt = {
          $gte: startDate,
          $lte: endDate,
        };
      }

      const serviceRevenue = await this.model.aggregate([
        {
          $match: matchConditions,
        },
        {
          $lookup: {
            from: "bookings",
            localField: "bookingId",
            foreignField: "_id",
            as: "booking",
          },
        },
        {
          $unwind: "$booking",
        },
        {
          $match: {
            "booking.bookingStatus": "Completed",
          },
        },
        {
          $lookup: {
            from: "services",
            localField: "booking.serviceId",
            foreignField: "_id",
            as: "service",
          },
        },
        {
          $unwind: "$service",
        },
        {
          $group: {
            _id: {
              serviceId: "$service._id",
              serviceName: "$service.name",
            },
            revenue: { $sum: "$technicianShare" },
            jobsCount: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            serviceId: "$_id.serviceId",
            serviceName: "$_id.serviceName",
            revenue: { $round: ["$revenue", 2] },
            jobsCount: 1,
          },
        },
        {
          $sort: { revenue: -1 },
        },
      ]);

      return serviceRevenue;
    } catch (error) {
      console.log("Error fetching service revenue breakdown:", error);
      throw error;
    }
  }
}
