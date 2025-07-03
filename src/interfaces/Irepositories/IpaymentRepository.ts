import { CreatePaymentData } from "../DTO/IRepository/IpayementRepository";
import { IPayment } from "../Models/Ipayment";

export interface IPaymentRepository {
  createPayment(paymentData: CreatePaymentData): Promise<IPayment>;
  findByBookingId(bookingId: string): Promise<IPayment | null>;
  updatePayment(
    paymentId: string,
    updateData: Partial<IPayment>
  ): Promise<IPayment | null>;
}
