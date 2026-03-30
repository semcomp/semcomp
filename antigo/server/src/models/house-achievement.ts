import Mongoose from "mongoose";

type HouseAchievement = {
  id?: string;
  houseId: string;
  achievementId: string;
  createdAt?: number;
  updatedAt?: number;
}

export default HouseAchievement;

const HouseAchievementSchema = new Mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    houseId: {
      type: String,
      required: true,
    },
    achievementId: {
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
  { collection: "house-achievement" }
);

export const HouseAchievementModel = Mongoose.model("house-achievement", HouseAchievementSchema);
