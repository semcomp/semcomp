import Mongoose from "mongoose";

import EventTypes from "../lib/constants/event-types-enum";

type Event = {
  id: string;
  name: string;
  description: string;
  speaker?: string;
  location?: string;
  link?: string;
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
};

export default Event;

const EventSchema = new Mongoose.Schema<Event>(
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
    location: {
      type: String,
    },
    link: {
      type: String,
    },
    maxOfSubscriptions: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Number,
      required: true,
    },
    endDate: {
      type: Number,
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
    },
    updatedAt: {
      type: Number,
    },
  },
  { collection: "event" }
);

export const EventModel = Mongoose.model<Event>("event", EventSchema);
