export interface CreatePaymentData {
  userId?: string;
  bookingId?: string;
  technicianId: string;
  subscriptionPlanId?: string;
  amountPaid: number;
  fixifyShare?: number;
  technicianShare?: number;
  paymentMethod: "Online" | "Wallet";
  paymentStatus: "Paid" | "Refunded";
  technicianPaid?: boolean;
  refundStatus?: "Not Refunded" | "Refunded";
  refundAmount?: number;
  technicianPaidAt?: Date;
  refundDate?: Date;
  creditReleaseDate?: Date;
}
