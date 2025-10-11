import {
  CreatePaymentData,
  FormattedEarningsResult,
  UpdatePaymentData,
} from "../DTO/IRepository/IpayementRepository";
import { IPayment } from "../Models/Ipayment";

export interface IPaymentRepository {
  createPayment(paymentData: CreatePaymentData): Promise<IPayment>;
  findByBookingId(bookingId: string): Promise<IPayment | null>;
  updatePayment(
    paymentId: string,
    updateData: UpdatePaymentData
  ): Promise<IPayment | null>;
  findPaymentsReadyForCredit(): Promise<IPayment[]>;
  getTotalRevenue(): Promise<number>;
  getRevenueByDays(
    days: number
  ): Promise<Array<{ date: string; revenue: number }>>;
  getTechnicianEarnings(
    technicianId: string,
    period: "daily" | "weekly" | "monthly" | "yearly",
    startDate?: Date,
    endDate?: Date
  ): Promise<FormattedEarningsResult[]>;
  getTechnicianServiceCategoriesRevenue(
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
  >;
}
