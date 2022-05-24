import mongoose from "mongoose";
import { DB_URL } from "./config";

const dbConnect = () => {
  mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "Connection error"));
  db.once("open", () => {
    console.log("DB CONNECTED....");
  });
};

export default dbConnect;
