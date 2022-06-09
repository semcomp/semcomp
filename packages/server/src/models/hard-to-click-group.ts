import Mongoose from "mongoose";

type HardToClickGroup = {
  id?: string;
  name: string;
  availableClues?: number;
  availableSkips?: number;
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
    availableClues: {
      type: Number,
      default: 0,
    },
    availableSkips: {
      type: Number,
      default: 0,
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
