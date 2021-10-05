const Mongoose = require("mongoose");

const ObjectID = Mongoose.Schema.Types.ObjectId;

const MessageSchema = Mongoose.Schema(
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
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { collection: "message" }
);

module.exports = Mongoose.model("message", MessageSchema);
