import Mongoose from "mongoose";

const ObjectID = Mongoose.Schema.Types.ObjectId;

export type Message = {
  text: string;
  user?: Mongoose.Types.ObjectId;
  group?: Mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

const MessageSchema = new Mongoose.Schema<Message>(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: ObjectID,
      ref: "user",
    },
    group: {
      type: ObjectID,
      ref: "riddlethon-group",
    },
    createdAt: {
      type: Date,
    },
    updatedAt: {
      type: Date,
    },
  },
  { collection: "message" }
);

export default Mongoose.model<Message>("message", MessageSchema);
