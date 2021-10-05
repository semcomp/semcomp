const Mongoose = require("mongoose");

const eventTypeEnum = require("./../lib/constants/event-type-enum");

const EventSchema = Mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    speaker: {
      type: String,
    },
    link: {
      type: String,
      required: true,
    },
    maxOfSubscriptions: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(eventTypeEnum),
      required: true,
      default: eventTypeEnum.PALESTRA,
    },
    presentUsers: [
      {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    isInGroup: {
      type: Mongoose.Schema.Types.Boolean,
      default: true,
    },
    showOnSchedule: {
      type: Mongoose.Schema.Types.Boolean,
      default: true,
    },
    showOnSubscribables: {
      type: Mongoose.Schema.Types.Boolean,
      default: true,
    },
    showStream: {
      type: Mongoose.Schema.Types.Boolean,
      default: false,
    },
    needInfoOnSubscription: {
      type: Mongoose.Schema.Types.Boolean,
      default: false,
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
  { collection: "event" }
);

module.exports = Mongoose.model("event", EventSchema);
