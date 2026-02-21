import Mongoose from "mongoose";

import TShirtSize from "../lib/constants/t-shirt-size-enum";

type TShirt = {
  id?: string;
  size: TShirtSize;
  quantity?: number;
  createdAt?: number;
  updatedAt?: number;
}

export default TShirt;

const TShirtSchema = new Mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    size: {
      type: TShirtSize,
      unique: true,
      required: true,
    },
    quantity: {
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
  { collection: "t-shirt" }
);

export const TShirtModel = Mongoose.model(
  "t-shirt",
  TShirtSchema,
);
