const Mongoose = require("mongoose");

const SubscriptionSchema = Mongoose.Schema(
  {
    user: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    event: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "event",
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
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { collection: "subscription" }
);

module.exports = Mongoose.model("subscription", SubscriptionSchema);
