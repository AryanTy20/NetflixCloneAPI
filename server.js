import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
//basic
const app = express();
const PORT = process.env.PORT;
app.use(express.json());
const allowedOrigin = [
  "http://localhost:3000",
  "https://netflixclon3.netlify.app"
];
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(cookieParser());
//app

import { authRouter, productRouter } from "./routes";
import errorHandler from "./middleware/errorHandler";
import dbconnect from "./DbConnect";
// import deleteNonActive from "./controller/auth/autodelete";
// import schedule from "node-schedule";

dbconnect();
// schedule.scheduleJob("*/5  * * * *", () => deleteNonActive());
app.use("/", productRouter);
app.use("/auth", authRouter);
app.use(errorHandler);
app.use("*", (req, res, next) => {
  res.status(404).json({ msg: "page not found" });
});

app.listen(PORT, () => console.log(`server running on ${PORT}`));
