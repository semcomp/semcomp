import Mongoose from "mongoose";

export type Config = {
    id?: string;
    coffeeQuantity: number;
    switchBeta: boolean;
    switchRegistration: boolean;
    showLogin: boolean;
    createdAt?: number;
    updatedAt?: number;
};

const ConfigSchema = new Mongoose.Schema(
  {
    coffeeQuantity: {
      type: Number,
      required: true,
    },
    switchBeta: {
      type: Boolean,
      default: false,
    },
    switchRegistration: {
      type: Boolean,
      default: false,
    },
    showLogin: {
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
  { collection: "config" }
);

export default Mongoose.model("config", ConfigSchema);
