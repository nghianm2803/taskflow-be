const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const crypto = require("crypto");

//Create schema
const UserSchema = Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["Employee", "Manager"],
      default: "Manager",
      required: true,
    },
    avatar: { type: String, required: false, default: "" },
    tasksList: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Task" }],
    isDeleted: { type: Boolean, default: false, required: true },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.password;
  delete obj.isDeleted;
  return obj;
};

UserSchema.methods.generateToken = async function () {
  const accessToken = await jwt.sign({ _id: this._id, role: this.role }, JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
  return accessToken;
};

UserSchema.statics.generateInvitationToken = function () {
  const invitationToken = crypto.randomBytes(32).toString("hex");
  return invitationToken;
};

UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * (60 * 1000);

  return resetToken;
};

//Create and export model
const User = mongoose.model("User", UserSchema);

module.exports = User;
