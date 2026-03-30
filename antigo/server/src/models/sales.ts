import Mongoose from "mongoose";

import SaleType from "../lib/constants/sales-types-enum";

type Sale = {
  id?: string;
  name?: string;
  type: SaleType;
  quantity?: number;
  items?: string[];
  price?: number;
  hasTShirt: boolean;
  hasKit: boolean;
  hasCoffee: boolean;
  allowHalfPayment: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export default Sale;

const SaleSchema = new Mongoose.Schema(
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
    type: {
      type: SaleType,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    items: {
      type: [String],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    hasTShirt: {
      type: Boolean,
      required: true,
    },
    hasKit: {
      type: Boolean,
      required: true,
    },
    hasCoffee: {
      type: Boolean,
      required: true,
    },
    allowHalfPayment: {
      type: Boolean,
      required: true,
    },
    createdAt: {
      type: Number,
    },
    updatedAt: {
      type: Number,
    },
  },
  { collection: "sales" }
);

export const SaleModel = Mongoose.model(
  "sales",
  SaleSchema,
);
