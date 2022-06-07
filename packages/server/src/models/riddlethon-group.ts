import Mongoose from "mongoose";

type RiddlethonGroup = {
  id?: string;
  name: string;
  availableClues?: number;
  availableSkips?: number;
  createdAt?: number;
  updatedAt?: number;
}

export default RiddlethonGroup;

const RiddlethonGroupSchema = new Mongoose.Schema(
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
  { collection: "riddlethon-group" }
);

export const RiddlethonGroupModel = Mongoose.model(
  "riddlethon-group",
  RiddlethonGroupSchema,
);
