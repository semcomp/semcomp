import Mongoose from "mongoose";

type RiddlethonQuestion = {
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

export default RiddlethonQuestion;

const RiddlethonQuestionSchema = new Mongoose.Schema(
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
    },
    updatedAt: {
      type: Number,
    },
  },
  { collection: "riddlethon-question" }
);

export const RiddlethonQuestionModel = Mongoose.model(
  "riddlethon-question",
  RiddlethonQuestionSchema,
);
