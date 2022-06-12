import Mongoose from "mongoose";

type RiddlethonGroupUsedSkip = {
  id?: string;
  riddlethonGroupId: string;
  riddlethonQuestionId: string;
  createdAt?: number;
  updatedAt?: number;
}

export default RiddlethonGroupUsedSkip;

const RiddlethonGroupUsedSkipSchema = new Mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    riddlethonGroupId: {
      type: String,
      required: true,
    },
    riddlethonQuestionId: {
      type: String,
      unique: true,
      required: true,
    },
    createdAt: {
      type: Number,
    },
    updatedAt: {
      type: Number,
    },
  },
  { collection: "riddlethon-group-used-skip" }
);

export const RiddlethonGroupUsedSkipModel = Mongoose.model(
  "riddlethon-group-used-skip",
  RiddlethonGroupUsedSkipSchema,
);
