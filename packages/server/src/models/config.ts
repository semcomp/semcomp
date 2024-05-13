import Mongoose from "mongoose";
import KitOption from "../lib/constants/kit-option";

export type Config = {
    id?: string;
    coffeeQuantity: number;
    coffeeTotal: number;
    switchBeta: boolean;
    openSignup: boolean;
    showLogin: boolean;
    kitOption: KitOption;
    openBuy: boolean;
    createdAt?: number;
    updatedAt?: number;
};

const ConfigSchema = new Mongoose.Schema(
  {
    coffeeQuantity: {
      type: Number,
    },
    coffeeTotal: {
      type: Number,
      required: true,
    },
    switchBeta: {
      type: Boolean,
      default: false,
    },
    openSignup: {
      type: Boolean,
      default: false,
    },
    showLogin: {
        type: Boolean,
        default: false,
    },
    openBuy: {
      type: Boolean,
      default: false,
  },
    kitOption: {
      type: KitOption,
      required: true,
      default: KitOption.COFFEE,
    },
    createdAt: {
      type: Number,
    },
    updatedAt: {
      type: Number,
    },
  },
  { collection: "config" }
);

export default Mongoose.model<Config>("config", ConfigSchema);
