import Mongoose from "mongoose";

const ObjectID = Mongoose.Schema.Types.ObjectId;

const HardToClickGroupSchema = new Mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    members: [
      {
        type: ObjectID,
        ref: "user",
      },
    ],
    completedQuestionsIndexes: {
      type: Array,
      default: [],
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
  { collection: "hard-to-click-group" }
);

export default Mongoose.model("hard-to-click-group", HardToClickGroupSchema);
