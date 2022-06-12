import Mongoose from "mongoose";

const ObjectID = Mongoose.Schema.Types.ObjectId;

const MessageSchema = new Mongoose.Schema(
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

export default Mongoose.model("message", MessageSchema);
