import Mongoose from "mongoose";

type House = {
  id?: string;
  name: string;
  description: string;
  telegramLink: string;
  score: number;
  imageBase64: string;
  createdAt?: number;
  updatedAt?: number;
}

export default House;

const HouseSchema = new Mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    telegramLink: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
    imageBase64: {
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
  { collection: "house" }
);

export const HouseModel = Mongoose.model("house", HouseSchema);
