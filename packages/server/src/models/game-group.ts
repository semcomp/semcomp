import Mongoose from "mongoose";

import Game from "../lib/constants/game-enum";

type GameGroup = {
  id: string;
  game: Game;
  name: string;
  availableClues: number;
  availableSkips: number;
  createdAt?: number;
  updatedAt?: number;
};

export default GameGroup;

const GameGroupSchema = new Mongoose.Schema<GameGroup>(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    game: {
      type: String,
      default: Game.RIDDLE,
      required: true,
      enum: Object.values(Game),
    },
    name: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    availableClues: {
      type: Number,
      default: 0,
    },
    availableSkips: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Number,
    },
    updatedAt: {
      type: Number,
    },
  },
  { collection: "game-group" }
);

export const GameGroupModel = Mongoose.model<GameGroup>(
  "game-group",
  GameGroupSchema
);
