const Mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = Mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
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
      type: Date,
      default: Date.now(),
    },
    updatedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { collection: "admin-user" }
);

UserSchema.pre(["save", "updateOne", "findOneAndUpdate"], function (next) {
  const user = this;

  if (user.password && this.isModified("password")) {
    try {
      user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
    } catch (err) {
      return next(err);
    }
  }
  next();
});

module.exports = Mongoose.model("admin-user", UserSchema);
