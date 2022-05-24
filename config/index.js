import dotenv from "dotenv";

dotenv.config();

export const {
  DEBUG_MODE,
  PORT,
  EMAIL,
  PASS,
  DB_URL,
  API_KEY,
  JWT_SIGN,
  JWT_REFRESH,
} = process.env;
