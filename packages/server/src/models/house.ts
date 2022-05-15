import Mongoose from "mongoose";

const HouseSchema = new Mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    telegramLink: {
      type: String,
      required: true,
    },
    members: [
      {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
    achievements: [
      {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "achievement",
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { collection: "house" }
);

export default Mongoose.model("house", HouseSchema);
