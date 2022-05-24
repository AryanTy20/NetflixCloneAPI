import mongoose from "mongoose";
import crypto from "crypto";

const users = new mongoose.Schema({
  username: { type: String },
  imgUrl: { type: String },
});

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    subUsers: [users],
    password: { type: String, required: true },
    active: { type: Boolean, default: false },
    salt: { type: String },
  },
  { timestamps: true }
);

UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.password = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, `sha512`)
    .toString(`hex`);
};

UserSchema.methods.validPassword = function (password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, `sha512`)
    .toString(`hex`);
  return this.password === hash;
};

UserSchema.methods.updateByIndex = function (index, data) {
  this.subUsers[index] = data;
};

export default mongoose.model("User", UserSchema, "users");
