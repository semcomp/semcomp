import Mongoose from "mongoose";

import EventTypes from "../lib/constants/event-types-enum";

type Event = {
  id?: string;
  name: string;
  description: string;
  speaker: string;
  link: string;
  maxOfSubscriptions: number;
  startDate: number;
  endDate: number;
  type: EventTypes;
  isInGroup: boolean;
  showOnSchedule: boolean;
  showOnSubscribables: boolean;
  showStream: boolean;
  needInfoOnSubscription: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export default Event;

const EventSchema = new Mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
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
      enum: Object.values(EventTypes),
      required: true,
      default: EventTypes.PALESTRA,
    },
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
      type: Number,
      default: Date.now(),
    },
    updatedAt: {
      type: Number,
      default: Date.now(),
    },
  },
  { collection: "event" }
);

export const EventModel = Mongoose.model("event", EventSchema);
