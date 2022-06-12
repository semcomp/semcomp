import Mongoose from "mongoose";

const ObjectID = Mongoose.Schema.Types.ObjectId;

const RiddleGroupSchema = new Mongoose.Schema(
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
    usedClueIndexes: {
      type: [Number],
      default: [],
    },
    usedSkipIndexes: {
      type: [Number],
      default: [],
    },
    availableClues: {
      type: Number,
      default: 0,
      min: 0,
    },
    availableSkips: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdAt: {
      type: Date,
    },
    updatedAt: {
      type: Date,
    },
  },
  { collection: "riddle-group" }
);

export default Mongoose.model("riddle-group", RiddleGroupSchema);
