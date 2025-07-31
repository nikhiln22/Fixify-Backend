import { IPaymentRepository } from "../interfaces/Irepositories/IpaymentRepository";
import { injectable } from "tsyringe";
import { BaseRepository } from "./baseRepository";
import payment from "../models/paymentModel";
import { IPayment } from "../interfaces/Models/Ipayment";
import { CreatePaymentData } from "../interfaces/DTO/IRepository/IpayementRepository";
import { Types } from "mongoose";

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
    updateData: Partial<IPayment>
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

  // In PaymentRepository.findPaymentsReadyForCredit()
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
}
