import Mongoose from "mongoose";

type HardToClickGroupCompletedQuestion = {
  id?: string;
  hardToClickGroupId: string;
  hardToClickQuestionId: string;
  createdAt?: number;
  updatedAt?: number;
}

export default HardToClickGroupCompletedQuestion;

const HardToClickGroupCompletedQuestionSchema = new Mongoose.Schema(
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
  { collection: "hard-to-click-group-completed-question" }
);

export const HardToClickGroupCompletedQuestionModel = Mongoose.model(
  "hard-to-click-group-completed-question",
  HardToClickGroupCompletedQuestionSchema,
);
