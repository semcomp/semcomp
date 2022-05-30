import Mongoose from "mongoose";

type Attendance = {
  id?: string;
  eventId: string;
  userId: string;
  createdAt?: number;
  updatedAt?: number;
}

export default Attendance;

const AttendanceSchema = new Mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    eventId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
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
  { collection: "attendance" }
);

export const AttendanceModel = Mongoose.model("attendance", AttendanceSchema);
