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
    },
    updatedAt: {
      type: Date,
    },
  },
  { collection: "device" }
);

export default Mongoose.model("device", DeviceSchema);
