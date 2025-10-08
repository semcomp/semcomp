import Mongoose, { Document } from "mongoose";

import Tier from "../lib/constants/tier-enum";

type Item = {
  id?: string;
  name: string;
  value: number;
  maxQuantity: number;
  tier: Tier;
  tierQuantity?: number;
  totalQuantity?: number;
}

export default Item;

export interface ItemDocument extends Omit<Item, 'id'>, Document {}

const itemSchema = new Mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            required: true,
        },
        value: {
            type: Number,
            required: true,
            min: 0,
        },
        maxQuantity: {
            type: Number,
            required: true,
            min: 1,
        },
        tier: {
            type: String,
            enum: Object.values(Tier),
            default: Tier.TIER1,
            required: true
        },
        tierQuantity: {
            type: Number,
            default: 0,
        },
        totalQuantity: {
            type: Number,
            default: 0,
        },
    },
    { collection : "item" }
);

export const ItemModel = Mongoose.model<ItemDocument>("item", itemSchema);
