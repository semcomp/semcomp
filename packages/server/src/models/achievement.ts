import Mongoose from "mongoose";

import eventTypeEnum from "./../lib/constants/event-type-enum";

const AchievementSchema = new Mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
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
      enum: ["Individual", "Casa"],
      required: true,
      default: "Individual",
    },
    minPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    category: {
      type: String,
      enum: [
        "Manual",
        "Presença em Evento",
        "Presença em Tipo de Evento",
        "Número de Conquistas",
      ],
      required: true,
      default: "Manual",
    },
    event: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: "event",
    },
    eventType: {
      type: String,
      enum: Object.values(eventTypeEnum),
      default: eventTypeEnum.PALESTRA,
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
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { collection: "achievement" }
);

export default Mongoose.model("achievement", AchievementSchema);
