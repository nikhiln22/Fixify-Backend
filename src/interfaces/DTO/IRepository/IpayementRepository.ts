
export interface CreatePaymentData {
  userId: string;
  bookingId: string;
  technicianId: string;
  amountPaid: number;
  fixifyShare: number;
  technicianShare: number;
  paymentMethod: "Online" | "Wallet";
  paymentStatus: "Paid" | "Refunded";
  technicianPaid: boolean;
  refundStatus: "Not Refunded" | "Refunded";
  technicianPaidAt?: Date;
  refundDate?: Date;
}
