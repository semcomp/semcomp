import Mongoose from "mongoose";

type RiddlethonGroupCompletedQuestion = {
  id?: string;
  riddlethonGroupId: string;
  riddlethonQuestionId: string;
  createdAt?: number;
  updatedAt?: number;
}

export default RiddlethonGroupCompletedQuestion;

const RiddlethonGroupCompletedQuestionSchema = new Mongoose.Schema(
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
      required: true,
    },
    createdAt: {
      type: Number,
    },
    updatedAt: {
      type: Number,
    },
  },
  { collection: "riddlethon-group-completed-question" }
);

export const RiddlethonGroupCompletedQuestionModel = Mongoose.model(
  "riddlethon-group-completed-question",
  RiddlethonGroupCompletedQuestionSchema,
);
