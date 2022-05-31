import Mongoose from "mongoose";
import Disability from "../lib/constants/disability-enum";

type UserDisability = {
  id?: string;
  userId: string;
  disability: Disability;
  createdAt?: number;
  updatedAt?: number;
}

export default UserDisability;

const UserDisabilitySchema = new Mongoose.Schema(
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
    disability: {
      type: String,
      enum: Object.values(Disability),
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
  { collection: "user-disability" }
);

export const UserDisabilityModel = Mongoose.model("user-disability", UserDisabilitySchema);
