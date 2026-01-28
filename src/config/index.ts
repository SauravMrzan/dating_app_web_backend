import dotenv from "dotenv";
import path from "path";
dotenv.config();

export const NODE_ENV: string = process.env.NODE_ENV || "development";
export const PORT: number = process.env.PORT
  ? parseInt(process.env.PORT)
  : 5000;
export const MONGODB_URI: string =
  process.env.MONGODB_URI || "mongodb://localhost:27017/mannmilap_backend";
// Application level constants, with fallbacks
// if .env variables are not set

export const JWT_SECRET: string = process.env.JWT_SECRET || "mannmilap";
export const JWT_EXPIRE: string = process.env.JWT_EXPIRE || "1d";
export const JWT_COOKIE_EXPIRE: number = process.env.JWT_COOKIE_EXPIRE
  ? parseInt(process.env.JWT_COOKIE_EXPIRE)
  : 7; // days

// File upload paths
export const FILE_UPLOAD_PATH: string =
  process.env.FILE_UPLOAD_PATH || "./public/uploads/";
export const MAX_FILE_UPLOAD_SIZE: number = process.env.MAX_FILE_UPLOAD_SIZE
  ? parseInt(process.env.MAX_FILE_UPLOAD_SIZE)
  : 1048576; // 1MB

// CORS Origins
export const ALLOWED_ORIGINS: string[] = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : [
      "http://localhost:5000",
      "http://localhost:5001",
      "http://192.168.1.171:5000", // Add your current IP here
      "http://10.0.2.2:5000",
    ];
