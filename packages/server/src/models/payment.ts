import Mongoose from "mongoose";

const ObjectID = Mongoose.Schema.Types.ObjectId;

const PaymentSchema = new Mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    paymentIntegrationId: {
      type: String,
    },
    userId: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { collection: "payment" }
);

export default Mongoose.model("payment", PaymentSchema);
