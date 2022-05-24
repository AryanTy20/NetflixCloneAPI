import { number } from "joi";
import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    reqCount: { type: Number, required: true, default: 1 },
  },
  { timestamps: true }
);

OTPSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600000 });
export default mongoose.model("OTP", OTPSchema, "otp");
