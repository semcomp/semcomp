import Mongoose from "mongoose";

type UserAchievement = {
  id: string;
  userId: string;
  achievementId: string;
  createdAt?: number;
  updatedAt?: number;
};

export default UserAchievement;

const UserAchievementSchema = new Mongoose.Schema<UserAchievement>(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    userId: {
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
  { collection: "user-achievement" }
);

export const UserAchievementModel = Mongoose.model<UserAchievement>(
  "user-achievement",
  UserAchievementSchema
);
