import Mongoose from "mongoose";

const ObjectID = Mongoose.Schema.Types.ObjectId;

export interface Device {
  token: string;
  user?: Mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const DeviceSchema = new Mongoose.Schema<Device>(
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

export default Mongoose.model<Device>("device", DeviceSchema);
