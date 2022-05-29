import Mongoose from "mongoose";

type User = {
  id?: string;
  nusp: string;
  email: string;
  name: string;
  password?: string;
  course?: string;
  discord?: string;
  telegram?: string;
  permission?: boolean;
  resetPasswordCode?: string;
  paid?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export default User;

const UserSchema = new Mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
    },
    nusp: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
    },
    course: {
      type: String,
      default: "Não informado",
    },
    discord: {
      type: String,
      default: "Não informado",
    },
    telegram: {
      type: String,
    },
    permission: {
      type: Boolean,
      default: false,
      required: true,
    },
    resetPasswordCode: {
      type: String,
    },
    paid: {
      type: Boolean,
      default: false,
      required: true,
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
  { collection: "user" }
);

UserSchema.index({ nusp: 1, email: 1 }, { unique: true });

export const UserModel = Mongoose.model("user", UserSchema);
