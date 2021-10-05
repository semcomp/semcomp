const Mongoose = require("mongoose");

const ObjectID = Mongoose.Schema.Types.ObjectId;

const RiddleGroupSchema = Mongoose.Schema(
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
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { collection: "riddle-group" }
);

module.exports = Mongoose.model("riddle-group", RiddleGroupSchema);
