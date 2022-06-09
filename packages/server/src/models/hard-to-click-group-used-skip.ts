import Mongoose from "mongoose";

type HardToClickGroupUsedSkip = {
  id?: string;
  hardToClickGroupId: string;
  hardToClickQuestionId: string;
  createdAt?: number;
  updatedAt?: number;
}

export default HardToClickGroupUsedSkip;

const HardToClickGroupUsedSkipSchema = new Mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    hardToClickGroupId: {
      type: String,
      required: true,
    },
    hardToClickQuestionId: {
      type: String,
      unique: true,
      required: true,
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
  { collection: "hard-to-click-group-used-skip" }
);

export const HardToClickGroupUsedSkipModel = Mongoose.model(
  "hard-to-click-group-used-skip",
  HardToClickGroupUsedSkipSchema,
);
