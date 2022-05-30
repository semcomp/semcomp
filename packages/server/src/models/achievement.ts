import Mongoose from "mongoose";

import AchievementCategories from "../lib/constants/achievement-categories-enum";
import AchievementTypes from "../lib/constants/achievement-types-enum";
import EventTypes from "../lib/constants/event-types-enum";

type Achievement = {
  id?: string;
  title: string,
  description: string,
  startDate: number,
  endDate: number,
  type: AchievementTypes,
  minPercentage: number,
  category: AchievementCategories,
  eventId: string,
  eventType: EventTypes,
  numberOfPresences: number,
  numberOfAchievements: number,
  createdAt?: number;
  updatedAt?: number;
}

export default Achievement;

const AchievementSchema = new Mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
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
      enum: Object.values(AchievementTypes),
      required: true,
      default: AchievementTypes.INDIVIDUAL,
    },
    minPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    category: {
      type: String,
      enum: Object.values(AchievementCategories),
      required: true,
      default: AchievementCategories.MANUAL,
    },
    eventId: {
      type: String,
    },
    eventType: {
      type: String,
      enum: Object.values(EventTypes),
      default: EventTypes.PALESTRA,
    },
    numberOfPresences: {
      type: Number,
      min: 0,
    },
    numberOfAchievements: {
      type: Number,
      min: 0,
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
  { collection: "achievement" }
);

export const AchievementModel = Mongoose.model("achievement", AchievementSchema);
