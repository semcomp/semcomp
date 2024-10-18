import Mongoose from "mongoose";

import Game from "../lib/constants/game-enum";

type GameConfig = {
    id?: string;
    game: Game;
    title: string;
    description: string;
    rules: string;
    eventPrefix: string;
    startDate: Date;
    endDate: Date;
    hasGroups: boolean;
    maximumNumberOfMembersInGroup: number;
    createdAt?: number;
    updatedAt?: number;
}

export default GameConfig;

const GameConfigSchema = new Mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    game: {
      type: Game,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    rules: {
      type: String,
      required: true,
    },
    eventPrefix: {
      type: String,
      unique: true,
      required: true,
    },
    startDate: {
      type: Number,
      require: true,
    },
    endDate: {
      type: Number,
      require: true,
    },
    hasGroups: {
        type: Boolean,
        required: true,
    },
    maximumNumberOfMembersInGroup: {
        type: Number,
        required: true,
    },
    createdAt: {
      type: Number,
    },
    updatedAt: {
      type: Number,
    },
  },
  { collection: "game-config" }
);

export const GameConfigModel = Mongoose.model(
  "game-config",
  GameConfigSchema,
);
