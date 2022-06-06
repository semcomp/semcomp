import Mongoose from "mongoose";

type Payment = {
  id?: string;
  paymentIntegrationId?: number;
  userId: string;
  qrCode?: string;
  qrCodeBase64?: string;
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
    createdAt: {
      type: Number,
      default: Date.now(),
    },
    updatedAt: {
      type: Number,
      default: Date.now(),
    },
  },
  { collection: "payment" }
);

export const PaymentModel = Mongoose.model(
  "payment",
  PaymentSchema,
);
