const Mongoose = require("mongoose");

const HardToClickQuestionSchema = Mongoose.Schema(
  {
    index: {
      type: Number,
      unique: true,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    imgUrl: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
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
  { collection: "hard-to-click-question" }
);

module.exports = Mongoose.model(
  "hard-to-click-question",
  HardToClickQuestionSchema
);
