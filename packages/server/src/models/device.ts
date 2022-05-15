import Mongoose from "mongoose";

const ObjectID = Mongoose.Schema.Types.ObjectId;

const DeviceSchema = new Mongoose.Schema(
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

export default Mongoose.model("device", DeviceSchema);
