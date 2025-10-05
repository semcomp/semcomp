import Mongoose from "mongoose";

import Game from "../lib/constants/game-enum";

type GameQuestion = {
  id?: string;
  game: Game;
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

export default GameQuestion;

const GameQuestionSchema = new Mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    game: {
      type: Game,
      default: Game.RIDDLE,
      required: true,
    },
    index: {
      type: Number,
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
  { collection: "game-question" }
);

GameQuestionSchema.index({ game: 1, index: 1 }, { unique: true });

export const GameQuestionModel = Mongoose.model(
  "game-question",
  GameQuestionSchema,
);
