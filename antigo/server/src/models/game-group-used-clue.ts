import Mongoose from "mongoose";

type GameGroupUsedClue = {
  id?: string;
  gameGroupId: string;
  gameQuestionId: string;
  createdAt?: number;
  updatedAt?: number;
}

export default GameGroupUsedClue;

const GameGroupUsedClueSchema = new Mongoose.Schema(
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
  { collection: "game-group-used-clue" }
);

export const GameGroupUsedClueModel = Mongoose.model(
  "game-group-used-clue",
  GameGroupUsedClueSchema,
);
