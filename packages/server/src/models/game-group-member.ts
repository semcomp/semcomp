import Mongoose from "mongoose";

type GameGroupMember = {
  id: string;
  gameGroupId: string;
  userId: string;
  createdAt?: number;
  updatedAt?: number;
};

export default GameGroupMember;

const GameGroupMemberSchema = new Mongoose.Schema<GameGroupMember>(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    gameGroupId: {
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
  { collection: "game-group-member" }
);

export const GameGroupMemberModel = Mongoose.model<GameGroupMember>(
  "game-group-member",
  GameGroupMemberSchema
);
