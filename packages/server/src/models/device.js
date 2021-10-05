const Mongoose = require("mongoose");

const ObjectID = Mongoose.Schema.Types.ObjectId;

const DeviceSchema = Mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: ObjectID,
      ref: "user",
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
  { collection: "device" }
);

module.exports = Mongoose.model("device", DeviceSchema);
