import Mongoose from "mongoose";

type AdminLog = {
  id?: string;
  adminId: string;
  type: string;
  collectionName: string;
  objectBefore?: string;
  objectAfter?: string;
  createdAt?: number;
  updatedAt?: number;
}

export default AdminLog;

const AdminLogSchema = new Mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
    },
    adminId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    collectionName: {
      type: String,
      required: true,
      trim: true,
    },
    objectBefore: {
      type: String,
      default: null,
      trim: true,
    },
    objectAfter: {
      type: String,
      default: null,
      trim: true,
    },
    createdAt: {
      type: Number,
    },
    updatedAt: {
      type: Number,
    },
  },
  { collection: "admin-log" }
);

export const AdminLogModel = Mongoose.model("admin-log", AdminLogSchema);
