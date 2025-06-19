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

      const mongoPaymentData: Partial<IPayment> = {
        ...paymentData,
        userId: new Types.ObjectId(paymentData.userId),
        bookingId: new Types.ObjectId(paymentData.bookingId),
        technicianId: new Types.ObjectId(paymentData.technicianId),
      };

      const newPayment = await this.create(mongoPaymentData);
      return newPayment;
    } catch (error) {
      console.log("error occured while creating an payment:", error);
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
}
