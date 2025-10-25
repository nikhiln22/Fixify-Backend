export interface IBookingDetails {
  _id: string;

  serviceId: {
    _id: string;
    name: string;
    description: string;
    serviceType: "fixed" | "hourly";
    price: number;
    bookingAmount: number;
    hourlyRate: number;
    image: string;
    category: {
      _id: string;
      name: string;
    };
    designation: {
      _id: string;
      designation: string;
    };
    status: string;
    estimatedTime?: number;
    maxHours?: number;
  };

  userId: {
    _id: string;
    username: string;
    email: string;
    phone: number;
  };

  technicianId: {
    _id: string;
    username: string;
    email: string;
    phone: number;
    image: string;
    is_verified: boolean;
    yearsOfExperience: number;
    Designation: {
      _id: string;
      designation: string;
    };
  };

  addressId: {
    _id: string;
    fullAddress: string;
    landmark: string;
    addressType: string;
  };

  timeSlotId: {
    _id: string;
    date: Date;
    startTime: string;
    endTime: string;
  };

  paymentId: {
    _id: string;
    paymentMethod: string;
    paymentStatus: "Partial Paid" | "Paid" | "Refunded";
    amountPaid: number;
    refundStatus: string;
    refundDate: Date;
    refundAmount: number;
    fixifyShare: number;
    technicianShare: number;
    technicianPaid: boolean;
    technicianPaidAt: Date;
    creditReleaseDate: Date;
    partsAmount?: number;
    originalAmount?: number;
    offerDiscount?: number;
    couponDiscount?: number;
    offerId?: {
      _id: string;
      title: string;
      description: string;
      discountPercentage?: number;
      discountAmount?: number;
      offerType: string;
    };
    couponId?: {
      _id: string;
      code: string;
      discountType: string;
      discountValue: number;
      maxDiscount?: number;
      minPurchaseAmount?: number;
    };
  };

  serviceStartTime?: Date;
  serviceEndTime?: Date;
  bookingStatus: string;
  actualDuration?: number;
  finalServiceAmount?: number;
  hasReplacementParts?: boolean;
  replacementPartsApproved?: boolean | null;
  replacementParts?: Array<{
    _id: string;
    name: string;
    description: string;
    price: number;
    services: string[];
    status: string;
  }>;
  partsQuantities?: Map<string, number>;
  totalPartsAmount?: number;
  bookingAmount?: number;
  cancellationReason?: string;
  cancelledBy?: string;
  cancellationDate?: Date;
  isRated?: boolean;
}

export interface BookingUpdateData {
  bookingStatus?: string;
  serviceStartTime?: Date;
  serviceEndTime?: Date;
  actualDuration?: number;
  finalServiceAmount?: number;
}

export interface StartServiceResponseData {
  bookingId: string;
  bookingStatus: string;
}

export interface CompleteFinalPaymentRequest {
  paymentMethod: string;
  finalAmount: number;
  offerId?: string;
  couponId?: string;
}

export interface CompleteFinalPaymentResponse {
  success: boolean;
  message: string;
  data?: {
    booking?: IBookingDetails;
    checkoutUrl?: string | null;
    requiresPayment?: boolean;
    paymentMethod?: string;
    paymentCompleted?: boolean;
  };
}
