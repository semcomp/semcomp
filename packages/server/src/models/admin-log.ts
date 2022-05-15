import Mongoose from "mongoose";

const ObjectID = Mongoose.Schema.Types.ObjectId;

const AdminLogSchema = new Mongoose.Schema(
  {
    user: {
      type: ObjectID,
      ref: "user",
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
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { collection: "admin-log" }
);

export default Mongoose.model("admin-log", AdminLogSchema);
