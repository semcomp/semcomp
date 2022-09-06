import Mongoose from "mongoose";

import TShirtSize from "../lib/constants/t-shirt-size-enum";

type Payment = {
  id?: string;
  paymentIntegrationId?: number;
  userId: string;
  qrCode?: string;
  qrCodeBase64?: string;
  withSocialBenefit: boolean;
  socialBenefitNumber: string;
  tShirtSize: TShirtSize;
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
    qrCode: {
      type: String,
    },
    qrCodeBase64: {
      type: String,
    },
    withSocialBenefit: {
      type: Mongoose.Schema.Types.Boolean,
    },
    socialBenefitNumber: {
      type: String,
    },
    tShirtSize: {
      type: TShirtSize,
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

export const PaymentModel = Mongoose.model(
  "payment",
  PaymentSchema,
);
