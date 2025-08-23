export interface IBookingDetails {
  _id: string;

  serviceId: {
    _id: string;
    name: string;
    price: number;
    description: string;
    image: string;
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
    paymentStatus: string;
    amountPaid: number;
    refundStatus: string;
    refundDate: Date;
    refundAmount: number;
    fixifyShare: number;
    technicianShare: number;
    technicianPaid: boolean;
    technicianPaidAt: Date;
    creditReleaseDate: Date;
  };

  bookingStatus?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
