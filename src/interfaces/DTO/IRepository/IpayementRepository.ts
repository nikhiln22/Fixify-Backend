
export interface CreatePaymentData {
  userId: string;
  bookingId: string;
  technicianId: string;
  totalAmount: number;
  fixifyShare: number;
  technicianShare: number;
  paymentMethod: "Online" | "Wallet";
  paymentStatus: "paid" | "refunded";
  technicianPaid: boolean;
  refundStatus: "not refunded" | "refunded";
  technicianPaidAt?: Date;
  refundDate?: Date;
}
