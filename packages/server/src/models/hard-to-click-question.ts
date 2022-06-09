import Mongoose from "mongoose";

type HardToClickQuestion = {
  id?: string;
  index: number;
  title: string;
  question: string;
  imgUrl: string;
  clue: string;
  answer: string;
  isLegendary: boolean;
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
    title: {
      type: String,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    imgUrl: {
      type: String,
    },
    clue: {
      type: String,
    },
    answer: {
      type: String,
      required: true,
    },
    isLegendary: {
      type: Mongoose.Schema.Types.Boolean,
      default: false,
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
