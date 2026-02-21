import Mongoose from "mongoose";

import AchievementCategories from "../lib/constants/achievement-categories-enum";
import AchievementTypes from "../lib/constants/achievement-types-enum";
import EventTypes from "../lib/constants/event-types-enum";

type Achievement = {
  id?: string,
  title: string,
  description: string,
  startDate: number,
  endDate: number,
  type: AchievementTypes,
  minPercentage: number,
  category: AchievementCategories,
  eventId: string,
  eventType: EventTypes | null,
  numberOfPresences: number,
  numberOfAchievements: number,
  imageBase64: string,
  createdAt?: number,
  updatedAt?: number,
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
      enum: Object.values(EventTypes).concat([null]),
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
    imageBase64: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Number,
    },
    updatedAt: {
      type: Number,
    },
  },
  { collection: "achievement" }
);

export const AchievementModel = Mongoose.model("achievement", AchievementSchema);
