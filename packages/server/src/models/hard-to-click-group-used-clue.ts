import Mongoose from "mongoose";

type HardToClickGroupUsedClue = {
  id?: string;
  hardToClickGroupId: string;
  hardToClickQuestionId: string;
  createdAt?: number;
  updatedAt?: number;
}

export default HardToClickGroupUsedClue;

const HardToClickGroupUsedClueSchema = new Mongoose.Schema(
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
  { collection: "hard-to-click-group-used-clue" }
);

export const HardToClickGroupUsedClueModel = Mongoose.model(
  "hard-to-click-group-used-clue",
  HardToClickGroupUsedClueSchema,
);
