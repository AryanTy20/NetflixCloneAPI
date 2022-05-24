import mongoose from "mongoose";

const WishSchema = new mongoose.Schema({
  id: { type: String, required: true },
  list: [{ type: Object }],
});

export default mongoose.model("Wishlist", WishSchema, "wishlist");
