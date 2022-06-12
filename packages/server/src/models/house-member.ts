import Mongoose from "mongoose";

type HouseMember = {
  id?: string;
  houseId: string;
  userId: string;
  createdAt?: number;
  updatedAt?: number;
}

export default HouseMember;

const HouseMemberSchema = new Mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    houseId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      unique: true,
      required: true,
    },
    createdAt: {
      type: Number,
    },
    updatedAt: {
      type: Number,
    },
  },
  { collection: "house-member" }
);

export const HouseMemberModel = Mongoose.model("house-member", HouseMemberSchema);
