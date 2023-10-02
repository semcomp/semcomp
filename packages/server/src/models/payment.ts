import Mongoose from "mongoose";

import PaymentStatus from "../lib/constants/payment-status-enum";
import TShirtSize from "../lib/constants/t-shirt-size-enum";
import FoodOption from "../lib/constants/food-option-enum";
import KitOption from "../lib/constants/kit-option";

type Payment = {
  id?: string;
  paymentIntegrationId?: number;
  userId: string;
  status: PaymentStatus;
  qrCode?: string;
  qrCodeBase64?: string;
  withSocialBenefit: boolean;
  socialBenefitFileName: string;
  tShirtSize: TShirtSize;
  foodOption: FoodOption;
  kitOption: KitOption;
  createdAt?: number;
  updatedAt?: number;
}

export default Payment;

const PaymentSchema = new Mongoose.Schema(
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
      type: PaymentStatus,
      default: PaymentStatus.PENDING,
      required: true,
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
    createdAt: {
      type: Number,
    },
    updatedAt: {
      type: Number,
    },
    kitOption: {
      type: KitOption,
    },
  },
  { collection: "payment" }
);

export const PaymentModel = Mongoose.model(
  "payment",
  PaymentSchema,
);
