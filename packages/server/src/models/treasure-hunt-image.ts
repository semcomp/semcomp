import Mongoose from "mongoose";

import Status from "../lib/constants/status-treasure-hunt-image";

type TreasureHuntImage = {
  id: string;
  place?: string;
  status: Status;
  imgUrl?: string;
  createdAt?: number;
  updatedAt?: number;
};

export default TreasureHuntImage;

const TreasureHuntImageSchema = new Mongoose.Schema<TreasureHuntImage>(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    place: {
      type: String,
    },
    status: {
      type: String,
      default: Status.BLOCKED,
      required: true,
      enum: Object.values(Status),
    },
    imgUrl: {
      type: String,
    },
    createdAt: {
      type: Number,
    },
    updatedAt: {
      type: Number,
    },
  },
  { collection: "treasure-hunt-image" }
);

export const TreasureHuntImageModel = Mongoose.model<TreasureHuntImage>(
  "treasure-hunt-image",
  TreasureHuntImageSchema
);
