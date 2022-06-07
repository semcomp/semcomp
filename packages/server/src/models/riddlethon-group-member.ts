import Mongoose from "mongoose";

type RiddlethonGroupMember = {
  id?: string;
  riddlethonGroupId: string;
  userId: string;
  createdAt?: number;
  updatedAt?: number;
}

export default RiddlethonGroupMember;

const RiddlethonGroupMemberSchema = new Mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    riddlethonGroupId: {
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
      default: Date.now(),
    },
    updatedAt: {
      type: Number,
      default: Date.now(),
    },
  },
  { collection: "riddlethon-group-member" }
);

export const RiddlethonGroupMemberModel = Mongoose.model(
  "riddlethon-group-member",
  RiddlethonGroupMemberSchema,
);
