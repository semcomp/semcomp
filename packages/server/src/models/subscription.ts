import Mongoose from "mongoose";

type Subscription = {
  id?: string;
  eventId: string;
  userId: string;
  info: object;
  hasGroup: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export default Subscription;

const SubscriptionSchema = new Mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    eventId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    info: {
      type: Object,
    },
    hasGroup: {
      type: Mongoose.Schema.Types.Boolean,
      default: false,
    },
    createdAt: {
      type: Number,
    },
    updatedAt: {
      type: Number,
    },
  },
  { collection: "subscription" }
);

export const SubscriptionModel = Mongoose.model("subscription", SubscriptionSchema);
