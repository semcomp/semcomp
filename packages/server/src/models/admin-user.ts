import Mongoose from "mongoose";

type AdminUser = {
  id?: string;
  email: string;
  password?: string;
  adminRole?: string;
  resetPasswordCode?: string;
  createdAt?: number;
  updatedAt?: number;
}

export default AdminUser;

const AdminUserSchema = new Mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    // 0 - Root Access
    // 1 - Full Access
    adminRole: {
      type: Number,
    },
    resetPasswordCode: {
      type: String,
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
  { collection: "admin-user" }
);

export const AdminUserModel = Mongoose.model("admin-user", AdminUserSchema);
