import Mongoose, { Document } from "mongoose";

import Item from "./item";

type Donation = {
    id?: string;
    houseId: string; 
    item: Item;
    quantity: number;
    points: number;
}

export default Donation;

export interface DonationDocument extends Omit<Donation, 'item' | 'id'>, Document {
    item: Mongoose.Schema.Types.ObjectId;
}

const donationSchema = new Mongoose.Schema(
    {
      houseId: {
        type: String,
        required: true,
      },
      item: {
          type: Mongoose.Schema.Types.ObjectId,
          ref: "item",
          required: true,
      },
      quantity: {
          type: Number,
          min: 1,
          required: true,
      },
      points: {
          type: Number,
          min: 1,
          required: true,
      }
    },
    { collection : "donation" }
);

export const DonationModel = Mongoose.model<DonationDocument>("donation", donationSchema);
