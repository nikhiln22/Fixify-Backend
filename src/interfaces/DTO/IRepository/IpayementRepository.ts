export interface CreatePaymentData {
  userId?: string;
  bookingId?: string;
  technicianId: string;
  subscriptionPlanId?: string;
  originalAmount?: number;
  amountPaid: number;
  offerId?: string;
  couponId?: string;
  fixifyShare?: number;
  technicianShare?: number;
  paymentMethod: "Online" | "Wallet";
  paymentStatus: "Paid" | "Refunded" | "Partial Paid";
  technicianPaid?: boolean;
  refundStatus?: "Not Refunded" | "Refunded";
  refundAmount?: number;
  technicianPaidAt?: Date;
  refundDate?: Date;
  advanceAmount?: number;
  creditReleaseDate?: Date;
}

export interface EarningsGroupId {
  year: number;
  month?: number;
  day?: number;
  week?: number;
}

export interface EarningsAggregationResult {
  _id: EarningsGroupId;
  totalEarnings: number;
  jobsCompleted: number;
  avgEarningsPerJob: number;
  totalBookingAmount: number;
  totalFixifyShare: number;
}

export interface ProjectedEarningsResult {
  date: Date | string;
  period: string;
  totalEarnings: number;
  jobsCompleted: number;
  avgEarningsPerJob: number;
  totalBookingAmount: number;
  totalFixifyShare: number;
}

export interface FormattedEarningsResult {
  date: Date | string;
  period: string;
  totalEarnings: number;
  jobsCompleted: number;
  avgEarningsPerJob: number;
  totalBookingAmount: number;
  totalFixifyShare: number;
}
