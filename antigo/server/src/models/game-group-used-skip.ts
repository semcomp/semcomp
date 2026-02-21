import Mongoose from "mongoose";

type GameGroupUsedSkip = {
  id?: string;
  gameGroupId: string;
  gameQuestionId: string;
  createdAt?: number;
  updatedAt?: number;
}

export default GameGroupUsedSkip;

const GameGroupUsedSkipSchema = new Mongoose.Schema(
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
  { collection: "game-group-used-skip" }
);

export const GameGroupUsedSkipModel = Mongoose.model(
  "game-group-used-skip",
  GameGroupUsedSkipSchema,
);
