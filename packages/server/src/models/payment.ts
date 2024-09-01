import Mongoose from "mongoose";

import PaymentStatus from "../lib/constants/payment-status-enum";
import TShirtSize from "../lib/constants/t-shirt-size-enum";
import FoodOption from "../lib/constants/food-option-enum";
import KitOption from "../lib/constants/kit-option";

type Payment = {
  id: string;
  paymentIntegrationId?: number;
  userId: string;
  status: PaymentStatus;
  qrCode?: string;
  qrCodeBase64?: string;
  withSocialBenefit?: boolean;
  socialBenefitFileName?: string;
  tShirtSize?: TShirtSize;
  foodOption?: FoodOption;
  kitOption?: KitOption;
  createdAt?: number;
  updatedAt?: number;
};

export default Payment;

const PaymentSchema = new Mongoose.Schema<Payment>(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    paymentIntegrationId: {
      type: Number,
    },
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: PaymentStatus.PENDING,
      required: true,
      enum: Object.values(PaymentStatus),
    },
    qrCode: {
      type: String,
    },
    qrCodeBase64: {
      type: String,
    },
    withSocialBenefit: {
      type: Mongoose.Schema.Types.Boolean,
    },
    socialBenefitFileName: {
      type: String,
    },
    tShirtSize: {
      type: TShirtSize,
    },
    foodOption: {
      type: FoodOption,
    },
    kitOption: {
      type: String,
      enum: Object.values(KitOption),
    },
    createdAt: {
      type: Number,
    },
    updatedAt: {
      type: Number,
    },
  },
  { collection: "payment" }
);

export const PaymentModel = Mongoose.model<Payment>("payment", PaymentSchema);
