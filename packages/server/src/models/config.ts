import Mongoose from "mongoose";

export type Config = {
  id?: string;
  coffeeTotal: number;
  switchBeta: boolean;
  openSignup: boolean;
  showLogin: boolean;
  openSales: boolean;
  openAchievement: boolean;
  createdAt?: number;
  updatedAt?: number;
};

const ConfigSchema = new Mongoose.Schema(
  {
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
    openSales: {
      type: Boolean,
      default: false,
    },
    openAchievement: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Number,
    },
    updatedAt: {
      type: Number,
    },
  },
  { collection: "config" },
);

export default Mongoose.model<Config>("config", ConfigSchema);
