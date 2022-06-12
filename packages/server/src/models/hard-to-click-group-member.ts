import Mongoose from "mongoose";

type HardToClickGroupMember = {
  id?: string;
  hardToClickGroupId: string;
  userId: string;
  createdAt?: number;
  updatedAt?: number;
}

export default HardToClickGroupMember;

const HardToClickGroupMemberSchema = new Mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    hardToClickGroupId: {
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
  { collection: "hard-to-click-group-member" }
);

export const HardToClickGroupMemberModel = Mongoose.model(
  "hard-to-click-group-member",
  HardToClickGroupMemberSchema,
);
