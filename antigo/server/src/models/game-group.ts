import Mongoose from "mongoose";

import Game from "../lib/constants/game-enum";

type GameGroup = {
  id?: string;
  game?: Game;
  name: string;
  availableClues?: number;
  availableSkips?: number;
  createdAt?: number;
  updatedAt?: number;
}

export default GameGroup;

const GameGroupSchema = new Mongoose.Schema(
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
    name: {
      type: String,
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

GameGroupSchema.index({ name: 1, game: 1 }, { unique: true });

export const GameGroupModel = Mongoose.model(
  "game-group",
  GameGroupSchema,
);
