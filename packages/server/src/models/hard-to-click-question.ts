import Mongoose from "mongoose";

type HardToClickQuestion = {
  id?: string;
  index: number;
  question: string;
  imgUrl: string;
  answer: string;
  createdAt?: number;
  updatedAt?: number;
}

export default HardToClickQuestion;

const HardToClickQuestionSchema = new Mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    index: {
      type: Number,
      unique: true,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    imgUrl: {
      type: String,
    },
    answer: {
      type: String,
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
  { collection: "hard-to-click-question" }
);

export const HardToClickQuestionModel = Mongoose.model(
  "hard-to-click-question",
  HardToClickQuestionSchema,
);
