import Mongoose from "mongoose";

type HardToClickGroup = {
  id?: string;
  name: string;
  createdAt?: number;
  updatedAt?: number;
}

export default HardToClickGroup;

const HardToClickGroupSchema = new Mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    name: {
      type: String,
      unique: true,
      required: true,
      trim: true,
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
  { collection: "hard-to-click-group" }
);

export const HardToClickGroupModel = Mongoose.model(
  "hard-to-click-group",
  HardToClickGroupSchema,
);
