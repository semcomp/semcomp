import Mongoose from "mongoose";

type RiddlethonGroupUsedClue = {
  id?: string;
  riddlethonGroupId: string;
  riddlethonQuestionId: string;
  createdAt?: number;
  updatedAt?: number;
}

export default RiddlethonGroupUsedClue;

const RiddlethonGroupUsedClueSchema = new Mongoose.Schema(
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
  { collection: "riddlethon-group-used-clue" }
);

export const RiddlethonGroupUsedClueModel = Mongoose.model(
  "riddlethon-group-used-clue",
  RiddlethonGroupUsedClueSchema,
);
