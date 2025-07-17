export interface CouponData {
  code: string;
  title: string;
  description: string;
  discount_type: "percentage" | "flat_amount";
  discount_value: number;
  max_discount?: number;
  min_booking_amount?: number;
  valid_until?: Date;
}
