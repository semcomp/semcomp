import Mongoose from "mongoose";

type GameGroupCompletedQuestion = {
  id?: string;
  gameGroupId: string;
  gameQuestionId: string;
  createdAt?: number;
  updatedAt?: number;
}

export default GameGroupCompletedQuestion;

const GameGroupCompletedQuestionSchema = new Mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    gameGroupId: {
      type: String,
      required: true,
    },
    gameQuestionId: {
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
  { collection: "game-group-completed-question" }
);

GameGroupCompletedQuestionSchema.index({ gameGroupId: 1, gameQuestionId: 1 }, { unique: true });

export const GameGroupCompletedQuestionModel = Mongoose.model(
  "game-group-completed-question",
  GameGroupCompletedQuestionSchema,
);
