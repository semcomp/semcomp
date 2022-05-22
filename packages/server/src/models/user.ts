import Mongoose, { NativeError } from "mongoose";
const bcrypt = require("bcryptjs");

const UserSchema = new Mongoose.Schema(
  {
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
    userTelegram: {
      type: String,
    },
    permission: {
      type: Boolean,
      default: false,
      required: true,
    },
    disabilities: [
      {
        type: String,
        enum: ["Visual", "Motora", "Auditiva", "Outra"],
      },
    ],
    resetPasswordCode: {
      type: String,
    },
    achievements: [
      {
        type: Mongoose.Schema.Types.ObjectId,
        ref: "achievement",
      },
    ],
    paid: {
      type: Boolean,
      default: false,
      required: true,
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
  { collection: "user" }
);

UserSchema.index({ nusp: 1, email: 1 }, { unique: true });

UserSchema.pre(["save", "updateOne"], function (next) {
  const user = this as any;

  if (user.password && this.isModified("password")) {
    try {
      user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
    } catch (err) {
      return next(err as NativeError);
    }
  }
  next();
});

export default Mongoose.model("user", UserSchema);
