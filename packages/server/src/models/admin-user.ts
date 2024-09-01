import Mongoose from "mongoose";

type AdminUser = {
  id: string;
  email: string;
  password: string;
  adminRole?: string[];
  resetPasswordCode?: string;
  createdAt?: number;
  updatedAt?: number;
};

export default AdminUser;

const AdminUserSchema = new Mongoose.Schema<AdminUser>(
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
    // Screens that admin have access
    adminRole: {
      type: [String],
    },
    resetPasswordCode: {
      type: String,
    },
    createdAt: {
      type: Number,
    },
    updatedAt: {
      type: Number,
    },
  },
  { collection: "admin-user" }
);

export const AdminUserModel = Mongoose.model<AdminUser>(
  "admin-user",
  AdminUserSchema
);
