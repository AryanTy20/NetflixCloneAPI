import mongoose from "mongoose";

const RefreshSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, required: true },
    token: { type: String }
  },
  { timestamps: true }
);

RefreshSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

export default mongoose.model("RefreshToken", RefreshSchema, "refreshtokens");
